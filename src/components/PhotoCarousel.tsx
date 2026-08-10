"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { WeddingPhoto } from "@/types/photo";

type Props = {
  photos: WeddingPhoto[];
};

type SlidePosition = "previous" | "current" | "next";

export default function PhotoCarousel({ photos }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (active >= photos.length) setActive(0);
  }, [active, photos.length]);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % photos.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [paused, photos.length]);

  if (!photos.length) return null;

  const previous = () =>
    setActive((current) => (current - 1 + photos.length) % photos.length);
  const next = () => setActive((current) => (current + 1) % photos.length);

  const previousIndex = (active - 1 + photos.length) % photos.length;
  const nextIndex = (active + 1) % photos.length;
  const slides: Array<{ index: number; position: SlidePosition }> =
    photos.length === 1
      ? [{ index: active, position: "current" }]
      : [
          { index: previousIndex, position: "previous" },
          { index: active, position: "current" },
          { index: nextIndex, position: "next" },
        ];

  return (
    <section
      className={photos.length === 1 ? "carousel carousel-single" : "carousel"}
      aria-label="Fotos mais visualizadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="carousel-stage">
        {slides.map(({ index, position }) => {
          const photo = photos[index];
          const slideKey =
            photos.length === 2 ? `${position}-${photo.id}` : photo.id;
          const image = (
            <Image
              src={photo.src}
              alt={position === "current" ? photo.alt : ""}
              fill
              sizes={
                position === "current"
                  ? "(max-width: 760px) 82vw, 65vw"
                  : "(max-width: 760px) 64vw, 46vw"
              }
              priority={position === "current"}
              unoptimized={photo.src.endsWith(".svg")}
            />
          );

          if (position !== "current") {
            return (
              <button
                type="button"
                className={`carousel-slide ${position}`}
                key={slideKey}
                onClick={position === "previous" ? previous : next}
                aria-label={
                  position === "previous"
                    ? `Ver foto anterior: ${photo.alt}`
                    : `Ver próxima foto: ${photo.alt}`
                }
              >
                {image}
                <span className="carousel-side-shade" aria-hidden="true" />
              </button>
            );
          }

          return (
            <figure
              className="carousel-slide current"
              key={slideKey}
              aria-live="polite"
            >
              {image}
              <span className="carousel-wash" aria-hidden="true" />
              {photo.uploaderName && (
                <figcaption className="carousel-credit">
                  Enviada por {photo.uploaderName}
                </figcaption>
              )}
            </figure>
          );
        })}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-arrow left"
              onClick={previous}
              aria-label="Foto anterior"
            >
              ←
            </button>
            <button
              type="button"
              className="carousel-arrow right"
              onClick={next}
              aria-label="Próxima foto"
            >
              →
            </button>
            <div
              className="carousel-dots"
              role="group"
              aria-label="Selecionar foto"
            >
              {photos.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={index === active ? "dot active" : "dot"}
                  onClick={() => setActive(index)}
                  aria-label={`Ver foto ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
