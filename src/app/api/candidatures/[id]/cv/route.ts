import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCv } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const candidat = await prisma.candidat.findUnique({
    where: { id },
    select: { cvKey: true, nom: true, prenom: true },
  });

  if (!candidat?.cvKey) {
    return NextResponse.json(
      { error: "Aucun CV pour ce candidat." },
      { status: 404 }
    );
  }

  const fichier = await getCv(candidat.cvKey);
  if (!fichier) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  return new NextResponse(fichier, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CV-${candidat.prenom}-${candidat.nom}.pdf"`,
    },
  });
}