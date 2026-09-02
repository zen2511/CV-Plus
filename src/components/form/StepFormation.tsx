import Field from "@/components/ui/Field";
import { FormationData } from "@/types/candidature";

interface Props {
  data: FormationData[];
  onChange: (data: FormationData[]) => void;
}

const NIVEAUX = ["BTS / DUT", "Licence / Bac+3", "Master / Bac+5", "Doctorat"];

const emptyFormation: FormationData = {
  niveau: NIVEAUX[0],
  etablissement: "",
  diplome: "",
  anneeDebut: "",
  anneeFin: "",
};

export default function StepFormation({ data, onChange }: Props) {
  function update(i: number, patch: Partial<FormationData>) {
    const next = data.map((f, idx) => (idx === i ? { ...f, ...patch } : f));
    onChange(next);
  }

  function add() {
    onChange([...data, { ...emptyFormation }]);
  }

  function remove(i: number) {
    onChange(data.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium text-slate-900">Formation</p>

      {data.map((formation, i) => (
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
          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Niveau d&apos;études
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              value={formation.niveau}
              onChange={(e) => update(i, { niveau: e.target.value })}
            >
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <Field
            id={`etablissement-${i}`}
            label="Établissement"
            value={formation.etablissement}
            onChange={(e) => update(i, { etablissement: e.target.value })}
          />
          <Field
            id={`diplome-${i}`}
            label="Diplôme / Filière"
            value={formation.diplome}
            onChange={(e) => update(i, { diplome: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              id={`annee-debut-${i}`}
              label="Année début"
              value={formation.anneeDebut}
              onChange={(e) => update(i, { anneeDebut: e.target.value })}
            />
            <Field
              id={`annee-fin-${i}`}
              label="Année fin"
              value={formation.anneeFin}
              onChange={(e) => update(i, { anneeFin: e.target.value })}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-md border border-blue-200 py-2 text-sm text-blue-700"
      >
        + Ajouter une formation
      </button>
    </div>
  );
}
