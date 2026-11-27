import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const clean = (s?: string | number | null) =>
  String(s ?? "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

function fit(t: string, w: number, f: PDFFont, size: number) {
  while (t.length > 1 && f.widthOfTextAtSize(t, size) > w) t = t.slice(0, -1);
  return t;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response("Non autorisé", { status: 401 });

  const ville = new URL(req.url).searchParams.get("ville");
  const candidats = await prisma.candidat.findMany({
    where: ville ? { ville: { equals: ville, mode: "insensitive" } } : {},
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 842, H = 595, M = 30;
  const cols: [string, number][] = [
    ["Nom et prénom", 150], ["Ville", 90], ["Email", 180],
    ["Téléphone", 90], ["Métier", 130], ["Score", 40], ["Statut", 70],
  ];

  let page = pdf.addPage([W, H]);
  let y = H - M;
  const header = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 20,
      color: rgb(0.11, 0.31, 0.85) });
    let x = M + 4;
    for (const [n, w] of cols) {
      page.drawText(clean(n), { x, y, size: 9, font: bold, color: rgb(1, 1, 1) });
      x += w;
    }
    y -= 22;
  };

  page.drawText(
    clean(`Candidatures CV+ ${ville ? "- " + ville : ""} (${candidats.length})`),
    { x: M, y, size: 14, font: bold }
  );
  y -= 26;
  header();

  for (const c of candidats) {
    if (y < M + 20) { page = pdf.addPage([W, H]); y = H - M; header(); }
    const vals = [`${c.nom} ${c.prenom}`, c.ville, c.email, c.telephone,
                  c.metier, c.score, c.statut];
    let x = M + 4;
    vals.forEach((v, i) => {
      page.drawText(fit(clean(v), cols[i][1] - 6, font, 9),
        { x, y, size: 9, font });
      x += cols[i][1];
    });
    y -= 16;
  }

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="cv-export.pdf"',
    },
  });
}
