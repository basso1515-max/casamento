import Link from "next/link";
import { headers } from "next/headers";
import PhotoCarousel from "@/components/PhotoCarousel";
import PhotoGallery from "@/components/PhotoGallery";
import { siteConfig } from "@/data/site";
import { getPublicPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [photos, requestHeaders, query] = await Promise.all([
    getPublicPhotos(),
    headers(),
    searchParams,
  ]);
  const userAgent = requestHeaders.get("user-agent") || "";
  const renderSafe =
    /Android/i.test(userAgent) || query["android-safe"] === "1";
  const carouselPhotos = [...photos]
    .sort((first, second) => {
      if (second.viewCount !== first.viewCount) {
        return second.viewCount - first.viewCount;
      }

      return (second.uploadedAt || "").localeCompare(first.uploadedAt || "");
    })
    .slice(0, Math.min(photos.length, 12));

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">❦ nosso casamento ❦</span>
        <h1>{siteConfig.couple}</h1>
        <p className="hero-date">{siteConfig.date} · {siteConfig.location}</p>
        <p className="hero-copy">{siteConfig.subtitle}</p>
      </section>

      <PhotoCarousel photos={carouselPhotos} renderSafe={renderSafe} />

      <section className="share-strip">
        <div>
          <span className="eyebrow">Uma história vista por muitos olhos</span>
          <h2>Compartilhe suas fotos conosco</h2>
          <p>Seu código pessoal identifica você e coloca suas fotos diretamente neste álbum coletivo.</p>
        </div>
        <Link href="/enviar" className="button-primary">Enviar fotos</Link>
      </section>

      <section className="section gallery-section">
        <span className="eyebrow">Memórias</span>
        <h2>Galeria do casamento</h2>
        <p className="section-intro">As fotos compartilhadas pelos convidados aparecem aqui automaticamente, sempre com o nome de quem registrou aquele momento.</p>
        <PhotoGallery photos={photos} />
      </section>
    </main>
  );
}
