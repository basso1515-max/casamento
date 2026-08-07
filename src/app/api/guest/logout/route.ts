import { NextResponse } from "next/server";
import { GUEST_COOKIE, secureCookieOptions } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(GUEST_COOKIE, "", {
    ...secureCookieOptions,
    maxAge: 0,
  });
  return response;
}
