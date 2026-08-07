const gifts = [
  { icon: "🏡", title: "Nosso lar", text: "Uma seleção de itens para tornar nossa casa ainda mais nossa." },
  { icon: "🌿", title: "Experiências", text: "Contribuições para passeios, viagens e memórias que queremos criar juntos." },
  { icon: "💌", title: "Presente livre", text: "Para quem preferir escolher outra forma de nos presentear." },
];

export default function PresentesPage() {
  return (
    <main className="inner-page">
      <section className="page-heading">
        <span className="eyebrow">❦ com carinho ❦</span>
        <h1>Presentes</h1>
        <p>Sua presença já faz parte do presente. Para quem quiser contribuir de outra forma, deixaremos aqui algumas sugestões.</p>
      </section>

      <section className="section gift-grid">
        {gifts.map((gift) => (
          <article className="gift-card" key={gift.title}>
            <span className="gift-icon" aria-hidden>{gift.icon}</span>
            <h2>{gift.title}</h2>
            <p>{gift.text}</p>
            <button className="button-secondary" disabled>Adicionar link depois</button>
          </article>
        ))}
      </section>
    </main>
  );
}
