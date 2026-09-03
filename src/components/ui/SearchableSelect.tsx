"use client";

import { useRef, useState } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function SearchableSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Rechercher...",
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  function select(option: string) {
    onChange(option);
    setQuery("");
    setOpen(false);
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
      <input
        id={id}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        placeholder={placeholder}
        value={open ? query : value}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}

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
                onClick={() => select(option)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                  option === value ? "bg-blue-50 font-medium text-blue-700" : ""
                }`}
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