export function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export const scoreClasses: Record<
  ReturnType<typeof scoreTone>,
  { bg: string; text: string }
> = {
  success: { bg: "bg-green-100", text: "text-green-700" },
  warning: { bg: "bg-amber-100", text: "text-amber-700" },
  danger: { bg: "bg-red-100", text: "text-red-700" },
};

export function statutLabel(statut: string): string {
  switch (statut) {
    case "ACCEPTE":
      return "Accepté";
    case "REFUSE":
      return "Refusé";
    default:
      return "En attente";
  }
}
