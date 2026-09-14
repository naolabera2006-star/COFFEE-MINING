import React from 'react';
import { useApp } from '../../context/AppContext';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const { isAndroidFrame } = useApp();

  return (
    <div className="min-h-screen bg-[#18110c] text-zinc-100 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 transition-colors duration-300">
      
      {/* Main Device Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isAndroidFrame
            ? 'max-w-[430px] sm:my-auto bg-[#1c140f] rounded-none sm:rounded-[44px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-0 sm:p-[10px] border-0 sm:border-[4px] sm:border-[#38261c] ring-1 ring-[#4d3426]/40'
            : 'max-w-xl mx-auto rounded-2xl shadow-2xl border border-[#38261c] bg-[#1c140f] overflow-hidden'
        }`}
      >
        {/* Device Internal Screen */}
        <div className="relative w-full bg-[#140d09] sm:rounded-[36px] overflow-hidden flex flex-col min-h-[840px] max-h-[92vh] sm:max-h-[860px]">
          
          {/* Android Status Bar */}
          <div className="sticky top-0 z-40 bg-[#140d09]/95 backdrop-blur-md px-5 pt-2.5 pb-1.5 flex items-center justify-center border-b border-[#2b1c14] select-none">
            {/* Camera Punch Hole (Center) */}
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-[#38261c] shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald-950/80 rounded-full" />
            </div>
          </div>

          {/* Main App Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
            {children}
          </main>

          {/* Android Bottom Navigation Pill */}
          <div className="w-full bg-[#140d09] pb-2 pt-1 flex items-center justify-center select-none border-t border-[#2b1c14]">
            <div className="w-32 h-1 bg-emerald-500/30 rounded-full opacity-60 hover:opacity-100 transition-opacity" />
          </div>

        </div>
      </div>
    </div>
  );
};
