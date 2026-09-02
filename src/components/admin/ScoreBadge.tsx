import { scoreTone, scoreClasses } from "@/lib/ui";

export default function ScoreBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  const { bg, text } = scoreClasses[tone];
  return (
    <span className={`rounded-md ${bg} ${text} px-2 py-0.5 text-xs font-medium`}>
      {score}
    </span>
  );
}
