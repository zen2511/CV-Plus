import { CandidatureFormData } from "@/types/candidature";

export interface CritereScoring {
  nom: string;
  poids: number;
  actif: boolean;
}

/**
 * Calcule un score 0-100 pour une candidature en comparant le texte du
 * profil (diplômes, compétences, expériences, ville, secteur, métier,
 * niveau, années d'expérience) au nom de chaque critère défini par
 * l'admin. Un critère "matche" si son nom (ou un mot qui le compose)
 * apparaît dans le profil du candidat.
 */
export function calculerScore(
  candidature: CandidatureFormData,
  criteres: CritereScoring[]
): number {
  const actifs = criteres.filter((c) => c.actif);
  if (actifs.length === 0) return 0;

  const poidsTotal = actifs.reduce((sum, c) => sum + c.poids, 0);
  if (poidsTotal === 0) return 0;

  const profilTexte = [
    candidature.infos.titre,
    candidature.infos.ville,
    candidature.infos.secteurActivite,
    candidature.infos.metier,
    candidature.infos.niveauQualification,
    candidature.infos.anneesExperience,
    ...candidature.formations.flatMap((f) => [f.diplome, f.etablissement, f.niveau]),
    ...candidature.experiences.map((e) => `${e.poste} ${e.description}`),
    ...candidature.competences,
  ]
    .join(" ")
    .toLowerCase();

  let scorePondere = 0;
  for (const critere of actifs) {
    const mots = critere.nom.toLowerCase().split(/\s+/).filter(Boolean);
    const matche = mots.some((mot) => profilTexte.includes(mot));
    if (matche) scorePondere += critere.poids;
  }

  return Math.round((scorePondere / poidsTotal) * 100);
}