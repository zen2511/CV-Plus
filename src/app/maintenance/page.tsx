import Image from "next/image";

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[380px] w-[380px] rounded-full bg-gold/20 blur-[110px]" />
      </div>
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 text-center">
        <Image
          src="/logo-mbs.png"
          alt="MBS HR Solutions"
          width={100}
          height={100}
        />
        <h1 className="font-display text-2xl font-semibold text-ink">
          Site en maintenance
        </h1>
        <p className="text-slate">
          CV+MBS est momentanément indisponible. Nous serons de retour très
          bientôt.
        </p>
      </div>
    </main>
  );
}