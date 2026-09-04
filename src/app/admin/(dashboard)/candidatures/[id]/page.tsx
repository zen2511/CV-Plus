import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScoreBadge from "@/components/admin/ScoreBadge";
import CandidateActions from "@/components/admin/CandidateActions";

export default async function CandidatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidat = await prisma.candidat.findUnique({
    where: { id },
    include: {
      formations: true,
      experiences: true,
      competences: true,
      langues: true,
      liens: true,
    },
  });

  if (!candidat) notFound();

    const initiales = `${candidat.prenom.charAt(0)}${candidat.nom.charAt(0)}`.toUpperCase();

  return (
    <div className="mx-auto max-w-xl p-6">
      <Link
        href="/admin/candidatures"
        className="mb-5 inline-block text-sm text-slate-500 hover:text-slate-700"
      >
        Retour aux candidatures
      </Link>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
          {initiales}
        </div>
        <div className="flex-1">
          <p className="text-base font-medium text-slate-900">
            {candidat.prenom} {candidat.nom}
          </p>
          <p className="text-xs text-slate-500">
            {[
              candidat.ville,
              "Envoye le " + candidat.dateEnvoi.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
            ]
              .filter(Boolean)
              .join(" - ")}
          </p>
        </div>
        <ScoreBadge score={candidat.score} />
      </div>

      <div className="mb-5 flex flex-col gap-1 text-sm text-slate-600">
        <p>Email : {candidat.email}</p>
        {candidat.telephone && <p>Telephone : {candidat.telephone}</p>}
      </div>

      {candidat.cvKey && (
        <a
          href={"/api/candidatures/" + candidat.id + "/cv"}
          className="mb-5 inline-flex items-center gap-1.5 rounded-md border border-blue-300 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          Telecharger le CV (PDF)
        </a>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {candidat.secteurActivite && (
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
            {candidat.secteurActivite}
          </span>
        )}
        {candidat.metier && (
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
            {candidat.metier}
          </span>
        )}
        {candidat.niveauQualification && (
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
            {candidat.niveauQualification}
          </span>
        )}
        {candidat.anneesExperience && (
          <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
            {candidat.anneesExperience}
          </span>
        )}
      </div>

      {candidat.formations.length > 0 && (
        <Section title="Formation">
          {candidat.formations.map((f) => (
            <div key={f.id} className="mb-2">
              <p className="text-sm text-slate-900">
                {f.niveau} {f.diplome && "- " + f.diplome}
                {f.etablissement && " - " + f.etablissement}
              </p>
              {(f.anneeDebut || f.anneeFin) && (
                <p className="text-xs text-slate-500">
                  {f.anneeDebut ?? ""} - {f.anneeFin ?? ""}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {candidat.experiences.length > 0 && (
        <Section title="Experience">
          {candidat.experiences.map((e) => (
            <div key={e.id} className="mb-2">
              <p className="text-sm text-slate-900">
                {e.poste} - {e.entreprise}
              </p>
              <p className="text-xs text-slate-500">
                {e.dateDebut?.toLocaleDateString("fr-FR", { month: "2-digit", year: "numeric" }) ?? ""}
                {" - "}
                {e.dateFin?.toLocaleDateString("fr-FR", { month: "2-digit", year: "numeric" }) ?? "present"}
              </p>
              {e.description && (
                <p className="mt-1 text-sm text-slate-600">{e.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {candidat.competences.length > 0 && (
        <Section title="Competences">
          <div className="flex flex-wrap gap-2">
            {candidat.competences.map((c) => (
              <span
                key={c.id}
                className="rounded-md bg-blue-100 px-2.5 py-1 text-xs text-blue-700"
              >
                {c.nom}
              </span>
            ))}
          </div>
        </Section>
      )}

      {candidat.langues.length > 0 && (
        <Section title="Langues">
          <p className="text-sm text-slate-600">
            {candidat.langues.map((l) => l.nom + " (" + l.niveau + ")").join(" - ")}
          </p>
        </Section>
      )}

      {candidat.liens.length > 0 && (
        <Section title="Liens">
          <div className="flex flex-col gap-1">
            {candidat.liens.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-700 hover:underline"
              >
                {l.url}
              </a>
            ))}
          </div>
        </Section>
      )}

      <div className="mt-6">
        <CandidateActions
          candidatId={candidat.id}
          prenom={candidat.prenom}
          statut={candidat.statut}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 border-t border-slate-200 pt-4">
      <p className="mb-2 text-sm font-medium text-slate-900">{title}</p>
      {children}
    </div>
  );
}