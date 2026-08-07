import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { deletePhotoRecord, deleteStorageObject } from "@/lib/supabase";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const storagePath = await deletePhotoRecord(id);

    if (!storagePath) {
      return NextResponse.json(
        { message: "Foto não encontrada." },
        { status: 404 },
      );
    }

    let storageWarning: string | null = null;
    try {
      await deleteStorageObject(storagePath);
    } catch (error) {
      console.error("Foto removida do banco, mas não do Storage:", error);
      storageWarning = "O registro foi removido, mas o arquivo pode precisar de limpeza no Storage.";
    }

    return NextResponse.json({ ok: true, warning: storageWarning });
  } catch (error) {
    console.error("Erro ao excluir foto:", error);
    return NextResponse.json(
      { message: "Não foi possível excluir a foto." },
      { status: 500 },
    );
  }
}
