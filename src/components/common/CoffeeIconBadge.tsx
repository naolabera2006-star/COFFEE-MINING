import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Headphones,
  Users,
  Gift,
  Coins,
  History,
  CreditCard,
  PackageCheck,
  Coffee,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';

interface CoffeeIconBadgeProps {
  type: 'recharge' | 'withdraw' | 'checkin' | 'support' | 'team' | 'reward' | 'bonus' | 'deposit_history' | 'withdraw_history' | 'income_history' | 'bank' | 'ordered' | 'coffee' | 'sparkles' | 'award';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CoffeeIconBadge: React.FC<CoffeeIconBadgeProps> = ({ type, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 26,
    xl: 30
  };

  const renderIcon = () => {
    const s = iconSizes[size];
    switch (type) {
      case 'recharge':
        return <ArrowDownLeft size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'withdraw':
        return <ArrowUpRight size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'checkin':
        return <CheckCircle2 size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'support':
        return <Headphones size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'team':
        return <Users size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'reward':
        return <Gift size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'bonus':
        return <Coins size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'deposit_history':
        return <History size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'withdraw_history':
        return <ArrowUpRight size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'income_history':
        return <Zap size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'bank':
        return <CreditCard size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'ordered':
        return <PackageCheck size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'coffee':
        return <Coffee size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'sparkles':
        return <Sparkles size={s} className="text-emerald-400 stroke-[2.5]" />;
      case 'award':
        return <Award size={s} className="text-emerald-400 stroke-[2.5]" />;
      default:
        return <Coffee size={s} className="text-emerald-400" />;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-[#1b4e36] bg-[#103324] transition-all active:scale-95 group-hover:border-emerald-400/70 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.3)] ${sizeClasses[size]} ${className}`}
    >
      {/* Inner highlight ring */}
      <div className="absolute inset-[1.5px] rounded-full border border-white/10 pointer-events-none" />
      {/* Sky icon inside */}
      <div className="relative z-10 flex items-center justify-center">
        {renderIcon()}
      </div>
    </div>
  );
};
