"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type SessionInfo = {
  name: string;
  uploadsUsed: number;
  maxUploads: number | null;
};

type PreparedUpload = {
  index: number;
  storagePath: string;
  signedUrl: string;
  originalName: string;
  contentType: string;
  size: number;
};

type Preview = {
  file: File;
  url: string;
};

const MAX_SELECTION = 20;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

async function responseMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message || "Ocorreu um erro inesperado.";
  } catch {
    return "Ocorreu um erro inesperado.";
  }
}

function uploadToSignedUrl(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress: (loaded: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("cacheControl", "3600");
    const uploadBody = file.type ? file : new Blob([file], { type: contentType });
    formData.append("", uploadBody, file.name);

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(event.loaded, file.size));
    };
    xhr.onerror = () => reject(new Error(`Falha de conexão ao enviar ${file.name}.`));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Não foi possível enviar ${file.name}.`));
    };
    xhr.send(formData);
  });
}

export default function UploadFlow({ initialToken }: { initialToken?: string }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [token, setToken] = useState(initialToken || "");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [files]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        if (initialToken) {
          const response = await fetch("/api/guest/session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: initialToken }),
          });
          if (!response.ok) throw new Error(await responseMessage(response));
          const data = (await response.json()) as SessionInfo;
          if (!cancelled) {
            setSession(data);
            setToken("");
            window.history.replaceState({}, "", "/enviar");
          }
        } else {
          const response = await fetch("/api/guest/session", { cache: "no-store" });
          if (response.ok) {
            const data = (await response.json()) as SessionInfo;
            if (!cancelled) setSession(data);
          }
        }
      } catch (startError) {
        if (!cancelled && initialToken) {
          setError(startError instanceof Error ? startError.message : "Código inválido.");
        }
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [initialToken]);

  async function validateToken(event: FormEvent) {
    event.preventDefault();
    setError("");
    setValidating(true);
    try {
      const response = await fetch("/api/guest/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      const data = (await response.json()) as SessionInfo;
      setSession(data);
      setToken("");
      setResult(null);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Código inválido.");
    } finally {
      setValidating(false);
    }
  }

  function chooseFiles(selected: FileList | null) {
    setSelectionError("");
    setResult(null);
    if (!selected) return;

    const incoming = Array.from(selected);
    const tooLarge = incoming.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setSelectionError(`${tooLarge.name} ultrapassa o limite de 25 MB por foto.`);
      return;
    }

    const merged = [...files, ...incoming].filter(
      (file, index, all) =>
        all.findIndex(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified,
        ) === index,
    );

    if (merged.length > MAX_SELECTION) {
      setSelectionError(`Envie no máximo ${MAX_SELECTION} fotos por vez.`);
      return;
    }
    setFiles(merged);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function refreshSession() {
    const response = await fetch("/api/guest/session", { cache: "no-store" });
    if (response.ok) setSession((await response.json()) as SessionInfo);
  }

  async function sendPhotos() {
    if (!files.length || uploading) return;
    setError("");
    setSelectionError("");
    setResult(null);
    setUploading(true);
    setProgress(0);

    let sent = 0;
    let failed = 0;
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;

    try {
      const prepareResponse = await fetch("/api/upload/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          files: files.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
        }),
      });
      if (!prepareResponse.ok) {
        throw new Error(await responseMessage(prepareResponse));
      }

      const prepared = (await prepareResponse.json()) as { uploads: PreparedUpload[] };

      for (const upload of prepared.uploads) {
        const file = files[upload.index];
        try {
          await uploadToSignedUrl(upload.signedUrl, file, upload.contentType, (loaded) => {
            const percent = Math.round(((completedBytes + loaded) / totalBytes) * 100);
            setProgress(Math.min(percent, 99));
          });

          const completeResponse = await fetch("/api/upload/complete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              storagePath: upload.storagePath,
              originalName: upload.originalName,
              contentType: upload.contentType,
              size: upload.size,
            }),
          });
          if (!completeResponse.ok) {
            throw new Error(await responseMessage(completeResponse));
          }
          sent += 1;
        } catch (fileError) {
          console.error(fileError);
          failed += 1;
        } finally {
          completedBytes += file.size;
          setProgress(Math.round((completedBytes / totalBytes) * 100));
        }
      }

      setResult({ sent, failed });
      if (sent > 0) setFiles([]);
      await refreshSession();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar as fotos.");
    } finally {
      setUploading(false);
    }
  }

  async function changeGuest() {
    await fetch("/api/guest/logout", { method: "POST" });
    setSession(null);
    setFiles([]);
    setResult(null);
    setProgress(0);
  }

  if (loadingSession) {
    return <div className="token-card upload-loading">Preparando seu acesso… 🌿</div>;
  }

  if (!session) {
    return (
      <form className="token-card" onSubmit={validateToken}>
        <label htmlFor="token">Código do convite</label>
        <input
          id="token"
          name="token"
          type="text"
          placeholder="Ex.: FLOR-A8K2-9PQR"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          value={token}
          onChange={(event) => setToken(event.target.value.toUpperCase())}
          disabled={validating}
        />
        {error && <p className="form-error" aria-live="polite">{error}</p>}
        <button className="button-primary" disabled={validating || token.trim().length < 8}>
          {validating ? "Verificando…" : "Continuar"}
        </button>
        <small>Seu código identifica quem enviou cada foto.</small>
      </form>
    );
  }

  const remaining =
    session.maxUploads === null
      ? null
      : Math.max(session.maxUploads - session.uploadsUsed, 0);

  return (
    <section className="upload-panel">
      <div className="upload-welcome">
        <div>
          <span className="eyebrow">acesso confirmado</span>
          <h2>Olá, {session.name}! 🌿</h2>
          <p>Escolha as fotos que você quer colocar no álbum de Guilherme e Sabrina.</p>
          <small>
            {session.uploadsUsed} foto{session.uploadsUsed === 1 ? "" : "s"} enviada{session.uploadsUsed === 1 ? "" : "s"}
            {remaining !== null && ` · ${remaining} restante${remaining === 1 ? "" : "s"}`}
          </small>
        </div>
        <button type="button" className="text-button" onClick={changeGuest} disabled={uploading}>Trocar código</button>
      </div>

      <label className="photo-picker">
        <span className="picker-icon">📷</span>
        <strong>Escolha suas fotos</strong>
        <span>JPG, PNG, WEBP ou HEIC · até 25 MB cada</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={(event) => {
            chooseFiles(event.target.files);
            event.currentTarget.value = "";
          }}
          disabled={uploading || remaining === 0}
        />
      </label>

      {selectionError && <p className="form-error centered" aria-live="polite">{selectionError}</p>}
      {error && <p className="form-error centered" aria-live="polite">{error}</p>}

      {files.length > 0 && (
        <div className="upload-selection-bar">
          <p aria-live="polite">
            <strong>{files.length}</strong> foto{files.length === 1 ? "" : "s"} selecionada{files.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            className="button-primary upload-submit"
            onClick={sendPhotos}
            disabled={uploading}
          >
            {uploading
              ? "Enviando…"
              : `Enviar ${files.length} foto${files.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {uploading && (
        <div className="upload-progress" aria-live="polite">
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <strong>Enviando suas memórias… {progress}%</strong>
        </div>
      )}

      {previews.length > 0 && (
        <div className="upload-preview-grid">
          {previews.map((preview, index) => (
            <div className="upload-preview" key={`${preview.file.name}-${preview.file.lastModified}`}>
              <img src={preview.url} alt={`Prévia de ${preview.file.name}`} />
              <button type="button" onClick={() => removeFile(index)} disabled={uploading} aria-label={`Remover ${preview.file.name}`}>×</button>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className={result.failed ? "upload-result warning" : "upload-result success"}>
          <strong>{result.sent > 0 ? "Fotos recebidas! 💚" : "Não conseguimos concluir o envio."}</strong>
          <span>
            {result.sent} enviada{result.sent === 1 ? "" : "s"}
            {result.failed > 0 && ` · ${result.failed} com falha`}
          </span>
          {result.sent > 0 && <Link href="/">Ver na galeria</Link>}
        </div>
      )}
    </section>
  );
}
