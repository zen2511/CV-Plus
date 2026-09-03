import { prisma } from "@/lib/prisma";
import CandidatureRow from "@/components/admin/CandidatureRow";
import CandidatureFilters from "@/components/admin/CandidatureFilters";
import type { Prisma } from "@prisma/client";

interface SearchParams {
  q?: string;
  ville?: string;
  diplome?: string;
  secteur?: string;
  metier?: string;
  niveau?: string;
}

async function getFiltres() {
  const [villesRaw, diplomesRaw] = await Promise.all([
    prisma.candidat.findMany({
      where: { ville: { not: null } },
      select: { ville: true },
      distinct: ["ville"],
    }),
    prisma.formation.findMany({
      select: { diplome: true },
      distinct: ["diplome"],
    }),
  ]);
  const villes = villesRaw.map((v) => v.ville).filter(Boolean) as string[];
  const diplomes = diplomesRaw.map((d) => d.diplome).filter(Boolean);
  return { villes, diplomes };
}

async function getCandidats(params: SearchParams) {
  const where: Prisma.CandidatWhereInput = {};

  if (params.q) {
    where.OR = [
      { nom: { contains: params.q, mode: "insensitive" } },
      { prenom: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.ville) {
    where.ville = { equals: params.ville, mode: "insensitive" };
  }
  if (params.diplome) {
    where.formations = {
      some: { diplome: { equals: params.diplome, mode: "insensitive" } },
    };
  }
  if (params.secteur) {
    where.secteurActivite = { equals: params.secteur, mode: "insensitive" };
  }
  if (params.metier) {
    where.metier = { equals: params.metier, mode: "insensitive" };
  }
  if (params.niveau) {
    where.niveauQualification = { equals: params.niveau, mode: "insensitive" };
  }

  return prisma.candidat.findMany({
    where,
    orderBy: { dateEnvoi: "desc" },
    include: { formations: { select: { diplome: true }, take: 1 } },
  });
}

export default async function CandidaturesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [{ villes, diplomes }, candidats, total] = await Promise.all([
    getFiltres(),
    getCandidats(params),
    prisma.candidat.count(),
  ]);

  const aUnFiltreActif =
    params.q || params.ville || params.diplome || params.secteur || params.metier || params.niveau;

  return (
    <div className="p-6">
      <p className="text-lg font-medium text-slate-900">
        Candidatures reçues
      </p>
      <p className="mb-5 text-sm text-slate-500">
        {candidats.length} résultat{candidats.length > 1 ? "s" : ""} sur {total} CV reçus
      </p>

            <CandidatureFilters
        villes={villes}
        diplomes={diplomes}
        defaultValues={{
          q: params.q ?? "",
          ville: params.ville ?? "",
          diplome: params.diplome ?? "",
          secteur: params.secteur ?? "",
          metier: params.metier ?? "",
          niveau: params.niveau ?? "",
        }}
      />
           <div className="flex flex-col gap-2">
        {candidats.length === 0 && (
          <p className="text-sm text-slate-400">Aucune candidature ne correspond à ces filtres.</p>
        )}
        {candidats.map((c) => (
          <CandidatureRow
            key={c.id}
            id={c.id}
            nom={c.nom}
            prenom={c.prenom}
            score={c.score}
            statut={c.statut}
            sousLigne={[
              c.metier,
              c.ville,
              c.formations[0]?.diplome,
              c.dateEnvoi.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </div>
    </div>
  );
}