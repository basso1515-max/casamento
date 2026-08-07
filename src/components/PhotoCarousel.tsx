"use client";

import { useEffect, useState } from "react";
import type { WeddingPhoto } from "@/types/photo";

type Props = {
  photos: WeddingPhoto[];
};

export default function PhotoCarousel({ photos }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= photos.length) setActive(0);
  }, [active, photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % photos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  if (!photos.length) return null;

  const previous = () =>
    setActive((current) => (current - 1 + photos.length) % photos.length);
  const next = () => setActive((current) => (current + 1) % photos.length);
  const photo = photos[active];

  return (
    <section className="carousel" aria-label="Fotos em destaque">
      <div className="carousel-frame">
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className="carousel-image"
        />
        <div className="carousel-wash" />
        {photo.uploaderName && (
          <span className="carousel-credit">Enviada por {photo.uploaderName}</span>
        )}
        {photos.length > 1 && (
          <>
            <button className="carousel-arrow left" onClick={previous} aria-label="Foto anterior">←</button>
            <button className="carousel-arrow right" onClick={next} aria-label="Próxima foto">→</button>
            <div className="carousel-dots" aria-label="Selecionar foto">
              {photos.slice(0, 12).map((item, index) => (
                <button
                  key={item.id}
                  className={index === active ? "dot active" : "dot"}
                  onClick={() => setActive(index)}
                  aria-label={`Ver foto ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
