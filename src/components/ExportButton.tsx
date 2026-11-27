"use client";
import { useState } from "react";

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const [ville, setVille] = useState("");

  const go = (format: "excel" | "pdf") => {
    const q = new URLSearchParams({ tri: "nom", ordre: "asc" });
    if (ville.trim()) q.set("ville", ville.trim());
    window.location.href = `/api/admin/export/${format}?${q}`;
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "#1d4ed8", color: "#fff", padding: "8px 14px",
                 borderRadius: 8, border: 0 }}
      >
        Exporter
      </button>
      {open && (
        <div
          style={{ position: "absolute", right: 0, top: 44, zIndex: 50,
            background: "#fff", color: "#111", border: "1px solid #ddd",
            borderRadius: 10, padding: 12, width: 240,
            boxShadow: "0 4px 16px rgba(0,0,0,.15)" }}
        >
          <input
            placeholder="Ville (vide = toutes)"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc",
                     borderRadius: 6, marginBottom: 8 }}
          />
          <p style={{ fontSize: 12, margin: "0 0 8px" }}>Ordre : A → Z (nom)</p>
          <button onClick={() => go("excel")}
            style={{ width: "100%", padding: 8, marginBottom: 6 }}>
            Excel (.xlsx)
          </button>
          <button onClick={() => go("pdf")} style={{ width: "100%", padding: 8 }}>
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
