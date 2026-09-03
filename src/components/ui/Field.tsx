import { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, id, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-slate">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy focus:ring-1 focus:ring-navy"
        {...props}
      />
    </div>
  );
}