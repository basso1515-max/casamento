import { cookies } from "next/headers";
import {
  type AdminSession,
  type GuestSession,
  verifySession,
} from "@/lib/security";

export const GUEST_COOKIE = "wedding_guest";
export const ADMIN_COOKIE = "wedding_admin";

export const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function getGuestSession(): Promise<GuestSession | null> {
  const store = await cookies();
  return verifySession<GuestSession>(store.get(GUEST_COOKIE)?.value, "guest");
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySession<AdminSession>(store.get(ADMIN_COOKIE)?.value, "admin");
}
