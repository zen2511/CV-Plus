import { prisma } from "@/lib/prisma";
import ScoreBadge from "@/components/admin/ScoreBadge";
import DeleteCandidatButton from "@/components/admin/DeleteCandidatButton";

export default async function AcceptesPage() {
  const candidats = await prisma.candidat.findMany({
    where: { statut: "ACCEPTE" },
    orderBy: { dateTraite: "desc" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      ville: true,
      score: true,
      dateTraite: true,
      formations: { select: { diplome: true }, take: 1 },
    },
  });

  return (
    <div className="p-6">
      <p className="text-lg font-medium text-slate-900">CV acceptés</p>
      <p className="mb-5 text-sm text-slate-500">
        {candidats.length} candidature{candidats.length > 1 ? "s" : ""} retenue
        {candidats.length > 1 ? "s" : ""} définitivement
      </p>

      <div className="flex flex-col gap-2">
        {candidats.length === 0 && (
          <p className="text-sm text-slate-400">
            Aucune candidature acceptée pour le moment.
          </p>
        )}
        {candidats.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-slate-900">
                {c.prenom} {c.nom}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {[
                  c.ville,
                  c.formations[0]?.diplome,
                  c.dateTraite &&
                    `Accepté le ${c.dateTraite.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge score={c.score} />
              <DeleteCandidatButton id={c.id} />
            </div>
          </div>
        ))}
      </div>

      <a
        href="/api/candidatures/export?statut=ACCEPTE"
        className="mt-4 block rounded-md border border-slate-300 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Exporter la liste
      </a>
    </div>
  );
}
