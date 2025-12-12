// Frontend/src/components/sgss/StatCard.tsx
import React from 'react';
import classNames from 'classnames';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'gold';
}

export default function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  onClick, 
  className,
  variant = 'default' 
}: StatCardProps) {
  
  const baseClasses = "sgss-card relative overflow-hidden transition-all duration-300 hover:shadow-lg group flex flex-col justify-between h-full";
  
  const variants = {
    default: "bg-white border-white/50",
    primary: "bg-gradient-to-br from-[var(--sgss-navy)] to-[#000030] text-white border-transparent",
    gold: "bg-gradient-to-br from-[var(--sgss-gold)] to-[#b8952a] text-white border-transparent"
  };

  return (
    <div 
      className={classNames(baseClasses, variants[variant], className, { 'cursor-pointer hover:scale-[1.02]': onClick })} 
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="z-10">
          <p className={classNames("text-xs font-bold uppercase tracking-wider mb-1", variant === 'default' ? "text-gray-500" : "text-white/80")}>
            {label}
          </p>
          <h3 className={classNames("text-3xl font-bold tracking-tight", variant === 'default' ? "text-[var(--sgss-navy)]" : "text-white")}>
            {value}
          </h3>
          
          {trend && (
             <div className="flex items-center gap-1 mt-2 text-xs font-medium">
               <span className={trend.positive ? "text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded" : "text-red-500 bg-red-50 px-1.5 py-0.5 rounded"}>
                 {trend.value}
               </span>
               <span className="text-gray-400">vs last month</span>
             </div>
          )}
        </div>

        {icon && (
          <div className={classNames(
            "p-2 rounded-xl transition-all duration-300", 
            variant === 'default' ? "bg-[var(--sgss-bg)] text-[var(--sgss-navy)] group-hover:bg-[var(--sgss-navy)] group-hover:text-white" : "bg-white/20 text-white"
          )}>
            {icon}
          </div>
        )}
      </div>

      {/* Decorative background shape */}
      {variant !== 'default' && (
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
      )}
    </div>
  );
}
