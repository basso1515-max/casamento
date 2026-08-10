import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: `${siteConfig.couple} · Nosso Casamento`,
  description: "Fotos, vestimenta e presentes do nosso casamento.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f0e6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${cormorant.variable} ${lora.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
