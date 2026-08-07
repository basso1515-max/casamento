import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="botanical-divider">❦</div>
      <p>{siteConfig.couple}</p>
      <small>Feito com carinho para guardar as memórias desse dia.</small>
    </footer>
  );
}
