import { Progress } from "@/components/ui/progress";
import { CustomProgress } from "@/components/ui/custom-progress";
import RankIcon from "@/components/RankIcon";

interface RankBadgeProps {
  rank: string;
  xp: number;
  nextRankXp: number;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showXP?: boolean;
}

// Map rank names to their corresponding icon files
const rankIconMap: Record<string, string> = {
  "Baby Pup": "/ranks/baby_pup.png",
  "Puplet": "/ranks/puplet.png",
  "Runt": "/ranks/runt.png",
  "Runt of the Litter": "/ranks/runt.png",
  "Little Pup": "/ranks/baby_pup.png",
  "Packling": "/ranks/puplet.png", 
  "Howler": "/ranks/straight_up_dawg.png",
  "Straight Up Dawg": "/ranks/straight_up_dawg.png",
  "Respectable Wolf": "/ranks/respectable_wolf.png",
  "Beta Wolf": "/ranks/beta_wolf.png",
  "Alpha Wolf": "/ranks/alpha_wolf.png",
  "Sigma Wolf": "/ranks/sigma_wolf.png", 
  "Sigma Wolf Elite": "/ranks/super_mega_deluxe_ultra_sigma_nonchalant_wolf.png",
  "Super Mega Deluxe Ultra Sigma Nonchalant Wolf": "/ranks/super_mega_deluxe_ultra_sigma_nonchalant_wolf.png"
};

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

const RankBadge = ({ 
  rank, 
  xp, 
  nextRankXp, 
  className = "", 
  iconSize = "sm",
  showXP = true 
}: RankBadgeProps) => {
  const colors = rankColors[rank] || rankColors["Runt of the Litter"];
  const progressPercent = Math.min(Math.floor((xp / nextRankXp) * 100), 100);
  
  // Get the correct icon for the rank or use a fallback
  const iconSrc = rankIconMap[rank] || "/ranks/runt.png";
  
  // Determine icon size class
  const iconSizeClass = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  }[iconSize];

  return (
    <div className={`${className}`}>
      <div className="flex items-center mb-2">
        <RankIcon rank={rank} size={iconSize} className="mr-3" />
        <div className={`px-3 py-1.5 rounded-md ${colors.bg} ${colors.text} text-sm font-medium border ${colors.border}`}>
          {rank}
        </div>
      </div>
      {showXP && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <CustomProgress value={progressPercent} className="h-2 bg-wolf-charcoal" indicatorClassName="bg-wolf-purple" />
          <span className="text-wolf-silver">
            {xp}/{nextRankXp} XP
          </span>
        </div>
      )}
    </div>
  );
};

export default RankBadge;
