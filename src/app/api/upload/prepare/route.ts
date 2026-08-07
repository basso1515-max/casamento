import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGuestSession } from "@/lib/session";
import { createSignedUploadUrl, getTokenById } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES_PER_BATCH = 20;
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
const MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type RequestedFile = {
  name: string;
  type: string;
  size: number;
};

function extensionFor(file: RequestedFile) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (EXTENSIONS.has(extension)) return extension;

  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return byMime[file.type] || "jpg";
}

function mimeFor(extension: string, originalType: string) {
  if (originalType) return originalType;
  const byExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return byExtension[extension] || "image/jpeg";
}

function validateFile(file: RequestedFile) {
  if (!file.name || !Number.isFinite(file.size) || file.size <= 0) {
    return "Arquivo inválido.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: o limite por foto é 25 MB.`;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!MIME_TYPES.has(file.type) && !EXTENSIONS.has(extension)) {
    return `${file.name}: formato não suportado.`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getGuestSession();
    if (!session) {
      return NextResponse.json(
        { message: "Digite seu código novamente para continuar." },
        { status: 401 },
      );
    }

    const token = await getTokenById(session.tokenId);
    if (!token || !token.active) {
      return NextResponse.json(
        { message: "Este código não está mais ativo." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { files?: RequestedFile[] };
    const files = Array.isArray(body.files) ? body.files : [];

    if (!files.length || files.length > MAX_FILES_PER_BATCH) {
      return NextResponse.json(
        { message: `Selecione de 1 a ${MAX_FILES_PER_BATCH} fotos por vez.` },
        { status: 400 },
      );
    }

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        return NextResponse.json(
          { message: validationError },
          { status: 400 },
        );
      }
    }

    if (
      token.max_uploads !== null &&
      token.uploads_used + files.length > token.max_uploads
    ) {
      const remaining = Math.max(token.max_uploads - token.uploads_used, 0);
      return NextResponse.json(
        {
          message:
            remaining === 0
              ? "Este código já atingiu o limite de fotos."
              : `Você pode enviar mais ${remaining} foto${remaining === 1 ? "" : "s"} com este código.`,
        },
        { status: 400 },
      );
    }

    const dateFolder = new Date().toISOString().slice(0, 10);
    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const extension = extensionFor(file);
        const storagePath = `${session.tokenId}/${dateFolder}/${randomUUID()}.${extension}`;
        const signedUrl = await createSignedUploadUrl(storagePath);
        return {
          index,
          storagePath,
          signedUrl,
          originalName: file.name,
          contentType: mimeFor(extension, file.type),
          size: file.size,
        };
      }),
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Erro ao preparar uploads:", error);
    return NextResponse.json(
      { message: "Não foi possível preparar o envio das fotos." },
      { status: 500 },
    );
  }
}
