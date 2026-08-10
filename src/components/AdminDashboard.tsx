"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TokenRow = {
  id: string;
  name: string;
  active: boolean;
  max_uploads: number | null;
  uploads_used: number;
  created_at: string;
};

type AdminPhoto = {
  id: string;
  url: string;
  originalName: string;
  uploadedAt: string;
  uploaderName: string;
  sizeBytes: number | null;
};

type CreatedToken = {
  token: string;
  directLink: string;
  guest: TokenRow;
};

async function readPayload<T>(response: Response) {
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || "Erro inesperado.");
  return payload;
}

function formatBytes(value: number | null) {
  if (!value) return "—";
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

async function fetchDashboardData() {
  const [tokenResponse, photoResponse] = await Promise.all([
    fetch("/api/admin/tokens", { cache: "no-store" }),
    fetch("/api/admin/photos", { cache: "no-store" }),
  ]);

  if (tokenResponse.status === 401 || photoResponse.status === 401) return null;

  const tokenData = await readPayload<{ tokens: TokenRow[] }>(tokenResponse);
  const photoData = await readPayload<{ photos: AdminPhoto[] }>(photoResponse);
  return { tokens: tokenData.tokens, photos: photoData.photos };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [name, setName] = useState("");
  const [maxUploads, setMaxUploads] = useState("");
  const [created, setCreated] = useState<CreatedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    try {
      const data = await fetchDashboardData();
      if (!data) {
        router.push("/admin/login");
        return;
      }
      setTokens(data.tokens);
      setPhotos(data.photos);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar painel.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardData()
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          router.push("/admin/login");
          return;
        }
        setTokens(data.tokens);
        setPhotos(data.photos);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar painel.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          maxUploads: maxUploads.trim() ? Number(maxUploads) : null,
        }),
      });
      const data = await readPayload<CreatedToken>(response);
      setCreated(data);
      setName("");
      setMaxUploads("");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao gerar código.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleToken(token: TokenRow) {
    setError("");
    try {
      const response = await fetch(`/api/admin/tokens/${token.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: !token.active }),
      });
      await readPayload(response);
      await loadData();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Falha ao atualizar código.");
    }
  }

  async function deletePhoto(photo: AdminPhoto) {
    if (!window.confirm(`Excluir a foto enviada por ${photo.uploaderName}?`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/photos/${photo.id}`, { method: "DELETE" });
      const payload = await readPayload<{ warning?: string | null }>(response);
      if (payload.warning) setNotice(payload.warning);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao excluir foto.");
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setNotice(`${label} copiado.`);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) return <p className="admin-loading">Carregando painel…</p>;

  return (
    <div className="admin-dashboard">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">painel do casal</span>
          <h1>Convidados & fotos</h1>
        </div>
        <button className="button-secondary" onClick={logout}>Sair</button>
      </div>

      {error && <p className="form-error admin-message">{error}</p>}
      {notice && <p className="form-notice admin-message">{notice}</p>}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">acessos</span>
            <h2>Gerar token</h2>
          </div>
          <p>O código é mostrado uma única vez. O banco guarda apenas o hash.</p>
        </div>

        <form className="admin-token-form" onSubmit={generate}>
          <label>
            Nome do convidado
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Fernanda" required />
          </label>
          <label>
            Limite de fotos <span>(opcional)</span>
            <input type="number" min="1" max="5000" value={maxUploads} onChange={(event) => setMaxUploads(event.target.value)} placeholder="Ilimitado" />
          </label>
          <button className="button-primary" disabled={saving}>{saving ? "Gerando…" : "Gerar código"}</button>
        </form>

        {created && (
          <div className="created-token-card">
            <div>
              <span className="eyebrow">código criado para {created.guest.name}</span>
              <strong>{created.token}</strong>
            </div>
            <div className="created-token-actions">
              <button className="button-secondary" onClick={() => copy(created.token, "Código")}>Copiar código</button>
              <button className="button-secondary" onClick={() => copy(created.directLink, "Link")}>Copiar link direto</button>
            </div>
            <small>Guarde ou envie agora: por segurança, esse código não pode ser recuperado depois.</small>
          </div>
        )}

        <div className="token-list">
          {tokens.map((token) => (
            <article className="token-row" key={token.id}>
              <div>
                <strong>{token.name}</strong>
                <span>{token.uploads_used} / {token.max_uploads ?? "∞"} fotos</span>
              </div>
              <span className={token.active ? "status-badge active" : "status-badge"}>{token.active ? "Ativo" : "Desativado"}</span>
              <button className="text-button" onClick={() => toggleToken(token)}>{token.active ? "Desativar" : "Ativar"}</button>
            </article>
          ))}
          {!tokens.length && <p className="empty-state">Nenhum código gerado ainda.</p>}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">álbum coletivo</span>
            <h2>Fotos recebidas</h2>
          </div>
          <p>{photos.length} foto{photos.length === 1 ? "" : "s"} registrada{photos.length === 1 ? "" : "s"}.</p>
        </div>

        <div className="admin-photo-grid">
          {photos.map((photo) => (
            <article className="admin-photo-card" key={photo.id}>
              <img src={photo.url} alt={`Foto enviada por ${photo.uploaderName}`} loading="lazy" />
              <div>
                <strong>{photo.uploaderName}</strong>
                <span>{formatBytes(photo.sizeBytes)}</span>
                <button className="danger-button" onClick={() => deletePhoto(photo)}>Excluir</button>
              </div>
            </article>
          ))}
          {!photos.length && <p className="empty-state">Nenhuma foto enviada ainda.</p>}
        </div>
      </section>
    </div>
  );
}
