import { User, GraduationCap, Briefcase, Sparkles, Check } from "lucide-react";

const ETAPES = [
  { label: "Infos", icon: User },
  { label: "Formation", icon: GraduationCap },
  { label: "Expérience", icon: Briefcase },
  { label: "Compétences", icon: Sparkles },
];

export default function Stepper({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center">
      {ETAPES.map(({ label, icon: Icon }, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  done
                    ? "bg-gold text-navy-deep"
                    : active
                      ? "bg-navy text-white"
                      : "border border-line text-slate"
                }`}
              >
                {done ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`mt-1.5 text-xs ${
                  active ? "font-medium text-navy" : "text-slate"
                }`}
              >
                {label}
              </span>
            </div>
            {step < ETAPES.length && (
              <div
                className={`mb-5 h-px flex-1 ${
                  done ? "bg-gold" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}