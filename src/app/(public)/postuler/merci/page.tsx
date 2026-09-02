import Link from "next/link";

export default function MerciPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
        ✓
      </div>
      <p className="text-lg font-medium text-slate-900">
        Candidature envoyée
      </p>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Merci, ta candidature a bien été reçue. Nous reviendrons vers toi si
        ton profil correspond au poste.
      </p>
      <Link href="/" className="mt-6 text-sm text-blue-700">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
