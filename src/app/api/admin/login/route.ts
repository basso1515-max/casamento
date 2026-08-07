import { NextRequest, NextResponse } from "next/server";
import { safePasswordEqual, signSession } from "@/lib/security";
import { ADMIN_COOKIE, secureCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return NextResponse.json(
        { message: "ADMIN_PASSWORD ainda não foi configurada." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { password?: string };
    if (!body.password || !safePasswordEqual(body.password, expected)) {
      return NextResponse.json(
        { message: "Senha incorreta." },
        { status: 401 },
      );
    }

    const maxAge = 60 * 60 * 12;
    const value = signSession({
      kind: "admin",
      exp: Date.now() + maxAge * 1000,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, value, {
      ...secureCookieOptions,
      maxAge,
    });
    return response;
  } catch (error) {
    console.error("Erro no login administrativo:", error);
    return NextResponse.json(
      { message: "Não foi possível entrar no painel." },
      { status: 500 },
    );
  }
}
