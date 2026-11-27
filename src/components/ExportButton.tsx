"use client";
import { useState } from "react";

export default function ExportButton() {
  const [open, setOpen] = useState(false);

  const go = (format: "pdf" | "excel") => {
    window.location.href = `/api/admin/export/${format}?v=${Date.now()}`;
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
          <p style={{ fontSize: 12, margin: "0 0 8px" }}>
            Toutes les candidatures, classées par ville (A → Z), puis par nom (A → Z)
          </p>
          <button
            onClick={() => go("pdf")}
            style={{ width: "100%", padding: 8, marginBottom: 6 }}
          >
            PDF
          </button>
          <button onClick={() => go("excel")} style={{ width: "100%", padding: 8 }}>
            Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
