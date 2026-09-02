const ETAPES = ["Infos", "Formation", "Expérience", "Compétences"];

export default function Stepper({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center">
      {ETAPES.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  done
                    ? "bg-green-100 text-green-700"
                    : active
                      ? "bg-blue-700 text-white"
                      : "border border-slate-300 text-slate-400"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <span
                className={`mt-1 text-xs ${
                  active ? "text-blue-700" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
            {step < ETAPES.length && (
              <div className="mb-4 h-px flex-1 bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
