import Field from "@/components/ui/Field";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { InfosData } from "@/types/candidature";
import { VILLES } from "@/lib/options";
import { SECTEURS, NIVEAUX_QUALIFICATION, getMetiersDuSecteur } from "@/lib/metiers";

interface Props {
  data: InfosData;
  onChange: (data: InfosData) => void;
  errors: Partial<Record<keyof InfosData, string>>;
}

const NOMS_SECTEURS = SECTEURS.map((s) => s.nom);

export default function StepInfos({ data, onChange, errors }: Props) {
  function set<K extends keyof InfosData>(key: K, value: InfosData[K]) {
    onChange({ ...data, [key]: value });
  }

  function setSecteur(secteur: string) {
    // Changer de secteur invalide le métier précédemment choisi
    onChange({ ...data, secteurActivite: secteur, metier: "" });
  }

  const metiersDisponibles = getMetiersDuSecteur(data.secteurActivite).map(
    (m) => m.nom
  );

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

      <SearchableSelect
        id="ville"
        label="Ville"
        value={data.ville}
        options={VILLES}
        onChange={(v) => set("ville", v)}
        placeholder="Rechercher une ville..."
      />

      <SearchableSelect
        id="secteurActivite"
        label="Secteur d'activité"
        value={data.secteurActivite}
        options={NOMS_SECTEURS}
        onChange={setSecteur}
        placeholder="Rechercher un secteur..."
      />

      <div>
        <SearchableSelect
          id="metier"
          label="Métier"
          value={data.metier}
          options={metiersDisponibles}
          onChange={(v) => set("metier", v)}
          placeholder={
            data.secteurActivite
              ? "Rechercher un métier..."
              : "Choisissez d'abord un secteur"
          }
        />
        {!data.secteurActivite && (
          <p className="mt-1 text-xs text-slate-400">
            Sélectionnez un secteur d&apos;activité pour voir les métiers disponibles.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-600">
          Niveau de qualification
        </label>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          value={data.niveauQualification}
          onChange={(e) => set("niveauQualification", e.target.value)}
        >
          <option value="">-</option>
          {NIVEAUX_QUALIFICATION.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}