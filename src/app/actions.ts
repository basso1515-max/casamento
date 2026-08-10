"use server";

import { incrementPhotoView } from "@/lib/supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function recordPhotoView(photoId: string) {
  if (!UUID_PATTERN.test(photoId)) {
    return { ok: false };
  }

  await incrementPhotoView(photoId);
  return { ok: true };
}
