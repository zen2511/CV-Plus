import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScoreBadge from "@/components/admin/ScoreBadge";
import { statutLabel } from "@/lib/ui";
import type { Prisma } from "@prisma/client";

interface SearchParams {
  q?: string;
  ville?: string;
  diplome?: string;
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

  return (
    <div className="p-6">
      <p className="text-lg font-medium text-slate-900">
        Candidatures reçues
      </p>
      <p className="mb-5 text-sm text-slate-500">{total} CV reçus</p>

      <form className="mb-5 flex flex-col gap-2 sm:flex-row" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Rechercher un candidat"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 sm:flex-1"
        />
        <select
          name="ville"
          defaultValue={params.ville ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:w-40"
        >
          <option value="">Ville</option>
          {villes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          name="diplome"
          defaultValue={params.diplome ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:w-40"
        >
          <option value="">Diplôme</option>
          {diplomes.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white"
        >
          Filtrer
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {candidats.length === 0 && (
          <p className="text-sm text-slate-400">Aucune candidature ne correspond à ces filtres.</p>
        )}
        {candidats.map((c) => (
          <Link
            key={c.id}
            href={`/admin/candidatures/${c.id}`}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-blue-300"
          >
            <div>
              <p className="font-medium text-slate-900">
                {c.prenom} {c.nom}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {[c.ville, c.formations[0]?.diplome, c.dateEnvoi.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <ScoreBadge score={c.score} />
              <span className="text-[11px] text-slate-400">
                {statutLabel(c.statut)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
