export default function EnviarPage() {
  return (
    <main className="inner-page upload-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">❦ ajude a contar nossa história ❦</span>
        <h1>Compartilhe suas fotos</h1>
        <p>Digite o código recebido no casamento. Na próxima etapa do projeto, esta tela será conectada ao Supabase para liberar os uploads.</p>
      </section>

      <section className="token-card">
        <label htmlFor="token">Código do casamento</label>
        <input id="token" name="token" type="text" placeholder="Ex.: JARDIM-8F2K" disabled />
        <button className="button-primary" disabled>Continuar</button>
        <small>Upload ainda não conectado — esta é a interface inicial.</small>
      </section>
    </main>
  );
}
