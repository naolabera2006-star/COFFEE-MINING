import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, PackageCheck, Zap, TrendingUp, Sparkles, Clock, Coffee } from 'lucide-react';

export const OrderedModal: React.FC = () => {
  const { closeModal, activeOrders, harvestYield, harvestAllYields, setCurrentTab } = useApp();

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
              <PackageCheck size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                My Ordered Miners
              </h2>
              <span className="text-[11px] text-zinc-400">
                {activeOrders.length} active equipment running
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

        {/* Action button: Harvest All */}
        {activeOrders.length > 0 && (
          <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
            <div>
              <span className="text-xs font-bold text-white">Automated Continuous Extraction</span>
              <p className="text-[11px] text-zinc-400">Collect accumulated coffee dividends anytime</p>
            </div>

            <button
              id="btn-harvest-all-modal"
              onClick={harvestAllYields}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Collect All
            </button>
          </div>
        )}

        {/* Orders List */}
        {activeOrders.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Coffee size={28} />
            </div>
            <div>
              <p className="font-bold text-white text-sm font-['Outfit']">No Active Coffee Miners Yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Invest in a Mining plan to start receiving automated daily dividends into your balance.
              </p>
            </div>
            <button
              onClick={() => {
                closeModal();
                setCurrentTab('plans');
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Explore Mining Plans
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="bg-zinc-950 rounded-2xl p-3.5 border border-zinc-800 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={order.image}
                      alt={order.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-700 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-black text-white font-['Outfit'] truncate">
                          {order.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          RUNNING
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400 mt-1">
                        <span>Daily: <strong className="text-emerald-400">ETB {(order.dailyIncome || 0).toFixed(2)}</strong></span>
                        <span>Invested: ETB {(order.price || 0).toFixed(2)}</span>
                        <span>Purchased: {order.purchaseDate}</span>
                        <span>Cycle: {order.cycleDays || 90} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Harvest Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                    <div className="text-xs">
                      <span className="text-[11px] text-zinc-400">Earned: </span>
                      <strong className="text-emerald-400 font-['Outfit'] font-bold">
                        ETB {(order.totalEarnedSoFar || 0).toFixed(2)}
                      </strong>
                    </div>

                    <button
                      onClick={() => harvestYield(order.id)}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Zap size={12} />
                      <span>Harvest Yield</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
