import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getOrCreateAdminId() {
  // Un seul admin gère le scoring pour l'instant.
  const admin = await prisma.admin.findFirst();
  return admin?.id ?? null;
}

export async function GET() {
  const adminId = await getOrCreateAdminId();
  if (!adminId) return NextResponse.json([]);

  const criteres = await prisma.critereScoring.findMany({
    where: { adminId },
    orderBy: { poids: "desc" },
  });
  return NextResponse.json(criteres);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const adminId = await getOrCreateAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Aucun admin trouvé" }, { status: 400 });
  }

  const body = await req.json();
  const { nom, poids, type, valeur } = body ?? {};
  if (!nom || typeof poids !== "number") {
    return NextResponse.json(
      { error: "nom et poids (nombre) sont requis" },
      { status: 400 }
    );
  }

  const critere = await prisma.critereScoring.create({
    data: {
      adminId,
      nom,
      poids,
      type: type ?? "MOT_CLE",
      valeur: valeur ?? null,
    },
  });

  return NextResponse.json(critere, { status: 201 });
}
