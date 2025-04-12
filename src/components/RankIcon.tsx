import { useMemo } from "react";

interface RankIconProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Map rank names to their corresponding icon files
const rankIconMap: Record<string, string> = {
  "Baby Pup": "/ranks/baby_pup.png",
  "Puplet": "/ranks/puplet.png",
  "Runt": "/ranks/runt.png",
  "Straight Up Dawg": "/ranks/straight_up_dawg.png",
  "Respectable Wolf": "/ranks/respectable_wolf.png",
  "Beta Wolf": "/ranks/beta_wolf.png",
  "Alpha Wolf": "/ranks/alpha_wolf.png",
  "Sigma Wolf": "/ranks/sigma_wolf.png",
  "Super Mega Deluxe Ultra Sigma Nonchalant Wolf": "/ranks/super_mega_deluxe_ultra_sigma_nonchalant_wolf.png"
};

// Function to normalize rank names for lookup
const normalizeRankName = (rank: string): string => {
  // Remove any numbers or special characters from the rank name
  const normalized = rank.replace(/[0-9]/g, '').trim();
  return normalized;
};

const RankIcon = ({ rank, size = "md", className = "" }: RankIconProps) => {
  // Normalize the rank name and get the correct icon
  const normalizedRank = normalizeRankName(rank);
  const iconSrc = useMemo(() => rankIconMap[normalizedRank] || "/ranks/runt.png", [normalizedRank]);
  
  // Determine icon size class
  const sizeClass = useMemo(() => ({
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  }[size]), [size]);

  return (
    <img 
      src={iconSrc} 
      alt={`${rank} rank icon`} 
      className={`${sizeClass} object-contain ${className}`} 
      onError={(e) => {
        // Fallback if the image doesn't exist
        const target = e.target as HTMLImageElement;
        if (rank.includes("Wolf")) {
          target.src = "/ranks/alpha_wolf.png";
        } else if (rank.includes("Pup")) {
          target.src = "/ranks/baby_pup.png";
        } else {
          target.src = "/ranks/runt.png";
        }
      }}
    />
  );
};

export default RankIcon; 