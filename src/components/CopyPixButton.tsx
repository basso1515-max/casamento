"use client";

import { useState } from "react";

export default function CopyPixButton({ pixKey }: { pixKey: string }) {
  const [message, setMessage] = useState("");

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setMessage("Chave PIX copiada!");
    } catch {
      setMessage("Não foi possível copiar. Selecione a chave acima.");
    }
  }

  return (
    <div className="pix-copy-action">
      <button type="button" className="button-primary" onClick={copyPixKey}>
        Copiar chave PIX
      </button>
      <span className="copy-feedback" aria-live="polite">{message}</span>
    </div>
  );
}
