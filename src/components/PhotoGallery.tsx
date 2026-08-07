"use client";

import { useEffect, useState } from "react";
import type { WeddingPhoto } from "@/types/photo";

type Props = {
  photos: WeddingPhoto[];
};

function formatUploadedAt(value?: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default function PhotoGallery({ photos }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") {
        setSelected((current) =>
          current === null ? 0 : (current + 1) % photos.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setSelected((current) =>
          current === null
            ? 0
            : (current - 1 + photos.length) % photos.length,
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, photos.length]);

  if (!photos.length) {
    return <p className="empty-state">As primeiras fotos aparecerão aqui durante o casamento. 🌿</p>;
  }

  const selectedPhoto = selected === null ? null : photos[selected];
  const formattedDate = formatUploadedAt(selectedPhoto?.uploadedAt);

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button className="gallery-card" key={photo.id} onClick={() => setSelected(index)}>
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            {photo.uploaderName && (
              <span className="gallery-credit">por {photo.uploaderName}</span>
            )}
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setSelected(null)}>
          <button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Fechar">×</button>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <div className="lightbox-photo">
              <img src={selectedPhoto.src} alt={selectedPhoto.alt} />
            </div>
            {selectedPhoto.uploaderName && (
              <div className="lightbox-caption">
                <strong>Enviada por {selectedPhoto.uploaderName}</strong>
                {formattedDate && <span>{formattedDate}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
