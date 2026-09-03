"use client";

import { useRef, useState } from "react";

interface Props {
  id: string;
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function SearchableMultiSelect({
  id,
  label,
  values,
  options,
  onChange,
  placeholder = "Rechercher une compétence...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const available = options.filter((o) => !values.includes(o));
  const filtered = available.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  function add(option: string) {
    onChange([...values, option]);
    setQuery("");
  }

  function remove(option: string) {
    onChange(values.filter((v) => v !== option));
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpen(true);
  }

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-slate-600">
        {label}
      </label>

      {values.length > 0 && (
        <div className="mb-1 flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label={`Retirer ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        id={id}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />

      {open && (
        <ul className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">
              Aucun résultat
            </li>
          )}
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => add(option)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}