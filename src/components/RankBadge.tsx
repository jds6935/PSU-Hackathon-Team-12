
import { Progress } from "@/components/ui/progress";
import { CustomProgress } from "@/components/ui/custom-progress";

interface RankBadgeProps {
  rank: string;
  xp: number;
  nextRankXp: number;
  className?: string;
}

const rankColors: Record<string, { bg: string; text: string; border: string }> = {
  "Runt of the Litter": { bg: "bg-zinc-600", text: "text-zinc-200", border: "border-zinc-500" },
  "Little Pup": { bg: "bg-zinc-500", text: "text-zinc-100", border: "border-zinc-400" },
  "Packling": { bg: "bg-blue-600", text: "text-blue-100", border: "border-blue-500" },
  "Howler": { bg: "bg-indigo-600", text: "text-indigo-100", border: "border-indigo-500" },
  "Beta Wolf": { bg: "bg-purple-600", text: "text-purple-100", border: "border-purple-500" },
  "Alpha Wolf": { bg: "bg-wolf-purple", text: "text-wolf-dark", border: "border-wolf-accent" },
  "Sigma Wolf": { bg: "bg-gradient-to-r from-wolf-purple to-wolf-accent", text: "text-wolf-dark", border: "border-wolf-light" },
  "Sigma Wolf Elite": { bg: "bg-gradient-to-r from-wolf-purple via-wolf-accent to-wolf-light", text: "text-wolf-dark", border: "border-wolf-light" },
};

const RankBadge = ({ rank, xp, nextRankXp, className = "" }: RankBadgeProps) => {
  const colors = rankColors[rank] || rankColors["Runt of the Litter"];
  const progressPercent = Math.min(Math.floor((xp / nextRankXp) * 100), 100);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`px-3 py-1.5 rounded-md ${colors.bg} ${colors.text} text-sm font-medium border ${colors.border}`}>
        {rank}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <CustomProgress value={progressPercent} className="h-2 bg-wolf-charcoal" indicatorClassName="bg-wolf-purple" />
        <span className="text-wolf-silver">
          {xp}/{nextRankXp} XP
        </span>
      </div>
    </div>
  );
};

export default RankBadge;
