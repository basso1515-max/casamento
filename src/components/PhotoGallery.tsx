"use client";

import Image from "next/image";
import { useState } from "react";
import { demoPhotos } from "@/data/site";

export default function PhotoGallery() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <div className="gallery-grid">
        {demoPhotos.map((photo, index) => (
          <button className="gallery-card" key={photo.src} onClick={() => setSelected(index)}>
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 50vw, 33vw" />
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setSelected(null)}>
          <button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Fechar">×</button>
          <div className="lightbox-photo" onClick={(event) => event.stopPropagation()}>
            <Image src={demoPhotos[selected].src} alt={demoPhotos[selected].alt} fill sizes="90vw" />
          </div>
        </div>
      )}
    </>
  );
}
