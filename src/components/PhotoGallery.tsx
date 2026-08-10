"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { recordPhotoView } from "@/app/actions";
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
  const trackedViews = useRef(new Set<string>());

  useEffect(() => {
    if (selected === null) return;

    const photo = photos[selected];
    if (!photo?.trackViews || trackedViews.current.has(photo.id)) return;

    const storageKey = `wedding-photo-view:${photo.id}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) {
        trackedViews.current.add(photo.id);
        return;
      }
    } catch {
      // A contagem continua funcionando quando o navegador bloqueia storage.
    }

    trackedViews.current.add(photo.id);
    void recordPhotoView(photo.id)
      .then((result) => {
        if (!result.ok) {
          trackedViews.current.delete(photo.id);
          return;
        }

        try {
          window.sessionStorage.setItem(storageKey, "1");
        } catch {
          // O banco já registrou a visualização; o cache local é opcional.
        }
      })
      .catch(() => trackedViews.current.delete(photo.id));
  }, [photos, selected]);

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
          <button
            type="button"
            className="gallery-card"
            key={photo.id}
            onClick={() => setSelected(index)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 760px) 50vw, 33vw"
              unoptimized={photo.src.endsWith(".svg")}
            />
            {photo.uploaderName && (
              <span className="gallery-credit">por {photo.uploaderName}</span>
            )}
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setSelected(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setSelected(null)}
            aria-label="Fechar"
          >
            ×
          </button>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <div className="lightbox-photo">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="92vw"
                unoptimized={selectedPhoto.src.endsWith(".svg")}
              />
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
