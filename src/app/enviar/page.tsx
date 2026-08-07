import UploadFlow from "@/components/UploadFlow";

export default async function EnviarPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialToken = typeof params.t === "string" ? params.t : undefined;

  return (
    <main className="inner-page upload-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">❦ ajude a contar nossa história ❦</span>
        <h1>Compartilhe suas fotos</h1>
        <p>Use seu código pessoal para enviar os momentos que você registrou. Assim que o envio terminar, eles entram no álbum do casamento.</p>
      </section>
      <UploadFlow initialToken={initialToken} />
    </main>
  );
}
