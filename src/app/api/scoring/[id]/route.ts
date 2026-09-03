import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { TypeCritere } from "@prisma/client";

const TYPES_VALIDES: TypeCritere[] = ["MOT_CLE", "EXPERIENCE_MIN", "LANGUE"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { poids, actif, nom, type, valeur } = body ?? {};

  const typeValide =
    typeof type === "string" && TYPES_VALIDES.includes(type as TypeCritere)
      ? (type as TypeCritere)
      : undefined;

  const critere = await prisma.critereScoring.update({
    where: { id },
    data: {
      ...(typeof poids === "number" ? { poids } : {}),
      ...(typeof actif === "boolean" ? { actif } : {}),
      ...(typeof nom === "string" ? { nom } : {}),
      ...(typeValide ? { type: typeValide } : {}),
      ...(valeur !== undefined ? { valeur } : {}),
    },
  });

  return NextResponse.json(critere);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.critereScoring.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
