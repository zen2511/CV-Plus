import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

async function getStats() {
  const [total, enAttente, acceptes, refuses, meilleurs] = await Promise.all([
    prisma.candidat.count(),
    prisma.candidat.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.candidat.count({ where: { statut: "ACCEPTE" } }),
    prisma.candidat.count({ where: { statut: "REFUSE" } }),
    prisma.candidat.findMany({
      orderBy: { score: "desc" },
      take: 5,
      select: { id: true, nom: true, prenom: true, score: true },
    }),
  ]);

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const recents = await prisma.candidat.findMany({
    where: { dateEnvoi: { gte: since } },
    select: { dateEnvoi: true },
  });

  const counts = new Array(7).fill(0);
  for (const { dateEnvoi } of recents) {
    const diffDays = Math.floor(
      (dateEnvoi.getTime() - since.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
  }
  const labels = new Array(7)
    .fill(0)
    .map((_, i) => {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      return JOURS[d.getDay()];
    });

  return { total, enAttente, acceptes, refuses, meilleurs, counts, labels };
}

export default async function DashboardPage() {
  const { total, enAttente, acceptes, refuses, meilleurs, counts, labels } =
    await getStats();
  const maxCount = Math.max(1, ...counts);

  return (
    <div className="p-6">
      <p className="text-lg font-medium text-slate-900">Dashboard</p>
      <p className="mb-6 text-sm text-slate-500">
        Vue d&apos;ensemble des candidatures
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total reçus" value={total} />
        <StatCard label="En attente" value={enAttente} />
        <StatCard label="Acceptés" value={acceptes} tone="success" />
        <StatCard label="Refusés" value={refuses} tone="danger" />
      </div>

      <p className="mb-3 text-sm font-medium text-slate-900">
        Candidatures reçues (7 derniers jours)
      </p>
      <div className="mb-8 flex h-24 items-end gap-2">
        {counts.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-blue-700"
              style={{ height: `${Math.max(4, (v / maxCount) * 80)}px` }}
            />
            <span className="text-[10px] text-slate-400">{labels[i]}</span>
          </div>
        ))}
      </div>

      <p className="mb-3 text-sm font-medium text-slate-900">
        Meilleurs profils
      </p>
      <div className="flex flex-col gap-2">
        {meilleurs.length === 0 && (
          <p className="text-sm text-slate-400">
            Aucune candidature reçue pour le moment.
          </p>
        )}
        {meilleurs.map((c: { id: string; nom: string; prenom: string; score: number }) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <span>
              {c.prenom} {c.nom}
            </span>
            <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {c.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "danger";
}) {
  const bg =
    tone === "success"
      ? "bg-green-100"
      : tone === "danger"
      ? "bg-red-100"
      : "bg-slate-100";
  const text =
    tone === "success"
      ? "text-green-700"
      : tone === "danger"
      ? "text-red-700"
      : "text-slate-900";

  return (
    <div className={`rounded-md ${bg} p-3`}>
      <p className={`text-xs ${tone ? text : "text-slate-500"}`}>{label}</p>
      <p className={`text-xl font-semibold ${text}`}>{value}</p>
    </div>
  );
}
