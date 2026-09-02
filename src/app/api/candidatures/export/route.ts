import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const statut = req.nextUrl.searchParams.get("statut") as
    | "EN_ATTENTE"
    | "ACCEPTE"
    | "REFUSE"
    | null;

  const candidats = await prisma.candidat.findMany({
    where: statut ? { statut } : undefined,
    orderBy: { score: "desc" },
    include: { formations: { take: 1 } },
  });

  const header = ["Nom", "Prénom", "Email", "Ville", "Diplôme", "Score", "Statut", "Date d'envoi"];
  const rows = candidats.map((c) =>
    [
      c.nom,
      c.prenom,
      c.email,
      c.ville ?? "",
      c.formations[0]?.diplome ?? "",
      String(c.score),
      c.statut,
      c.dateEnvoi.toISOString().slice(0, 10),
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidatures${statut ? `-${statut.toLowerCase()}` : ""}.csv"`,
    },
  });
}
