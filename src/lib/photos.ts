import { demoPhotos } from "@/data/site";
import { isSupabaseConfigured, listPhotos, publicPhotoUrl } from "@/lib/supabase";
import type { WeddingPhoto } from "@/types/photo";

function demoFallback(): WeddingPhoto[] {
  return demoPhotos.map((photo, index) => ({
    id: `demo-${index}`,
    src: photo.src,
    alt: photo.alt,
  }));
}

export async function getPublicPhotos(): Promise<WeddingPhoto[]> {
  if (!isSupabaseConfigured()) return demoFallback();

  try {
    const rows = await listPhotos();
    if (!rows.length) return demoFallback();

    return rows.map((row) => {
      const relation = Array.isArray(row.upload_tokens)
        ? row.upload_tokens[0]
        : row.upload_tokens;
      const uploaderName = relation?.name || "Convidado";

      return {
        id: row.id,
        src: publicPhotoUrl(row.storage_path),
        alt: `Foto enviada por ${uploaderName}`,
        uploaderName,
        uploadedAt: row.uploaded_at,
      };
    });
  } catch (error) {
    console.error("Falha ao carregar galeria do Supabase:", error);
    return demoFallback();
  }
}
