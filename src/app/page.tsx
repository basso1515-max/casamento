import Link from "next/link";
import PhotoCarousel from "@/components/PhotoCarousel";
import PhotoGallery from "@/components/PhotoGallery";
import { siteConfig } from "@/data/site";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">❦ nosso casamento ❦</span>
        <h1>{siteConfig.couple}</h1>
        <p className="hero-date">{siteConfig.date} · {siteConfig.location}</p>
        <p className="hero-copy">{siteConfig.subtitle}</p>
      </section>

      <PhotoCarousel />

      <section className="share-strip">
        <div>
          <span className="eyebrow">Uma história vista por muitos olhos</span>
          <h2>Compartilhe suas fotos conosco</h2>
          <p>Durante o casamento, convidados com o código poderão enviar suas próprias fotos para nossa coleção.</p>
        </div>
        <Link href="/enviar" className="button-primary">Enviar fotos</Link>
      </section>

      <section className="section gallery-section">
        <span className="eyebrow">Memórias</span>
        <h2>Galeria do casamento</h2>
        <p className="section-intro">Aqui ficarão reunidos nossos registros favoritos e, depois, as fotos compartilhadas pelos convidados.</p>
        <PhotoGallery />
      </section>
    </main>
  );
}
