import Field from "@/components/ui/Field";
import { ExperienceData } from "@/types/candidature";

interface Props {
  data: ExperienceData[];
  onChange: (data: ExperienceData[]) => void;
}

const emptyExperience: ExperienceData = {
  poste: "",
  entreprise: "",
  dateDebut: "",
  dateFin: "",
  description: "",
};

export default function StepExperience({ data, onChange }: Props) {
  function update(i: number, patch: Partial<ExperienceData>) {
    onChange(data.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }

  function add() {
    onChange([...data, { ...emptyExperience }]);
  }

  function remove(i: number) {
    onChange(data.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium text-slate-900">
        Expérience professionnelle
      </p>

      {data.map((exp, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-md border border-slate-200 p-3"
        >
          {data.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="self-end text-xs text-red-600"
            >
              Supprimer
            </button>
          )}
          <Field
            id={`poste-${i}`}
            label="Poste occupé"
            value={exp.poste}
            onChange={(e) => update(i, { poste: e.target.value })}
          />
          <Field
            id={`entreprise-${i}`}
            label="Entreprise"
            value={exp.entreprise}
            onChange={(e) => update(i, { entreprise: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`debut-${i}`}
              label="Début"
              placeholder="06/2025"
              value={exp.dateDebut}
              onChange={(e) => update(i, { dateDebut: e.target.value })}
            />
            <Field
              id={`fin-${i}`}
              label="Fin"
              placeholder="En cours"
              value={exp.dateFin}
              onChange={(e) => update(i, { dateFin: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Description
            </label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              rows={3}
              value={exp.description}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-md border border-blue-200 py-2 text-sm text-blue-700"
      >
        + Ajouter une expérience
      </button>
    </div>
  );
}
