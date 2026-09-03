"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ScoreBadge from "@/components/admin/ScoreBadge";
import { statutLabel } from "@/lib/ui";

interface Props {
  id: string;
  nom: string;
  prenom: string;
  score: number;
  statut: string;
  sousLigne: string;
}

export default function CandidatureRow({
  id,
  nom,
  prenom,
  score,
  statut,
  sousLigne,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatut(
    e: React.MouseEvent,
    newStatut: "ACCEPTE" | "REFUSE"
  ) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidatures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour.");
      router.refresh();
    } catch {
      setError("Échec.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-blue-300">
      <Link href={`/admin/candidatures/${id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">
          {prenom} {nom}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{sousLigne}</p>
        {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <ScoreBadge score={score} />

        {statut === "EN_ATTENTE" ? (
          <div className="flex gap-1">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => updateStatut(e, "REFUSE")}
              className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Refuser
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => updateStatut(e, "ACCEPTE")}
              className="rounded-md bg-green-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              Accepter
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            {statutLabel(statut)}
          </span>
        )}
      </div>
    </div>
  );
}