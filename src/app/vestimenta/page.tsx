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

      <section className="section tips-grid">
        <article className="paper-card"><h3>Texturas</h3><p>Linho, algodão, renda, crochê, bordados, tricô leve e outros tecidos com aspecto natural.</p></article>
        <article className="paper-card"><h3>Detalhes</h3><p>Flores, estampas pequenas, acessórios vintage, suspensórios, coletes e peças românticas são bem-vindos.</p></article>
        <article className="paper-card"><h3>Conforto</h3><p>Priorize roupas nas quais você consiga aproveitar a celebração inteira com conforto.</p></article>
      </section>
    </main>
  );
}
