"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/form/Stepper";
import StepInfos from "@/components/form/StepInfos";
import StepFormation from "@/components/form/StepFormation";
import StepExperience from "@/components/form/StepExperience";
import StepCompetences from "@/components/form/StepCompetences";
import { CandidatureFormData, emptyCandidature } from "@/types/candidature";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function PostulerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CandidatureFormData>(emptyCandidature);
  const [infosErrors, setInfosErrors] = useState<
    Partial<Record<keyof CandidatureFormData["infos"], string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validateInfos() {
    const errors: typeof infosErrors = {};
    if (!data.infos.nom.trim()) errors.nom = "Le nom est requis.";
    if (!data.infos.prenom.trim()) errors.prenom = "Le prénom est requis.";
    if (!data.infos.email.trim() || !isValidEmail(data.infos.email)) {
      errors.email = "Un email valide est requis.";
    }
    setInfosErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function next() {
    if (step === 1 && !validateInfos()) return;
    setStep((s) => Math.min(4, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!validateInfos()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Échec de la soumission");
      router.push("/postuler/merci");
    } catch {
      setSubmitError(
        "Une erreur est survenue lors de l'envoi. Réessaie dans un instant."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-xs font-medium text-blue-700">
            C+
          </div>
          <span className="text-sm font-medium text-slate-900">CV+</span>
        </div>

        <Stepper current={step} />

        {step === 1 && (
          <StepInfos
            data={data.infos}
            errors={infosErrors}
            onChange={(infos) => setData({ ...data, infos })}
          />
        )}
        {step === 2 && (
          <StepFormation
            data={data.formations}
            onChange={(formations) => setData({ ...data, formations })}
          />
        )}
        {step === 3 && (
          <StepExperience
            data={data.experiences}
            onChange={(experiences) => setData({ ...data, experiences })}
          />
        )}
        {step === 4 && (
          <StepCompetences
            competences={data.competences}
            langues={data.langues}
            liens={data.liens}
            onChangeCompetences={(competences) => setData({ ...data, competences })}
            onChangeLangues={(langues) => setData({ ...data, langues })}
            onChangeLiens={(liens) => setData({ ...data, liens })}
          />
        )}

        {submitError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Précédent
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Soumettre"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
