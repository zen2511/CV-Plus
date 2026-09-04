import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};

const BLEU_MBS = "FF1D4ED8";
const BLANC = "FFFFFFFF";
const GRIS_CLAIR = "FFF8FAFC";

function formatDate(date: Date | null | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const statut = req.nextUrl.searchParams.get("statut") as
    | "EN_ATTENTE"
    | "ACCEPTE"
    | "REFUSE"
    | null;

  const candidats = await prisma.candidat.findMany({
    where: statut ? { statut } : undefined,
    orderBy: { score: "desc" },
    include: {
      formations: true,
      experiences: true,
      competences: true,
      langues: true,
      liens: true,
    },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MBS Recrutement";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Candidatures", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Prénom", key: "prenom", width: 16 },
    { header: "Nom", key: "nom", width: 16 },
    { header: "Email", key: "email", width: 26 },
    { header: "Téléphone", key: "telephone", width: 16 },
    { header: "Ville", key: "ville", width: 14 },
    { header: "Secteur d'activité", key: "secteurActivite", width: 20 },
    { header: "Métier", key: "metier", width: 20 },
    { header: "Niveau de qualification", key: "niveauQualification", width: 20 },
    { header: "Années d'expérience", key: "anneesExperience", width: 16 },
    { header: "Score", key: "score", width: 10 },
    { header: "Statut", key: "statut", width: 14 },
    { header: "Date d'envoi", key: "dateEnvoi", width: 14 },
    { header: "Date de traitement", key: "dateTraite", width: 16 },
    { header: "Formations", key: "formations", width: 40 },
    { header: "Expériences", key: "experiences", width: 45 },
    { header: "Compétences", key: "competences", width: 30 },
    { header: "Langues", key: "langues", width: 22 },
    { header: "LinkedIn", key: "linkedin", width: 28 },
    { header: "GitHub", key: "github", width: 28 },
    { header: "Portfolio", key: "portfolio", width: 28 },
    { header: "CV joint", key: "cv", width: 10 },
  ];

  // En-tête stylée (fond bleu MBS, texte blanc, gras)
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLEU_MBS } };
    cell.font = { bold: true, color: { argb: BLANC }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  headerRow.height = 22;
  sheet.autoFilter = { from: "A1", to: "U1" };

  for (const c of candidats) {
    const liensParType = Object.fromEntries(c.liens.map((l) => [l.type, l.url]));

    const row = sheet.addRow({
      prenom: c.prenom,
      nom: c.nom,
      email: c.email,
      telephone: c.telephone ?? "",
      ville: c.ville ?? "",
      secteurActivite: c.secteurActivite ?? "",
      metier: c.metier ?? "",
      niveauQualification: c.niveauQualification ?? "",
      anneesExperience: c.anneesExperience ?? "",
      score: c.score,
      statut: STATUT_LABEL[c.statut] ?? c.statut,
      dateEnvoi: formatDate(c.dateEnvoi),
      dateTraite: formatDate(c.dateTraite),
      formations: c.formations
        .map((f) => `${f.diplome || f.niveau}${f.etablissement ? " — " + f.etablissement : ""}${f.anneeDebut ? ` (${f.anneeDebut}-${f.anneeFin ?? ""})` : ""}`)
        .join(" ; "),
      experiences: c.experiences
        .map((e) => `${e.poste} — ${e.entreprise}`)
        .join(" ; "),
      competences: c.competences.map((comp) => comp.nom).join(", "),
      langues: c.langues.map((l) => `${l.nom} (${l.niveau})`).join(", "),
      linkedin: liensParType["LINKEDIN"] ?? "",
      github: liensParType["GITHUB"] ?? "",
      portfolio: liensParType["PORTFOLIO"] ?? "",
      cv: c.cvKey ? "Oui" : "Non",
    });

    // Couleur de fond selon le score (repère visuel rapide)
    const scoreFill =
      c.score >= 75 ? "FFDCFCE7" : c.score >= 50 ? "FFFEF3C7" : "FFFEE2E2";
    row.getCell("score").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: scoreFill },
    };
    row.getCell("score").font = { bold: true };

    // Lignes zébrées pour la lisibilité (sauf la cellule Score qui garde sa couleur)
    if (row.number % 2 === 0) {
      row.eachCell((cell) => {
        if (cell.address !== row.getCell("score").address) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRIS_CLAIR } };
        }
      });
    }
  }

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const suffixe = statut ? `-${statut.toLowerCase()}` : "";
  const dateFichier = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="mbs-recrutement-candidatures${suffixe}-${dateFichier}.xlsx"`,
    },
  });
}