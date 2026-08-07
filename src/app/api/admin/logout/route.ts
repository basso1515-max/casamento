import { NextResponse } from "next/server";
import { ADMIN_COOKIE, secureCookieOptions } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...secureCookieOptions,
    maxAge: 0,
  });
  return response;
}
