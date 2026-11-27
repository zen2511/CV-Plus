/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const STATUTS = ["EN_ATTENTE", "ACCEPTE", "REFUSE"];
const TRIS = ["score", "dateEnvoi", "nom", "ville"];

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response("Non autorisé", { status: 401 });

  const p = new URL(req.url).searchParams;
  const where: any = {};

  const statut = p.get("statut");
  if (statut && STATUTS.includes(statut)) where.statut = statut;
  const ville = p.get("ville");
  if (ville) where.ville = { equals: ville, mode: "insensitive" };

  const tri = TRIS.includes(p.get("tri") || "") ? p.get("tri")! : "nom";
  const ordre = p.get("ordre") === "desc" ? "desc" : "asc";

  const candidats = await prisma.candidat.findMany({
    where,
    orderBy: [{ ville: "asc" }, { nom: "asc" }, { prenom: "asc" }],
    include: {
      formations: true, experiences: true,
      competences: true, langues: true, liens: true,
    },
  });

  const wb = new ExcelJS.Workbook();
  const head = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    ws.getRow(1).fill = { type: "pattern", pattern: "solid",
      fgColor: { argb: "FF1D4ED8" } };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  const c = wb.addWorksheet("Candidats");
  c.columns = [
    { header: "Nom", key: "nom", width: 18 },
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Téléphone", key: "tel", width: 16 },
    { header: "Ville", key: "ville", width: 16 },
    { header: "Titre", key: "titre", width: 24 },
    { header: "Secteur", key: "secteur", width: 20 },
    { header: "Métier", key: "metier", width: 20 },
    { header: "Qualification", key: "niveau", width: 18 },
    { header: "Années d'exp.", key: "annees", width: 14 },
    { header: "Statut", key: "statut", width: 12 },
    { header: "Score", key: "score", width: 8 },
    { header: "Date d'envoi", key: "envoi", width: 14 },
    { header: "Compétences", key: "comp", width: 40 },
    { header: "Langues", key: "lang", width: 28 },
  ];
  head(c);
  for (const x of candidats) {
    c.addRow({
      nom: x.nom, prenom: x.prenom, email: x.email, tel: x.telephone,
      ville: x.ville, titre: x.titre, secteur: x.secteurActivite,
      metier: x.metier, niveau: x.niveauQualification,
      annees: x.anneesExperience, statut: x.statut, score: x.score,
      envoi: x.dateEnvoi,
      comp: x.competences.map((k: any) => k.nom).join(", "),
      lang: x.langues.map((l: any) => `${l.nom} (${l.niveau})`).join(", "),
    });
  }
  c.getColumn("envoi").numFmt = "dd/mm/yyyy";

  const annexe = (nom: string, cols: string[], rows: any[][]) => {
    const ws = wb.addWorksheet(nom);
    ws.addRow(["Candidat", "Email", ...cols]);
    head(ws);
    rows.forEach((r) => ws.addRow(r));
    ws.columns.forEach((col) => (col.width = 24));
  };
  const flat = (f: (x: any) => any[][]) =>
    candidats.flatMap((x: any) =>
      f(x).map((r) => [`${x.nom} ${x.prenom}`, x.email, ...r])
    );

  annexe("Formations", ["Niveau", "Établissement", "Diplôme", "Début", "Fin"],
    flat((x) => x.formations.map((f: any) =>
      [f.niveau, f.etablissement, f.diplome, f.anneeDebut, f.anneeFin])));
  annexe("Expériences", ["Poste", "Entreprise", "Début", "Fin", "Description"],
    flat((x) => x.experiences.map((e: any) => [
      e.poste, e.entreprise,
      e.dateDebut?.toLocaleDateString("fr-FR"),
      e.dateFin?.toLocaleDateString("fr-FR"),
      e.description,
    ])));
  annexe("Liens", ["Type", "URL"],
    flat((x) => x.liens.map((l: any) => [l.type, l.url])));

  const buf = await wb.xlsx.writeBuffer();
  return new Response(new Uint8Array(buf as ArrayBuffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="cv-export.xlsx"',
    },
  });
}
