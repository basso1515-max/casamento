import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGuestSession } from "@/lib/session";
import {
  deleteStorageObject,
  publicPhotoUrl,
  registerPhoto,
} from "@/lib/supabase";

export const runtime = "nodejs";

type CompleteBody = {
  storagePath?: string;
  originalName?: string;
  contentType?: string;
  size?: number;
};

export async function POST(request: NextRequest) {
  const session = await getGuestSession();
  if (!session) {
    return NextResponse.json(
      { message: "Sua sessão expirou. Digite o código novamente." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as CompleteBody;
  const storagePath = body.storagePath || "";

  if (!storagePath.startsWith(`${session.tokenId}/`)) {
    return NextResponse.json(
      { message: "Arquivo não pertence a este código." },
      { status: 403 },
    );
  }

  if (!body.originalName || !body.contentType || !Number.isFinite(body.size)) {
    return NextResponse.json(
      { message: "Metadados do arquivo incompletos." },
      { status: 400 },
    );
  }

  try {
    await registerPhoto({
      tokenId: session.tokenId,
      storagePath,
      originalName: body.originalName,
      contentType: body.contentType,
      sizeBytes: Number(body.size),
    });

    revalidatePath("/");
    return NextResponse.json({
      ok: true,
      photoUrl: publicPhotoUrl(storagePath),
      uploaderName: session.name,
    });
  } catch (error) {
    console.error("Erro ao registrar foto:", error);

    try {
      await deleteStorageObject(storagePath);
    } catch (cleanupError) {
      console.error("Falha ao limpar upload não registrado:", cleanupError);
    }

    return NextResponse.json(
      { message: "A foto foi enviada, mas não conseguimos registrá-la na galeria." },
      { status: 500 },
    );
  }
}
