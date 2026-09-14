import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidFrame } from './components/common/AndroidFrame';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { HomeTab } from './components/tabs/HomeTab';
import { PlansTab } from './components/tabs/PlansTab';
import { BonusTab } from './components/tabs/BonusTab';
import { ReportTab } from './components/tabs/ReportTab';
import { ShareTab } from './components/tabs/ShareTab';
import { MineTab } from './components/tabs/MineTab';
import { AdminTab } from './components/tabs/AdminTab';
import { LoginPage } from './components/auth/LoginPage';
import { ModalRoot } from './components/modals/ModalRoot';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainScreen: React.FC = () => {
  const { currentTab, isAuthenticated, toast, user } = useApp();

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab />;
      case 'plans':
        return <PlansTab />;
      case 'bonus':
        return <BonusTab />;
      case 'report':
        return user.role === 'admin' ? <ReportTab /> : <HomeTab />;
      case 'share':
        return <ShareTab />;
      case 'mine':
        return <MineTab />;
      case 'admin':
        return user.role === 'admin' ? <AdminTab /> : <HomeTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <AndroidFrame>
      {!isAuthenticated ? (
        /* Login / Auth Screen */
        <LoginPage />
      ) : (
        /* Main Dashboard & Tabs */
        <>
          {/* Top Panel with Three-Line Settings Icon, Language Switcher & Guide */}
          <TopHeader />
          <div className="flex-1 flex flex-col">
            {renderCurrentTab()}
          </div>
          <BottomNav />
        </>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-12 inset-x-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`p-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 backdrop-blur-md'
                : toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/50 backdrop-blur-md'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700/60 backdrop-blur-md'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-emerald-400 flex-shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <ModalRoot />
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
}
