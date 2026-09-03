import { CandidatureFormData, ExperienceData } from "@/types/candidature";

export type TypeCritere = "MOT_CLE" | "EXPERIENCE_MIN" | "LANGUE";

export interface CritereScoring {
  type: TypeCritere;
  nom: string;
  valeur: string | null;
  poids: number;
  actif: boolean;
}

/**
 * Extrait une année à partir d'un champ de date libre (ex: "06/2025",
 * "2025", "présent", "en cours"). Renvoie null si rien d'exploitable.
 */
function anneeDepuisTexte(valeur: string): number | null {
  if (!valeur) return null;
  if (/présent|en cours|actuel/i.test(valeur)) return new Date().getFullYear();
  const match = valeur.match(/(\d{4})/);
  return match ? Number(match[1]) : null;
}

/**
 * Additionne la durée (en années) de chaque expérience du candidat.
 * Approximatif par nature (les dates sont saisies en texte libre dans le
 * formulaire), mais suffisant pour un seuil "X ans minimum".
 */
export function anneesExperience(experiences: ExperienceData[]): number {
  let total = 0;
  for (const exp of experiences) {
    const debut = anneeDepuisTexte(exp.dateDebut);
    if (debut === null) continue;
    const fin = anneeDepuisTexte(exp.dateFin) ?? new Date().getFullYear();
    total += Math.max(0, fin - debut);
  }
  return total;
}

function critereCorrespond(
  critere: CritereScoring,
  candidature: CandidatureFormData,
  profilTexte: string
): boolean {
  switch (critere.type) {
    case "EXPERIENCE_MIN": {
      const seuil = Number(critere.valeur ?? critere.nom.replace(/\D/g, ""));
      if (!seuil || Number.isNaN(seuil)) return false;
      return anneesExperience(candidature.experiences) >= seuil;
    }
    case "LANGUE": {
      const cible = (critere.valeur ?? critere.nom).trim().toLowerCase();
      if (!cible) return false;
      return candidature.langues.some((l) =>
        l.nom.trim().toLowerCase().includes(cible)
      );
    }
    case "MOT_CLE":
    default: {
      const mots = critere.nom.toLowerCase().split(/\s+/).filter(Boolean);
      return mots.some((mot) => profilTexte.includes(mot));
    }
  }
}

/**
 * Calcule un score 0-100 pour une candidature selon les critères pondérés
 * définis par l'admin (mot-clé libre, expérience minimum en années, ou
 * langue parlée).
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
    ...candidature.formations.flatMap((f) => [f.diplome, f.etablissement, f.niveau]),
    ...candidature.experiences.map((e) => `${e.poste} ${e.description}`),
    ...candidature.competences,
    ...candidature.langues.map((l) => l.nom),
  ]
    .join(" ")
    .toLowerCase();

  let scorePondere = 0;
  for (const critere of actifs) {
    if (critereCorrespond(critere, candidature, profilTexte)) {
      scorePondere += critere.poids;
    }
  }

  return Math.round((scorePondere / poidsTotal) * 100);
}
