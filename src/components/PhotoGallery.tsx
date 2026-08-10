"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { recordPhotoView } from "@/app/actions";
import type { WeddingPhoto } from "@/types/photo";

type Props = {
  photos: WeddingPhoto[];
};

const GALLERY_PAGE_SIZE = 24;

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
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);
  const trackedViews = useRef(new Set<string>());
  const touchStartX = useRef<number | null>(null);

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

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
  const visiblePhotos = photos.slice(0, visibleCount);
  const showPrevious = () =>
    setSelected((current) =>
      current === null ? 0 : (current - 1 + photos.length) % photos.length,
    );
  const showNext = () =>
    setSelected((current) =>
      current === null ? 0 : (current + 1) % photos.length,
    );

  return (
    <>
      <div className="gallery-grid">
        {visiblePhotos.map((photo, index) => (
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

      {visibleCount < photos.length && (
        <button
          type="button"
          className="button-secondary gallery-load-more"
          onClick={() => setVisibleCount((current) => current + GALLERY_PAGE_SIZE)}
        >
          Mostrar mais fotos
        </button>
      )}

      {selectedPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          onClick={() => setSelected(null)}
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start === null) return;

            const distance = (event.changedTouches[0]?.clientX ?? start) - start;
            if (Math.abs(distance) < 48) return;
            event.stopPropagation();
            if (distance > 0) showPrevious();
            else showNext();
          }}
        >
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
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav previous"
                  onClick={showPrevious}
                  aria-label="Foto anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="lightbox-nav next"
                  onClick={showNext}
                  aria-label="Próxima foto"
                >
                  →
                </button>
              </>
            )}
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
