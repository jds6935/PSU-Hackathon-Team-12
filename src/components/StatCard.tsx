
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, change, className = "" }: StatCardProps) => {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-wolf-silver">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-white">{value}</p>
            {change && (
              <span className={`ml-2 text-xs ${change.positive ? 'text-green-400' : 'text-red-400'}`}>
                {change.positive ? '+' : ''}{change.value}%
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-wolf-purple/10 rounded-lg text-wolf-purple">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
