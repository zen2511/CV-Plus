"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X, Loader2 } from "lucide-react";

interface Props {
  cvKey: string;
  cvName: string;
  onUploaded: (key: string, name: string) => void;
  onRemove: () => void;
}

export default function CvUpload({ cvKey, cvName, onUploaded, onRemove }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier dépasse 5 Mo.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("/api/upload-cv", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Échec de l'envoi.");
      }
      const data = await res.json();
      onUploaded(data.key, data.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  if (cvKey) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gold/40 bg-gold-soft/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink">
          <FileCheck2 size={18} className="text-gold" />
          <span className="truncate">{cvName}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate hover:text-red-600"
          aria-label="Retirer le CV"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver ? "border-gold bg-gold-soft/30" : "border-line hover:border-navy/40"
        }`}
      >
        {uploading ? (
          <Loader2 size={22} className="animate-spin text-navy" />
        ) : (
          <UploadCloud size={22} className="text-slate" />
        )}
        <p className="text-sm text-ink">
          {uploading
            ? "Envoi en cours..."
            : "Glissez votre CV ici, ou cliquez pour choisir un fichier"}
        </p>
        <p className="text-xs text-slate">PDF uniquement, 5 Mo max</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}