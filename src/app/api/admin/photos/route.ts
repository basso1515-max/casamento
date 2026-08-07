import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { listPhotos, publicPhotoUrl } from "@/lib/supabase";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const rows = await listPhotos(300);
    const photos = rows.map((row) => {
      const relation = Array.isArray(row.upload_tokens)
        ? row.upload_tokens[0]
        : row.upload_tokens;
      return {
        id: row.id,
        url: publicPhotoUrl(row.storage_path),
        originalName: row.original_name,
        uploadedAt: row.uploaded_at,
        uploaderName: relation?.name || "Convidado",
        sizeBytes: row.size_bytes,
      };
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Erro ao listar fotos no admin:", error);
    return NextResponse.json(
      { message: "Não foi possível carregar as fotos." },
      { status: 500 },
    );
  }
}
