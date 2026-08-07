import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { updateToken } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      active?: boolean;
      maxUploads?: number | null;
    };
    const patch: { active?: boolean; max_uploads?: number | null } = {};

    if (typeof body.active === "boolean") patch.active = body.active;
    if (body.maxUploads === null) patch.max_uploads = null;
    if (body.maxUploads !== null && body.maxUploads !== undefined) {
      const parsed = Number(body.maxUploads);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5000) {
        return NextResponse.json(
          { message: "Limite inválido." },
          { status: 400 },
        );
      }
      patch.max_uploads = parsed;
    }

    if (!Object.keys(patch).length) {
      return NextResponse.json(
        { message: "Nenhuma alteração informada." },
        { status: 400 },
      );
    }

    const token = await updateToken(id, patch);
    if (!token) {
      return NextResponse.json(
        { message: "Convidado não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Erro ao atualizar token:", error);
    return NextResponse.json(
      { message: "Não foi possível atualizar o código." },
      { status: 500 },
    );
  }
}
