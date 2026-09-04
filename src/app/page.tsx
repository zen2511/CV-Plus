import Link from "next/link";
import {
  HardHat, Zap, Wrench, Truck, Sprout, UtensilsCrossed, ShoppingBag,
  Briefcase, HeartPulse, GraduationCap, Laptop, ShieldCheck, Pickaxe,
  ArrowRight,
} from "lucide-react";
import { SECTEURS } from "@/lib/metiers";
import Image from "next/image";

const ICONES: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BTP: HardHat,
  ELE: Zap,
  PLB: Wrench,
  TRA: Truck,
  AGR: Sprout,
  HOT: UtensilsCrossed,
  COM: ShoppingBag,
  ADM: Briefcase,
  SAN: HeartPulse,
  EDU: GraduationCap,
  INF: Laptop,
  SEC: ShieldCheck,
  MIN: Pickaxe,
};

export default function Home() {
  const totalMetiers = SECTEURS.reduce((n, s) => n + s.metiers.length, 0);

  return (
    <div className="flex flex-1 flex-col">
            {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[380px] w-[380px] rounded-full bg-gold/20 blur-[110px]" />
          <div className="absolute h-[300px] w-[300px] -translate-y-6 translate-x-32 rounded-full bg-navy/15 blur-[100px]" />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <Image
            src="/logo-mbs.png"
            alt="MBS HR Solutions"
            width={170}
            height={170}
            priority
            className="drop-shadow-[0_10px_40px_rgba(22,48,92,0.25)]"
          />
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Votre profil, entre de bonnes mains.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate">
            De l&apos;atelier au bureau, CV+MBS recueille votre parcours et
            le met directement entre les mains des recruteurs qui
            cherchent votre métier — sans détour.
          </p>
          <Link
            href="/postuler"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3 text-base font-medium text-white transition hover:bg-navy-deep"
          >
            Postuler maintenant
            <ArrowRight size={18} />
          </Link>
          <p className="text-sm text-slate">
            {SECTEURS.length} secteurs · {totalMetiers} métiers référencés
          </p>
        </div>
      </section>

      {/* Secteurs */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Un métier, un secteur, une chance
          </h2>
          <p className="mt-2 max-w-xl text-slate">
            Choisissez votre secteur d&apos;activité au moment de postuler —
            votre candidature part directement au bon endroit.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {SECTEURS.map((secteur) => {
              const Icon = ICONES[secteur.code] ?? Briefcase;
              return (
                <Link
                  key={secteur.code}
                  href="/postuler"
                  className="group flex flex-col gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-gold hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy transition group-hover:bg-gold-soft group-hover:text-gold">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-snug text-ink">
                      {secteur.nom}
                    </p>
                    <p className="mt-0.5 text-xs text-slate">
                      {secteur.metiers.length} métiers
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="border-t border-line px-6 py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Prêt à déposer votre candidature ?
          </h2>
          <p className="max-w-md text-slate">
            Cinq minutes suffisent pour renseigner votre profil et vos
            compétences.
          </p>
          <Link
            href="/postuler"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3 text-base font-medium text-white transition hover:bg-navy-deep"
          >
            Commencer
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}