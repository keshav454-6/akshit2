import React, { useState } from 'react';
import { Shield, Play, Square, PlusCircle, UserCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MobileDownloadModal } from '../modals/MobileDownloadModal';

interface NavbarProps {
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onOpenAnalyzeModal: () => void;
  wsConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSimulating,
  setIsSimulating,
  onOpenAnalyzeModal,
  wsConnected,
}) => {
  const { user } = useAuth();
  const [isTogglingSim, setIsTogglingSim] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const handleToggleSimulator = async () => {
    setIsTogglingSim(true);
    try {
      if (isSimulating) {
        await api.simulator.stop();
        setIsSimulating(false);
      } else {
        await api.simulator.start(2.0);
        setIsSimulating(true);
      }
    } catch (e) {
      console.error('Simulator toggle error', e);
    } finally {
      setIsTogglingSim(false);
    }
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#D8D5CD] px-6 flex items-center justify-between sticky top-0 z-40 enterprise-shadow">
      {/* Brand */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#214C3A] flex items-center justify-center text-white shadow-sm">
          <Shield className="w-5 h-5 text-[#B9D6C3]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-base tracking-tight text-[#26332C]">
              CyberShield <span className="text-[#214C3A]">One</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B9D6C3]/40 text-[#214C3A] border border-[#B9D6C3]">
              Enterprise Security
            </span>
          </div>
          <p className="text-[11px] text-[#4B6072] font-medium">Detect Before You Pay. Protect Every Transaction.</p>
        </div>
      </div>

      {/* Center status: Live stream & Simulator */}
      <div className="hidden md:flex items-center gap-3">
        {/* WebSocket Live Status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3ED] border border-[#D8D5CD] text-xs font-medium text-[#3B5369]">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[#2E8B57]' : 'bg-[#B74A4A]'}`} />
          <span className={wsConnected ? 'text-[#214C3A]' : 'text-[#B74A4A]'}>
            {wsConnected ? 'Live Protection Stream' : 'Disconnected'}
          </span>
        </div>

        {/* Live Simulator Button */}
        <button
          onClick={handleToggleSimulator}
          disabled={isTogglingSim}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            isSimulating
              ? 'bg-[#FBF1F1] text-[#B74A4A] border-[#F1C8C8] hover:bg-[#F8E5E5]'
              : 'bg-[#F0F7F3] text-[#214C3A] border-[#B9D6C3] hover:bg-[#E3EFE8]'
          }`}
        >
          {isSimulating ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Halt Simulator</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#B74A4A]/10 text-[#B74A4A] font-bold">DEMO</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Live Simulator</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#214C3A]/10 text-[#214C3A] font-bold">DEMO</span>
            </>
          )}
        </button>
      </div>

      {/* Right Actions: Test Analysis & Mobile App & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Download Button */}
        <button
          onClick={() => setIsMobileModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F3ED] hover:bg-[#EAE7DF] border border-[#D8D5CD] text-[#214C3A] text-xs font-semibold transition-all cursor-pointer shadow-sm"
          title="Download CyberShield One Mobile App (.apk)"
        >
          <Smartphone className="w-4 h-4 text-[#214C3A]" />
          <span className="hidden sm:inline">Mobile App</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#214C3A]/10 text-[#214C3A] font-bold">APK</span>
        </button>

        <button
          onClick={onOpenAnalyzeModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-[#B9D6C3]" />
          <span className="hidden sm:inline">Analyze Payment</span>
          <span className="sm:hidden">Analyze</span>
        </button>

        <div className="h-6 w-[1px] bg-[#D8D5CD]" />

        {/* User profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-semibold text-[#26332C]">{user?.full_name || 'Sarah Jenkins'}</p>
            <p className="text-[10px] text-[#4B6072] capitalize font-medium">{user?.role || 'analyst'} Security Officer</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#EAE7DF] border border-[#D8D5CD] flex items-center justify-center text-[#214C3A]">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mobile Download Modal */}
      <MobileDownloadModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </header>
  );
};
