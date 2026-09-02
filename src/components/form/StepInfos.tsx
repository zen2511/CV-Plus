import Field from "@/components/ui/Field";
import { InfosData } from "@/types/candidature";

interface Props {
  data: InfosData;
  onChange: (data: InfosData) => void;
  errors: Partial<Record<keyof InfosData, string>>;
}

export default function StepInfos({ data, onChange, errors }: Props) {
  function set<K extends keyof InfosData>(key: K, value: InfosData[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium text-slate-900">
        Informations personnelles
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Field
            id="nom"
            label="Nom"
            value={data.nom}
            onChange={(e) => set("nom", e.target.value)}
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
          )}
        </div>
        <div>
          <Field
            id="prenom"
            label="Prénom"
            value={data.prenom}
            onChange={(e) => set("prenom", e.target.value)}
          />
          {errors.prenom && (
            <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
          )}
        </div>
      </div>

      <div>
        <Field
          id="titre"
          label="Titre / objectif professionnel"
          placeholder="Développeur logiciel junior"
          value={data.titre}
          onChange={(e) => set("titre", e.target.value)}
        />
      </div>

      <div>
        <Field
          id="email"
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      <Field
        id="telephone"
        label="Téléphone"
        type="tel"
        placeholder="+237 6 XX XX XX XX"
        value={data.telephone}
        onChange={(e) => set("telephone", e.target.value)}
      />

      <Field
        id="ville"
        label="Ville"
        value={data.ville}
        onChange={(e) => set("ville", e.target.value)}
      />
    </div>
  );
}
