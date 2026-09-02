import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidat = await prisma.candidat.findUnique({
    where: { id },
    include: {
      formations: true,
      experiences: true,
      competences: true,
      langues: true,
      liens: true,
    },
  });
  if (!candidat) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json(candidat);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const statut = body?.statut as "ACCEPTE" | "REFUSE" | undefined;

  if (!statut || !["ACCEPTE", "REFUSE"].includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const candidat = await prisma.candidat.update({
    where: { id },
    data: { statut, dateTraite: new Date() },
  });

  return NextResponse.json(candidat);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.candidat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
