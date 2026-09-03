"use client";

import { useEffect, useState, FormEvent } from "react";

type TypeCritere = "MOT_CLE" | "EXPERIENCE_MIN" | "LANGUE";

interface Critere {
  id: string;
  nom: string;
  type: TypeCritere;
  valeur: string | null;
  poids: number;
  actif: boolean;
}

const TYPE_LABEL: Record<TypeCritere, string> = {
  MOT_CLE: "Mot-clé (diplôme, compétence...)",
  EXPERIENCE_MIN: "Années d'expérience minimum",
  LANGUE: "Langue parlée",
};

function badgeLabel(c: Critere) {
  if (c.type === "EXPERIENCE_MIN") {
    return `${c.nom} — ${c.valeur ?? "?"} an(s) min.`;
  }
  if (c.type === "LANGUE") {
    return `${c.nom} — langue : ${c.valeur ?? c.nom}`;
  }
  return c.nom;
}

export default function ScoringPage() {
  const [criteres, setCriteres] = useState<Critere[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newType, setNewType] = useState<TypeCritere>("MOT_CLE");
  const [newNom, setNewNom] = useState("");
  const [newValeur, setNewValeur] = useState("");
  const [newPoids, setNewPoids] = useState(10);

  useEffect(() => {
    fetch("/api/scoring")
      .then((res) => res.json())
      .then((data) => setCriteres(data))
      .catch(() => setError("Impossible de charger les critères."))
      .finally(() => setLoading(false));
  }, []);

  function updateLocal(id: string, poids: number) {
    setCriteres((prev) => prev.map((c) => (c.id === id ? { ...c, poids } : c)));
  }

  async function toggleActif(id: string, actif: boolean) {
    setCriteres((prev) => prev.map((c) => (c.id === id ? { ...c, actif } : c)));
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
    if (newType !== "MOT_CLE" && !newValeur.trim()) return;

    const res = await fetch("/api/scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: newNom.trim(),
        poids: newPoids,
        type: newType,
        valeur: newType === "MOT_CLE" ? null : newValeur.trim(),
      }),
    });
    if (res.ok) {
      const critere = await res.json();
      setCriteres((prev) => [...prev, critere]);
      setNewNom("");
      setNewValeur("");
      setNewPoids(10);
      setNewType("MOT_CLE");
    }
  }

  async function handleDelete(id: string) {
    setCriteres((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/scoring/${id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <p className="text-lg font-medium text-slate-900">Préférences de scoring</p>
      <p className="mb-5 text-sm text-slate-500">
        Définis les critères qui comptent pour ce poste
      </p>

      {loading && <p className="text-sm text-slate-400">Chargement...</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-3">
        {criteres.map((c) => (
          <div key={c.id} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={c.actif}
                  onChange={(e) => toggleActif(c.id, e.target.checked)}
                />
                <span>
                  {badgeLabel(c)}
                  <span className="ml-1 text-[10px] uppercase text-slate-400">
                    {c.type === "MOT_CLE" ? "" : c.type === "LANGUE" ? "langue" : "expérience"}
                  </span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-700">{c.poids}%</span>
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
          <p className="text-sm text-slate-400">Aucun critère défini pour le moment.</p>
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-5 flex flex-col gap-2 rounded-md border border-dashed border-slate-300 p-3">
        <select
          value={newType}
          onChange={(e) => {
            setNewType(e.target.value as TypeCritere);
            setNewValeur("");
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newNom}
          onChange={(e) => setNewNom(e.target.value)}
          placeholder={
            newType === "EXPERIENCE_MIN"
              ? "Nom affiché (ex: Expérience développeur)"
              : newType === "LANGUE"
              ? "Nom affiché (ex: Anglais professionnel)"
              : "Mot-clé (ex: React, Génie logiciel...)"
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
        />

        {newType === "EXPERIENCE_MIN" && (
          <input
            type="number"
            min={0}
            value={newValeur}
            onChange={(e) => setNewValeur(e.target.value)}
            placeholder="Nombre d'années minimum (ex: 2)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        )}
        {newType === "LANGUE" && (
          <input
            type="text"
            value={newValeur}
            onChange={(e) => setNewValeur(e.target.value)}
            placeholder="Langue exacte (ex: Anglais)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        )}

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Poids</label>
          <input
            type="number"
            min={0}
            max={100}
            value={newPoids}
            onChange={(e) => setNewPoids(Number(e.target.value))}
            className="w-16 rounded-md border border-slate-300 px-2 py-2 text-sm"
          />
          <span className="text-xs text-slate-500">%</span>
          <button
            type="submit"
            className="ml-auto rounded-md border border-blue-300 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            + Ajouter le critère
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || criteres.length === 0}
        className="mt-5 w-full rounded-md bg-blue-700 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Enregistrer les poids"}
      </button>
    </div>
  );
}
