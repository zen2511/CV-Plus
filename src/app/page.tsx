import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 py-24 text-center">
        <span className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white dark:bg-white dark:text-black">
          CV+
        </span>

        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Postulez en quelques minutes
        </h1>

        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          CV+ récupère et analyse votre profil pour évaluer votre candidature
          rapidement et simplement. Renseignez vos informations, votre
          formation et votre expérience — on s&apos;occupe du reste.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/postuler"
            className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Postuler maintenant
          </Link>
        </div>
      </main>
    </div>
  );
}