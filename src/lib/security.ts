import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type GuestSession = {
  kind: "guest";
  tokenId: string;
  name: string;
  exp: number;
};

export type AdminSession = {
  kind: "admin";
  exp: number;
};

export function normalizeToken(token: string) {
  return token.trim().toUpperCase().replace(/\s+/g, "");
}

export function hashToken(token: string) {
  return createHash("sha256").update(normalizeToken(token)).digest("hex");
}

export function generateInviteToken() {
  const bytes = randomBytes(8);
  let suffix = "";

  for (const byte of bytes) {
    suffix += TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length];
  }

  return `FLOR-${suffix.slice(0, 4)}-${suffix.slice(4)}`;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("SESSION_SECRET ausente ou muito curto. Use pelo menos 24 caracteres.");
  }
  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signSession(payload: GuestSession | AdminSession) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

export function verifySession<T extends GuestSession | AdminSession>(
  value: string | undefined,
  expectedKind: T["kind"],
): T | null {
  if (!value) return null;

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as T;
    if (payload.kind !== expectedKind || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function safePasswordEqual(received: string, expected: string) {
  const a = createHash("sha256").update(received).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
