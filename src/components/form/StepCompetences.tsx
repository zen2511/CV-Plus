import SearchableMultiSelect from "@/components/ui/SearchableMultiSelect";
import Field from "@/components/ui/Field";
import { LangueData } from "@/types/candidature";
import { COMPETENCES } from "@/lib/options";

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
  function updateLangue(i: number, patch: Partial<LangueData>) {
    onChangeLangues(langues.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-slate-900">
        Compétences et liens
      </p>

      <SearchableMultiSelect
        id="competences"
        label="Compétences techniques"
        values={competences}
        options={COMPETENCES}
        onChange={onChangeCompetences}
      />

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