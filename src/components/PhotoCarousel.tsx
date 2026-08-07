"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { demoPhotos } from "@/data/site";

export default function PhotoCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % demoPhotos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const previous = () => setActive((current) => (current - 1 + demoPhotos.length) % demoPhotos.length);
  const next = () => setActive((current) => (current + 1) % demoPhotos.length);

  return (
    <section className="carousel" aria-label="Fotos em destaque">
      <div className="carousel-frame">
        <Image
          key={demoPhotos[active].src}
          src={demoPhotos[active].src}
          alt={demoPhotos[active].alt}
          fill
          priority
          sizes="(max-width: 800px) 92vw, 900px"
          className="carousel-image"
        />
        <div className="carousel-wash" />
        <button className="carousel-arrow left" onClick={previous} aria-label="Foto anterior">←</button>
        <button className="carousel-arrow right" onClick={next} aria-label="Próxima foto">→</button>
        <div className="carousel-dots" aria-label="Selecionar foto">
          {demoPhotos.map((_, index) => (
            <button
              key={index}
              className={index === active ? "dot active" : "dot"}
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
