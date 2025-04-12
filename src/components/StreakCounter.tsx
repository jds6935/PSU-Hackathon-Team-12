
import { CalendarCheck } from "lucide-react";

interface StreakCounterProps {
  streak: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  username?: string;
}

const StreakCounter = ({ 
  streak, 
  className = "", 
  showLabel = true, 
  size = "md",
  username 
}: StreakCounterProps) => {
  // Size classes
  const iconContainerClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  const iconClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  const textClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${iconContainerClasses[size]} rounded-full flex items-center justify-center bg-wolf-purple/20 text-wolf-purple`}>
        <CalendarCheck className={iconClasses[size]} />
      </div>
      <div className="ml-3">
        {showLabel && <div className="text-sm text-wolf-silver font-medium">
          {username ? `${username}'s Streak` : "Current Streak"}
        </div>}
        <div className="flex items-baseline">
          <span className={`${textClasses[size]} font-bold text-white`}>{streak}</span>
          <span className="ml-1 text-wolf-silver text-sm">days</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
