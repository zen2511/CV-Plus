import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculerScore } from "@/lib/scoring";
import { CandidatureFormData } from "@/types/candidature";
import { getMetierCode } from "@/lib/metiers";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: CandidatureFormData;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { infos } = body;
  if (!infos?.nom?.trim() || !infos?.prenom?.trim() || !isValidEmail(infos?.email ?? "")) {
    return NextResponse.json(
      { error: "Nom, prénom et email valide sont requis." },
      { status: 400 }
    );
  }

  // Un seul admin gère le scoring pour l'instant : on prend ses critères actifs.
  const admin = await prisma.admin.findFirst();
  const criteres = admin
    ? await prisma.critereScoring.findMany({ where: { adminId: admin.id } })
    : [];

  const score = calculerScore(body, criteres);

  const candidat = await prisma.candidat.create({
    data: {
      nom: infos.nom.trim(),
      prenom: infos.prenom.trim(),
      email: infos.email.trim(),
      telephone: infos.telephone || null,
      ville: infos.ville || null,
      secteurActivite: infos.secteurActivite || null,
      metier: infos.metier || null,
      metierCode:
        infos.secteurActivite && infos.metier
          ? getMetierCode(infos.secteurActivite, infos.metier)
          : null,
      niveauQualification: infos.niveauQualification || null,
      titre: infos.titre || null,
      score,
      formations: {
        create: body.formations
          .filter((f) => f.etablissement.trim() || f.diplome.trim())
          .map((f) => ({
            niveau: f.niveau,
            etablissement: f.etablissement,
            diplome: f.diplome,
            anneeDebut: f.anneeDebut ? Number(f.anneeDebut) : null,
            anneeFin: f.anneeFin ? Number(f.anneeFin) : null,
          })),
      },
      experiences: {
        create: body.experiences
          .filter((e) => e.poste.trim() || e.entreprise.trim())
          .map((e) => ({
            poste: e.poste,
            entreprise: e.entreprise,
            dateDebut: e.dateDebut ? new Date(e.dateDebut) : null,
            dateFin: e.dateFin ? new Date(e.dateFin) : null,
            description: e.description || null,
          })),
      },
      competences: {
        create: body.competences.map((nom) => ({ nom })),
      },
      langues: {
        create: body.langues
          .filter((l) => l.nom.trim())
          .map((l) => ({ nom: l.nom, niveau: l.niveau })),
      },
      liens: {
        create: [
          ...(body.liens.linkedin
            ? [{ type: "LINKEDIN" as const, url: body.liens.linkedin }]
            : []),
          ...(body.liens.github
            ? [{ type: "GITHUB" as const, url: body.liens.github }]
            : []),
          ...(body.liens.portfolio
            ? [{ type: "PORTFOLIO" as const, url: body.liens.portfolio }]
            : []),
        ],
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: candidat.id, score }, { status: 201 });
}