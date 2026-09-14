import React from 'react';
import { Coffee } from 'lucide-react';
import coffeeTealImg from '../../assets/images/coffee_teal_bg_1788611096926.jpg';

interface CoffeeBeansBannerProps {
  onBannerClick?: () => void;
}

export const CoffeeBeansBanner: React.FC<CoffeeBeansBannerProps> = ({ onBannerClick }) => {
  return (
    <div
      onClick={onBannerClick}
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl cursor-pointer border border-[#1b4e36] group transition-all duration-300 hover:border-emerald-400/50 bg-[#0e2a1e]"
      style={{
        height: '170px'
      }}
    >
      {/* Background Coffee Image */}
      <img
        src={coffeeTealImg}
        alt="Coffee Extraction Banner"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
      />

      {/* Modern Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(14, 42, 30, 0.45) 0%, rgba(10, 35, 24, 0.85) 100%)'
        }}
      />

      {/* SVG Curve Effect in Emerald Green */}
      <div className="absolute inset-x-0 bottom-0 h-20 opacity-40 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#34d399', stopOpacity: 0.35 }} />
              <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M0 180 Q 100 160 200 170 T 400 120 T 600 130 T 800 40 L 800 200 L 0 200 Z" fill="url(#bannerGrad)" />
          <path d="M0 180 Q 100 160 200 170 T 400 120 T 600 130 T 800 40" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Center Typography */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-400 text-black flex items-center justify-center font-black shadow-lg shadow-emerald-400/30">
            <Coffee size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-['Outfit'] drop-shadow-md">
            COFFEE MINING
          </span>
        </div>

        <p className="text-[11px] tracking-[0.25em] uppercase text-emerald-200/90 font-semibold drop-shadow-xs">
          Daily High-Yield Autonomous Extraction
        </p>
      </div>
    </div>
  );
};
