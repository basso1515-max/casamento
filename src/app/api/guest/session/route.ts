import { NextRequest, NextResponse } from "next/server";
import { hashToken, normalizeToken, signSession } from "@/lib/security";
import {
  GUEST_COOKIE,
  getGuestSession,
  secureCookieOptions,
} from "@/lib/session";
import { getTokenByHash, getTokenById } from "@/lib/supabase";

export const runtime = "nodejs";

function publicTokenState(token: {
  name: string;
  uploads_used: number;
  max_uploads: number | null;
}) {
  return {
    name: token.name,
    uploadsUsed: token.uploads_used,
    maxUploads: token.max_uploads,
  };
}

export async function GET() {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const token = await getTokenById(session.tokenId);
    if (!token || !token.active) {
      const response = NextResponse.json(
        { authenticated: false, message: "Este código não está mais ativo." },
        { status: 401 },
      );
      response.cookies.set(GUEST_COOKIE, "", {
        ...secureCookieOptions,
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      ...publicTokenState(token),
    });
  } catch (error) {
    console.error("Erro ao recuperar sessão de convidado:", error);
    return NextResponse.json(
      { message: "O envio de fotos ainda não está configurado." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string };
    const normalized = normalizeToken(body.token || "");

    if (normalized.length < 8) {
      return NextResponse.json(
        { message: "Digite um código válido." },
        { status: 400 },
      );
    }

    const token = await getTokenByHash(hashToken(normalized));
    if (!token || !token.active) {
      return NextResponse.json(
        { message: "Código inválido ou desativado." },
        { status: 401 },
      );
    }

    if (
      token.max_uploads !== null &&
      token.uploads_used >= token.max_uploads
    ) {
      return NextResponse.json(
        { message: "Este código já atingiu o limite de fotos." },
        { status: 403 },
      );
    }

    const maxAge = 60 * 60 * 24;
    const value = signSession({
      kind: "guest",
      tokenId: token.id,
      name: token.name,
      exp: Date.now() + maxAge * 1000,
    });

    const response = NextResponse.json({
      authenticated: true,
      ...publicTokenState(token),
    });
    response.cookies.set(GUEST_COOKIE, value, {
      ...secureCookieOptions,
      maxAge,
    });
    return response;
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return NextResponse.json(
      { message: "Não foi possível validar o código agora." },
      { status: 500 },
    );
  }
}
