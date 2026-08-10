import Image from "next/image";
import QRCode from "qrcode";
import CopyPixButton from "@/components/CopyPixButton";
import { createPixPayload } from "@/lib/pix";
import { formatBrazilianPhone, normalizeBrazilianMobile } from "@/lib/phone";

const gifts = [
  {
    icon: "🏡",
    eyebrow: "Para o nosso lar",
    title: "Linha Vintage Ariete",
    text: "Eletroportáteis de inspiração retrô que combinam com a casa que queremos construir juntos.",
    href: "https://ariete.net.br/categoria-produto/vintage/",
    action: "Ver na Ariete",
    external: true,
  },
  {
    icon: "🌙",
    eyebrow: "Experiência",
    title: "Jantar na lua de mel",
    text: "Uma contribuição para celebrarmos a viagem com uma noite especial à mesa.",
    href: "#pix",
    action: "Contribuir via PIX",
    external: false,
  },
  {
    icon: "✈️",
    eyebrow: "Experiência",
    title: "Passagens",
    text: "Ajude a encurtar a distância entre nós e as memórias que vamos criar na viagem.",
    href: "#pix",
    action: "Contribuir via PIX",
    external: false,
  },
];

function pixSettings() {
  return {
    key: process.env.PIX_KEY?.trim() || "",
    recipientName: process.env.PIX_RECIPIENT_NAME?.trim() || "",
    city: process.env.PIX_CITY?.trim() || "",
    bank: process.env.PIX_BANK?.trim() || "",
  };
}

export default async function PresentesPage() {
  const pix = pixSettings();
  const pixReady = Boolean(pix.key && pix.recipientName && pix.city);
  const pixPhone = normalizeBrazilianMobile(pix.key);
  const displayedPixKey = pixPhone
    ? formatBrazilianPhone(pixPhone, true)
    : pix.key;
  const qrCode = pixReady
    ? await QRCode.toDataURL(createPixPayload(pix), {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 248,
        color: { dark: "#354132", light: "#FFFAF0" },
      })
    : null;

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
            <span className="eyebrow">{gift.eyebrow}</span>
            <h2>{gift.title}</h2>
            <p>{gift.text}</p>
            <a
              className="button-secondary"
              href={gift.href}
              target={gift.external ? "_blank" : undefined}
              rel={gift.external ? "noreferrer" : undefined}
            >
              {gift.action}
              {gift.external && <span className="external-link-mark" aria-hidden>↗</span>}
            </a>
          </article>
        ))}
      </section>

      <section className="section pix-section" id="pix" aria-labelledby="pix-title">
        <div className="pix-intro">
          <span className="eyebrow">❦ contribuição livre ❦</span>
          <h2 id="pix-title">Presenteie via PIX</h2>
          <p>Escolha o valor que fizer sentido para você. Sua contribuição fará parte das experiências da nossa lua de mel.</p>
        </div>

        {pixReady && qrCode ? (
          <div className="pix-panel">
            <div className="pix-qr">
              <Image
                src={qrCode}
                alt="QR Code para contribuir com o presente via PIX"
                width={248}
                height={248}
                unoptimized
              />
              <small>Aponte a câmera do aplicativo do seu banco</small>
            </div>
            <div className="pix-details">
              <span className="eyebrow">Chave PIX</span>
              <code>{displayedPixKey}</code>
              <CopyPixButton pixKey={pix.key} />
              <p>
                Antes de confirmar, confira no aplicativo se o favorecido é <strong>{pix.recipientName}</strong>{pix.bank && <> no {pix.bank}</>}.
              </p>
            </div>
          </div>
        ) : (
          <div className="pix-unavailable" role="status">
            <strong>Dados do PIX em preparação</strong>
            <p>A chave e o QR Code serão exibidos aqui assim que os dados do favorecido forem cadastrados.</p>
          </div>
        )}
      </section>
    </main>
  );
}
