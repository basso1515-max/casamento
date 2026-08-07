import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { generateInviteToken, hashToken } from "@/lib/security";
import { createToken, listTokens } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const tokens = await listTokens();
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Erro ao listar tokens:", error);
    return NextResponse.json(
      { message: "Não foi possível carregar os convidados." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      maxUploads?: number | null;
    };
    const name = body.name?.trim();

    if (!name || name.length > 80) {
      return NextResponse.json(
        { message: "Informe um nome de até 80 caracteres." },
        { status: 400 },
      );
    }

    let maxUploads: number | null = null;
    if (body.maxUploads !== null && body.maxUploads !== undefined) {
      const parsed = Number(body.maxUploads);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5000) {
        return NextResponse.json(
          { message: "O limite deve estar entre 1 e 5000 fotos, ou ficar em branco." },
          { status: 400 },
        );
      }
      maxUploads = parsed;
    }

    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = generateInviteToken();
      try {
        const row = await createToken({
          name,
          tokenHash: hashToken(token),
          maxUploads,
        });
        const directLink = `${new URL(request.url).origin}/enviar?t=${encodeURIComponent(token)}`;
        return NextResponse.json({
          token,
          directLink,
          guest: row,
        });
      } catch (error) {
        lastError = error;
        if (!(error instanceof Error) || !error.message.includes("23505")) {
          throw error;
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    return NextResponse.json(
      { message: "Não foi possível gerar o código." },
      { status: 500 },
    );
  }
}
