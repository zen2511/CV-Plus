"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCandidatButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette candidature ?")) return;
    setLoading(true);
    try {
      await fetch(`/api/candidatures/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-medium text-red-500 hover:underline disabled:opacity-60"
    >
      supprimer
    </button>
  );
}
