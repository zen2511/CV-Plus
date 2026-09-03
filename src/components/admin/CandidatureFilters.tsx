"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SECTEURS, NIVEAUX_QUALIFICATION } from "@/lib/metiers";

interface Props {
  villes: string[];
  diplomes: string[];
  defaultValues: {
    q: string;
    ville: string;
    diplome: string;
    secteur: string;
    metier: string;
    niveau: string;
  };
}

export default function CandidatureFilters({ villes, diplomes, defaultValues }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValues.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(overrides: Partial<Props["defaultValues"]>) {
    const params = new URLSearchParams({
      q,
      ville: defaultValues.ville,
      diplome: defaultValues.diplome,
      secteur: defaultValues.secteur,
      metier: defaultValues.metier,
      niveau: defaultValues.niveau,
      ...overrides,
    });
    for (const [key, value] of [...params.entries()]) {
      if (!value) params.delete(key);
    }
    router.push(`/admin/candidatures?${params.toString()}`);
  }

  // Auto-filtre sur la recherche texte, avec un petit délai (debounce)
  useEffect(() => {
    if (q === defaultValues.q) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ q }), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const aUnFiltreActif =
    defaultValues.q ||
    defaultValues.ville ||
    defaultValues.diplome ||
    defaultValues.secteur ||
    defaultValues.metier ||
    defaultValues.niveau;

  return (
    <div className="mb-5 flex flex-col gap-2">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un candidat (nom, prénom, email)"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <select
          value={defaultValues.ville}
          onChange={(e) => navigate({ ville: e.target.value })}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">Ville</option>
          {villes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={defaultValues.secteur}
          onChange={(e) => navigate({ secteur: e.target.value })}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">Secteur</option>
          {SECTEURS.map((s) => (
            <option key={s.code} value={s.nom}>
              {s.nom}
            </option>
          ))}
        </select>

        <select
          value={defaultValues.metier}
          onChange={(e) => navigate({ metier: e.target.value })}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">Métier</option>
          {SECTEURS.map((s) => (
            <optgroup key={s.code} label={s.nom}>
              {s.metiers.map((m) => (
                <option key={m.code} value={m.nom}>
                  {m.nom}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <select
          value={defaultValues.niveau}
          onChange={(e) => navigate({ niveau: e.target.value })}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">Niveau</option>
          {NIVEAUX_QUALIFICATION.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <select
          value={defaultValues.diplome}
          onChange={(e) => navigate({ diplome: e.target.value })}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">Diplôme</option>
          {diplomes.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {aUnFiltreActif && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push("/admin/candidatures");
          }}
          className="self-start text-xs text-slate-500 underline"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}