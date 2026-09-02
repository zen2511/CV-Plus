import { useState } from "react";
import Field from "@/components/ui/Field";
import { LangueData } from "@/types/candidature";

interface Props {
  competences: string[];
  langues: LangueData[];
  liens: { linkedin: string; github: string; portfolio: string };
  onChangeCompetences: (v: string[]) => void;
  onChangeLangues: (v: LangueData[]) => void;
  onChangeLiens: (v: { linkedin: string; github: string; portfolio: string }) => void;
}

const NIVEAUX_LANGUE = ["Courant", "Intermédiaire", "Notions"];

export default function StepCompetences({
  competences,
  langues,
  liens,
  onChangeCompetences,
  onChangeLangues,
  onChangeLiens,
}: Props) {
  const [input, setInput] = useState("");

  function addCompetence() {
    const value = input.trim();
    if (value && !competences.includes(value)) {
      onChangeCompetences([...competences, value]);
    }
    setInput("");
  }

  function removeCompetence(c: string) {
    onChangeCompetences(competences.filter((x) => x !== c));
  }

  function updateLangue(i: number, patch: Partial<LangueData>) {
    onChangeLangues(langues.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-slate-900">
        Compétences et liens
      </p>

      <div>
        <label className="mb-1 block text-sm text-slate-600">
          Compétences techniques
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {competences.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
            >
              {c}
              <button
                type="button"
                onClick={() => removeCompetence(c)}
                aria-label={`Retirer ${c}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          placeholder="Ajouter une compétence et Entrée"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCompetence();
            }
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-600">Langues</label>
        {langues.map((l, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Français"
              value={l.nom}
              onChange={(e) => updateLangue(i, { nom: e.target.value })}
            />
            <select
              className="rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-600"
              value={l.niveau}
              onChange={(e) => updateLangue(i, { niveau: e.target.value })}
            >
              {NIVEAUX_LANGUE.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChangeLangues([...langues, { nom: "", niveau: "Courant" }])}
          className="text-xs text-blue-700"
        >
          + Ajouter une langue
        </button>
      </div>

      <Field
        id="linkedin"
        label="LinkedIn (optionnel)"
        placeholder="linkedin.com/in/..."
        value={liens.linkedin}
        onChange={(e) => onChangeLiens({ ...liens, linkedin: e.target.value })}
      />
      <Field
        id="github"
        label="Portfolio / GitHub (optionnel)"
        placeholder="github.com/..."
        value={liens.github}
        onChange={(e) => onChangeLiens({ ...liens, github: e.target.value })}
      />
    </div>
  );
}
