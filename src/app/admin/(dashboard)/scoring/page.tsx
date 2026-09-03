"use client";

import { useEffect, useState, FormEvent } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { COMPETENCES } from "@/lib/options";

interface Critere {
  id: string;
  nom: string;
  poids: number;
  actif: boolean;
}

export default function ScoringPage() {
  const [criteres, setCriteres] = useState<Critere[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNom, setNewNom] = useState("");
  const [newPoids, setNewPoids] = useState(10);

  useEffect(() => {
    fetch("/api/scoring")
      .then((res) => res.json())
      .then((data) => setCriteres(data))
      .catch(() => setError("Impossible de charger les critères."))
      .finally(() => setLoading(false));
  }, []);

  // On ne propose que les compétences pas déjà utilisées comme critère
  const competencesDisponibles = COMPETENCES.filter(
    (c) => !criteres.some((cr) => cr.nom === c)
  );

  function updateLocal(id: string, poids: number) {
    setCriteres((prev) =>
      prev.map((c) => (c.id === id ? { ...c, poids } : c))
    );
  }

  async function toggleActif(id: string, actif: boolean) {
    setCriteres((prev) =>
      prev.map((c) => (c.id === id ? { ...c, actif } : c))
    );
    await fetch(`/api/scoring/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif }),
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        criteres.map((c) =>
          fetch(`/api/scoring/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ poids: c.poids }),
          })
        )
      );
    } catch {
      setError("Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newNom.trim()) return;
    const res = await fetch("/api/scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: newNom.trim(), poids: newPoids }),
    });
    if (res.ok) {
      const critere = await res.json();
      setCriteres((prev) => [...prev, critere]);
      setNewNom("");
      setNewPoids(10);
    }
  }

  async function handleDelete(id: string) {
    setCriteres((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/scoring/${id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <p className="text-lg font-medium text-slate-900">
        Préférences de scoring
      </p>
      <p className="mb-5 text-sm text-slate-500">
        Définis les critères qui comptent pour ce poste
      </p>

      {loading && <p className="text-sm text-slate-400">Chargement...</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-3">
        {criteres.map((c) => (
          <div
            key={c.id}
            className="rounded-md border border-slate-200 bg-white p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={c.actif}
                  onChange={(e) => toggleActif(c.id, e.target.checked)}
                />
                {c.nom}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">
                  {c.poids}%
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  supprimer
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={c.poids}
              onChange={(e) => updateLocal(c.id, Number(e.target.value))}
              className="w-full accent-blue-700"
            />
          </div>
        ))}

        {!loading && criteres.length === 0 && (
          <p className="text-sm text-slate-400">
            Aucun critère défini pour le moment.
          </p>
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchableSelect
              id="nouveau-critere"
              label=""
              value={newNom}
              options={competencesDisponibles}
              onChange={setNewNom}
              placeholder="Choisir une compétence..."
            />
          </div>
          <input
            type="number"
            min={0}
            max={100}
            value={newPoids}
            onChange={(e) => setNewPoids(Number(e.target.value))}
            className="h-[38px] w-16 shrink-0 rounded-md border border-slate-300 px-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!newNom.trim()}
          className="rounded-md border border-blue-300 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40"
        >
          + Ajouter comme critère
        </button>
      </form>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || criteres.length === 0}
        className="mt-5 w-full rounded-md bg-blue-700 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}