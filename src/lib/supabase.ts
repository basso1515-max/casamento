const PHOTO_BUCKET = "casamento-fotos";

export type UploadTokenRow = {
  id: string;
  name: string;
  active: boolean;
  max_uploads: number | null;
  uploads_used: number;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  storage_path: string;
  original_name: string;
  content_type: string | null;
  size_bytes: number | null;
  uploaded_at: string;
  view_count: number;
  token_id?: string;
  upload_tokens?: { name: string } | { name: string }[] | null;
};

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
  return url;
}

function getSupabaseSecret() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY não configurada.");
  }
  return key;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

function serviceHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set("apikey", getSupabaseSecret());
  return headers;
}

export async function restRequest<T>(path: string, init: RequestInit = {}) {
  const headers = serviceHeaders(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${text || response.statusText}`);
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function getTokenByHash(tokenHash: string) {
  const rows = await restRequest<UploadTokenRow[]>(
    `upload_tokens?token_hash=eq.${encodeURIComponent(tokenHash)}&select=id,name,active,max_uploads,uploads_used,created_at&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getTokenById(id: string) {
  const rows = await restRequest<UploadTokenRow[]>(
    `upload_tokens?id=eq.${encodeURIComponent(id)}&select=id,name,active,max_uploads,uploads_used,created_at&limit=1`,
  );
  return rows[0] ?? null;
}

export async function listTokens() {
  return restRequest<UploadTokenRow[]>(
    "upload_tokens?select=id,name,active,max_uploads,uploads_used,created_at&order=created_at.desc",
  );
}

export async function createToken(input: {
  name: string;
  tokenHash: string;
  maxUploads: number | null;
}) {
  const rows = await restRequest<UploadTokenRow[]>(
    "upload_tokens?select=id,name,active,max_uploads,uploads_used,created_at",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name: input.name,
        token_hash: input.tokenHash,
        max_uploads: input.maxUploads,
      }),
    },
  );
  return rows[0];
}

export async function updateToken(
  id: string,
  patch: { active?: boolean; max_uploads?: number | null },
) {
  const rows = await restRequest<UploadTokenRow[]>(
    `upload_tokens?id=eq.${encodeURIComponent(id)}&select=id,name,active,max_uploads,uploads_used,created_at`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    },
  );
  return rows[0] ?? null;
}

export async function listPhotos(limit = 250) {
  return restRequest<PhotoRow[]>(
    `photos?select=id,storage_path,original_name,content_type,size_bytes,uploaded_at,view_count,token_id,upload_tokens(name)&order=uploaded_at.desc&limit=${limit}`,
  );
}

export async function incrementPhotoView(photoId: string) {
  return restRequest<number>("rpc/increment_photo_view", {
    method: "POST",
    body: JSON.stringify({ p_photo_id: photoId }),
  });
}

export function publicPhotoUrl(storagePath: string) {
  const encodedPath = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${getSupabaseUrl()}/storage/v1/object/public/${PHOTO_BUCKET}/${encodedPath}`;
}

export async function createSignedUploadUrl(storagePath: string) {
  const encodedPath = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const storageBase = `${getSupabaseUrl()}/storage/v1`;
  const response = await fetch(
    `${storageBase}/object/upload/sign/${PHOTO_BUCKET}/${encodedPath}`,
    {
      method: "POST",
      headers: serviceHeaders({ "content-type": "application/json" }),
      body: "{}",
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as { url?: string; message?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.message || "Não foi possível autorizar o upload.");
  }

  return payload.url.startsWith("http") ? payload.url : `${storageBase}${payload.url}`;
}

export async function registerPhoto(input: {
  tokenId: string;
  storagePath: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
}) {
  return restRequest<unknown>("rpc/register_photo_upload", {
    method: "POST",
    body: JSON.stringify({
      p_token_id: input.tokenId,
      p_storage_path: input.storagePath,
      p_original_name: input.originalName,
      p_content_type: input.contentType,
      p_size_bytes: input.sizeBytes,
    }),
  });
}

export async function deletePhotoRecord(photoId: string) {
  return restRequest<string>("rpc/delete_photo_record", {
    method: "POST",
    body: JSON.stringify({ p_photo_id: photoId }),
  });
}

export async function deleteStorageObject(storagePath: string) {
  const response = await fetch(
    `${getSupabaseUrl()}/storage/v1/object/${PHOTO_BUCKET}`,
    {
      method: "DELETE",
      headers: serviceHeaders({ "content-type": "application/json" }),
      body: JSON.stringify({ prefixes: [storagePath] }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao remover arquivo do Storage: ${text}`);
  }
}
