export interface InfosData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville: string;
  titre: string;
  secteurActivite: string;
  metier: string;
  niveauQualification: string;
  anneesExperience: string;
}

export interface FormationData {
  niveau: string;
  etablissement: string;
  diplome: string;
  anneeDebut: string;
  anneeFin: string;
}

export interface ExperienceData {
  poste: string;
  entreprise: string;
  dateDebut: string;
  dateFin: string;
  posteActuel: boolean;
  description: string;
}

export interface LangueData {
  nom: string;
  niveau: string;
}

export interface CandidatureFormData {
  infos: InfosData;
  formations: FormationData[];
  experiences: ExperienceData[];
  competences: string[];
  langues: LangueData[];
  liens: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
}

export const emptyCandidature: CandidatureFormData = {
  infos: {
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "",
    titre: "",
    secteurActivite: "",
    metier: "",
    niveauQualification: "",
    anneesExperience: "",
  },
  formations: [
    { niveau: "", etablissement: "", diplome: "", anneeDebut: "", anneeFin: "" },
  ],
  experiences: [
    {
      poste: "",
      entreprise: "",
      dateDebut: "",
      dateFin: "",
      posteActuel: false,
      description: "",
    },
  ],
  competences: [],
  langues: [{ nom: "", niveau: "Courant" }],
  liens: { linkedin: "", github: "", portfolio: "" },
};