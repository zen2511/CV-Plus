import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerEmailAcceptation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { candidatId } = await req.json();
  if (!candidatId) {
    return NextResponse.json({ error: "candidatId requis" }, { status: 400 });
  }

  const candidat = await prisma.candidat.findUnique({
    where: { id: candidatId },
  });
  if (!candidat) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  try {
    await envoyerEmailAcceptation(candidat);
  } catch (err) {
    await prisma.emailLog.create({
      data: { candidatId, type: "acceptation", statut: "echec" },
    });
    const message = err instanceof Error ? err.message : "Erreur d'envoi";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await prisma.emailLog.create({
    data: { candidatId, type: "acceptation", statut: "envoye" },
  });

  return NextResponse.json({ ok: true });
}
