import Link from "next/link";
import { siteConfig } from "@/data/site";

const links = [
  ["/", "Início"],
  ["/vestimenta", "Vestimenta"],
  ["/presentes", "Presentes"],
];

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Página inicial">
        <span className="brand-leaf">❦</span>
        <span>{siteConfig.couple}</span>
      </Link>
      <nav className="main-nav" aria-label="Navegação principal">
        {links.map(([href, label]) => (
          <Link href={href} key={href}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
