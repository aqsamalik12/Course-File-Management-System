import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: string;
  trendUp?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'indigo'
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50/60',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      text: 'text-indigo-900'
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      text: 'text-emerald-900'
    },
    amber: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500 text-white',
      text: 'text-amber-900'
    },
    purple: {
      bg: 'bg-purple-50/60',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600 text-white',
      text: 'text-purple-900'
    },
    blue: {
      bg: 'bg-blue-50/60',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white',
      text: 'text-blue-900'
    },
    red: {
      bg: 'bg-red-50/60',
      border: 'border-red-100',
      iconBg: 'bg-red-600 text-white',
      text: 'text-red-900'
    }
  };

  const style = colorStyles[color];

  return (
    <div className="p-5 rounded-2xl border border-[#E2EFE6] bg-white shadow-[0_2px_10px_rgba(22,85,52,0.05)] hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-[#567567]">{title}</p>
          <h3 className="text-2xl font-extrabold font-heading text-[#0F2D1F] mt-1">{value}</h3>
        </div>
        <div className="p-2.5 rounded-xl bg-[#E6F4EC] text-[#1E7B4E] shadow-2xs">
          <Icon className="w-5 h-5 text-[#1E7B4E]" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2EFE6] flex items-center justify-between text-xs">
        {subtitle && <span className="text-[#567567] text-3xs">{subtitle}</span>}
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-3xs font-bold px-2 py-0.5 rounded-full ${
              trendUp ? 'bg-[#E6F4EC] text-[#15803D]' : 'bg-red-50 text-red-700'
            }`}
          >
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3 text-[#3BA96F]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-red-600" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};
