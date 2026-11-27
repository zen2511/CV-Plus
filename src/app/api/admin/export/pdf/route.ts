import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (s?: string | number | null) =>
  String(s ?? "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

function fit(t: string, w: number, f: PDFFont, size: number) {
  while (t.length > 1 && f.widthOfTextAtSize(t, size) > w) t = t.slice(0, -1);
  return t;
}

const norm = (v?: string | null) => (v ?? "").trim().replace(/\s+/g, " ");
const cle = (v?: string | null) => norm(v).toLowerCase();
const joli = (v?: string | null) =>
  cle(v).replace(/(^|[\s-])([a-zà-ÿ])/g, (_m, a, b) => a + b.toUpperCase());

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response("Non autorisé", { status: 401 });

  const ville = new URL(req.url).searchParams.get("ville");
  const tous = await prisma.candidat.findMany({
    where: ville ? { ville: { equals: ville, mode: "insensitive" } } : {},
    select: {
      nom: true, prenom: true, email: true, telephone: true,
      ville: true, metier: true, score: true, statut: true,
    },
  });

  // Regroupement par ville
  const groupes = new Map<string, { titre: string; items: typeof tous }>();
  for (const c of tous) {
    const k = cle(c.ville);
    if (!groupes.has(k)) {
      groupes.set(k, {
        titre: k ? joli(c.ville) : "Ville non renseignée",
        items: [],
      });
    }
    groupes.get(k)!.items.push(c);
  }
  const liste = [...groupes.entries()].sort(([a], [b]) =>
    a === "" ? 1 : b === "" ? -1 : a.localeCompare(b, "fr")
  );
  for (const [, g] of liste) {
    g.items.sort(
      (a, b) =>
        a.nom.localeCompare(b.nom, "fr") ||
        a.prenom.localeCompare(b.prenom, "fr")
    );
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 842, H = 595, M = 30;
  const cols: [string, number][] = [
    ["Nom et prénom", 170], ["Email", 200], ["Téléphone", 100],
    ["Métier", 150], ["Score", 40], ["Statut", 80],
  ];

  let page = pdf.addPage([W, H]);
  let y = H - M;

  page.drawText(
    clean(
      `Candidatures CV+ classées par ville${ville ? " - " + ville : ""} (${tous.length})`
    ),
    { x: M, y, size: 14, font: bold }
  );
  y -= 30;

  const bande = (titre: string) => {
    page.drawRectangle({
      x: M, y: y - 6, width: W - 2 * M, height: 20,
      color: rgb(0.11, 0.31, 0.85),
    });
    page.drawText(clean(titre), {
      x: M + 6, y, size: 11, font: bold, color: rgb(1, 1, 1),
    });
    y -= 24;
    let x = M + 4;
    for (const [n, w] of cols) {
      page.drawText(clean(n), {
        x, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2),
      });
      x += w;
    }
    y -= 6;
    page.drawLine({
      start: { x: M, y }, end: { x: W - M, y },
      thickness: 0.5, color: rgb(0.7, 0.7, 0.7),
    });
    y -= 14;
  };

  for (const [, g] of liste) {
    if (y < M + 90) { page = pdf.addPage([W, H]); y = H - M; }
    bande(`${g.titre} (${g.items.length})`);

    for (const c of g.items) {
      if (y < M + 20) {
        page = pdf.addPage([W, H]);
        y = H - M;
        bande(`${g.titre} (suite)`);
      }
      const vals = [
        `${c.nom} ${c.prenom}`, c.email, c.telephone,
        c.metier, c.score, c.statut,
      ];
      let x = M + 4;
      vals.forEach((v, i) => {
        page.drawText(fit(clean(v), cols[i][1] - 6, font, 9), {
          x, y, size: 9, font,
        });
        x += cols[i][1];
      });
      y -= 16;
    }
    y -= 14;
  }

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="cv-par-ville.pdf"',
      "Cache-Control": "no-store",
    },
  });
      }
