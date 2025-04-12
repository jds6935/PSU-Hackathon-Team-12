
import { CalendarCheck } from "lucide-react";

interface StreakCounterProps {
  streak: number;
  className?: string;
}

const StreakCounter = ({ streak, className = "" }: StreakCounterProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-wolf-purple/20 text-wolf-purple">
        <CalendarCheck className="h-6 w-6" />
      </div>
      <div className="ml-3">
        <div className="text-sm text-wolf-silver font-medium">Current Streak</div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-white">{streak}</span>
          <span className="ml-1 text-wolf-silver text-sm">days</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
