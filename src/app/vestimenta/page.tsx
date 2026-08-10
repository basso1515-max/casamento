import Image from "next/image";

const outfitReferences = [
  {
    src: "/images/vestimenta/cottagecore-vestido-floral.jpg",
    alt: "Convidada em um jardim usando vestido midi bege com estampa floral, mangas bufantes e bolsa de palha.",
    eyebrow: "Romântico botânico",
    title: "Vestidos e saias",
    text: "Modelagens fluidas, estampas pequenas e acessórios delicados trazem o clima do campo sem perder a elegância.",
  },
  {
    src: "/images/vestimenta/cottagecore-linho-colete.jpg",
    alt: "Convidado diante de um portão de madeira usando camisa clara, colete verde-sálvia, calça de linho bege e sapatos marrons.",
    eyebrow: "Alfaiataria leve",
    title: "Linho e coletes",
    text: "Camisas naturais, calças em tons claros e coletes funcionam como alternativa descontraída ao terno tradicional.",
  },
  {
    src: "/images/vestimenta/cottagecore-tons-terrosos.jpg",
    alt: "Pessoa em um pomar usando blusa bordada, colete verde-sálvia e calça ampla terracota.",
    eyebrow: "Combinação livre",
    title: "Camadas e tons terrosos",
    text: "Bordados, peças amplas e sobreposições deixam espaço para uma interpretação pessoal e confortável do estilo.",
  },
];

export default function VestimentaPage() {
  return (
    <main className="inner-page">
      <section className="page-heading">
        <span className="eyebrow">❦ inspiração para o dia ❦</span>
        <h1>Vestimenta</h1>
        <p>Queremos que o jardim também apareça nas roupas: tecidos naturais, movimento, romantismo e cores inspiradas na natureza.</p>
      </section>

      <section className="section dress-guide">
        <div className="paper-card featured-card">
          <span className="eyebrow">Estilo sugerido</span>
          <h2>Cottagecore</h2>
          <p>Pense em um encontro no campo: linho, algodão, rendas delicadas, estampas florais, suspensórios, coletes e peças com aparência artesanal.</p>
        </div>
        <div className="palette-card">
          <h3>Paleta sugerida</h3>
          <div className="palette">
            <span className="swatch sage" title="Verde sálvia" />
            <span className="swatch moss" title="Verde musgo" />
            <span className="swatch rose" title="Rosa antigo" />
            <span className="swatch clay" title="Terracota" />
            <span className="swatch cream" title="Creme" />
          </div>
          <p>Tons suaves, terrosos e botânicos funcionam muito bem. Esta paleta é inspiração, não uniforme.</p>
        </div>
      </section>

      <section className="section outfit-inspiration" aria-labelledby="outfit-inspiration-title">
        <div className="outfit-intro">
          <span className="eyebrow">❦ referências visuais ❦</span>
          <h2 id="outfit-inspiration-title">Cottagecore na prática</h2>
          <p>Use estas combinações como ponto de partida. Não é preciso copiar o look: escolha os elementos que combinam com você.</p>
        </div>

        <div className="outfit-grid">
          {outfitReferences.map((reference, index) => (
            <figure className="outfit-card" key={reference.title}>
              <div className="outfit-photo">
                <Image
                  src={reference.src}
                  alt={reference.alt}
                  fill
                  loading={index === 1 ? "eager" : "lazy"}
                  sizes="(max-width: 760px) calc(100vw - 24px), (max-width: 1180px) 31vw, 350px"
                />
              </div>
              <figcaption>
                <span className="eyebrow">{reference.eyebrow}</span>
                <h3>{reference.title}</h3>
                <p>{reference.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section tips-grid">
        <article className="paper-card"><h3>Texturas</h3><p>Linho, algodão, renda, crochê, bordados, tricô leve e outros tecidos com aspecto natural.</p></article>
        <article className="paper-card"><h3>Detalhes</h3><p>Flores, estampas pequenas, acessórios vintage, suspensórios, coletes e peças românticas são bem-vindos.</p></article>
        <article className="paper-card"><h3>Conforto</h3><p>Priorize roupas nas quais você consiga aproveitar a celebração inteira com conforto.</p></article>
      </section>
    </main>
  );
}
