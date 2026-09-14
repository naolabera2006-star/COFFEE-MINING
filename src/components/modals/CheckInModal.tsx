import React from 'react';
import { useApp } from '../../context/AppContext';
import { CHECK_IN_REWARDS } from '../../data/initialData';
import { X, Check, Gift, Sparkles, Coffee } from 'lucide-react';

export const CheckInModal: React.FC = () => {
  const { closeModal, user, performDailyCheckIn } = useApp();
  const today = new Date().toDateString();
  const hasCheckedInToday = user.lastCheckInDate === today;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Gift size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                Daily Check-In Bonus
              </h2>
              <span className="text-[11px] text-zinc-400">
                Continuous streak: <strong className="text-emerald-400">{user.checkInStreak} Days</strong>
              </span>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 gap-2">
          {CHECK_IN_REWARDS.map((item) => {
            const isCompleted = user.checkInStreak >= item.day;
            const isCurrent = (user.checkInStreak % 7) + 1 === item.day && !hasCheckedInToday;

            return (
              <div
                key={item.day}
                className={`rounded-2xl p-2.5 text-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-zinc-950 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xs'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <span className="text-[10px] font-bold block">Day {item.day}</span>
                <div className="w-7 h-7 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs my-1 shadow-inner">
                  {isCompleted ? (
                    <Check size={14} className="text-emerald-400 stroke-[3]" />
                  ) : (
                    <span>☕</span>
                  )}
                </div>
                <span className="text-xs font-extrabold text-emerald-400 font-['Outfit'] block">
                  +ETB {item.reward}
                </span>
              </div>
            );
          })}
        </div>

        {/* Submit Check in */}
        <button
          id="btn-confirm-checkin-modal"
          onClick={() => {
            performDailyCheckIn();
            closeModal();
          }}
          disabled={hasCheckedInToday}
          className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            hasCheckedInToday
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black shadow-emerald-500/20'
          }`}
        >
          {hasCheckedInToday ? 'Already Checked-In Today' : 'Claim Today\'s Bonus Now'}
        </button>
      </div>
    </div>
  );
};
