"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  candidatId: string;
  prenom: string;
  statut: string;
}

export default function CandidateActions({ candidatId, prenom, statut }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatut(newStatut: "ACCEPTE" | "REFUSE") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidatures/${candidatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour du statut.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccepter() {
    await updateStatut("ACCEPTE");
    setShowConfirm(true);
  }

  async function handleEnvoyerEmail() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Échec de l'envoi de l'email.");
      }
      setShowConfirm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  if (statut !== "EN_ATTENTE") {
    return (
      <p className="text-sm text-slate-500">
        Statut actuel :{" "}
        <span className="font-medium text-slate-900">
          {statut === "ACCEPTE" ? "Accepté" : "Refusé"}
        </span>
      </p>
    );
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatut("REFUSE")}
          className="flex-1 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-60"
        >
          Refuser
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleAccepter}
          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Accepter
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
              ✓
            </div>
            <p className="text-sm font-medium text-slate-900">
              Candidature acceptée
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Envoyer un email de confirmation à {prenom} ?
            </p>

            <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
              <p className="mb-1 text-[11px] text-slate-400">
                Aperçu de l&apos;email
              </p>
              Objet : Votre candidature a été retenue
              <br />
              Bonjour {prenom}, nous avons le plaisir de...
            </div>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                Ne pas envoyer
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleEnvoyerEmail}
                className="flex-1 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
