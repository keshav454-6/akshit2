import React, { useState } from 'react';
import { Activity, Play, Square, Radio, ShieldAlert, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';

interface LiveMonitoringPageProps {
  realtimeTransactions: Transaction[];
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  realtimeTransactions,
  isSimulating,
  setIsSimulating,
}) => {
  const [speed, setSpeed] = useState(2.0);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (isSimulating) {
        await api.simulator.stop();
        setIsSimulating(false);
      } else {
        await api.simulator.start(speed);
        setIsSimulating(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isSimulating) {
      await api.simulator.stop();
      await api.simulator.start(newSpeed);
    }
  };

  const recentTransactions = realtimeTransactions.slice(0, 30);
  const flaggedCount = recentTransactions.filter((t) => (t.prediction?.risk_score ?? 0) >= 30).length;
  const criticalCount = recentTransactions.filter((t) => (t.prediction?.risk_score ?? 0) >= 70).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Radio className="w-4 h-4 text-[#214C3A]" />
            <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
              Real-Time WebSocket Stream
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]">
              DEMO DATA
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#26332C]">Live Transaction Stream Radar</h1>
          <p className="text-xs text-[#4B6072] mt-0.5">
            Continuous synthetic payment feed processed dynamically through active ML anomaly detection
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-[#F5F3ED] border border-[#D8D5CD] p-1 rounded-xl text-xs">
            <span className="text-[#4B6072] px-2 text-[11px] font-semibold">Speed:</span>
            {[0.5, 1.0, 2.0, 4.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer font-bold ${
                  speed === s
                    ? 'bg-[#214C3A] text-white shadow-xs'
                    : 'text-[#4B6072] hover:text-[#26332C]'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>

          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer border ${
              isSimulating
                ? 'bg-[#FBF1F1] text-[#B74A4A] border-[#F1C8C8] hover:bg-[#F8E5E5]'
                : 'bg-[#F0F7F3] text-[#214C3A] border-[#B9D6C3] hover:bg-[#E3EFE8]'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Stream</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Stream Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] block mb-1">Stream Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-[#2E8B57]' : 'bg-[#D8D5CD]'}`} />
            <span className="text-sm font-bold text-[#26332C]">{isSimulating ? 'Active Feed' : 'Idle / Paused'}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] block mb-1">Captured This Session</span>
          <span className="text-xl font-bold font-mono text-[#214C3A]">{recentTransactions.length}</span>
          <span className="text-[10px] text-[#4B6072] block">payments analyzed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] block mb-1">Elevated Risk Flagged</span>
          <span className="text-xl font-bold font-mono text-[#D4A44B]">{flaggedCount}</span>
          <span className="text-[10px] text-[#4B6072] block">Medium / High category</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] block mb-1">Critical Blocked</span>
          <span className="text-xl font-bold font-mono text-[#B74A4A]">{criticalCount}</span>
          <span className="text-[10px] text-[#4B6072] block">Severe attacks halted</span>
        </div>
      </div>

      {/* Streaming Feed Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#26332C]">Incoming Transaction Stream</h3>
        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
            <Activity className="w-8 h-8 text-[#214C3A] mx-auto mb-2" />
            <p className="text-xs text-[#26332C] font-semibold">Waiting for stream data...</p>
            <p className="text-[11px] text-[#4B6072] mt-1">Click "Start Stream" above to generate continuous payments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentTransactions.map((t, idx) => {
              const score = t.prediction?.risk_score ?? 0;
              const cat = t.prediction?.risk_category ?? 'Low';
              const reasons = t.prediction?.detection_reasons ?? [];
              const isHigh = cat === 'High';
              const isMed = cat === 'Medium';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl bg-[#FFFFFF] border transition-all enterprise-shadow ${
                    isHigh
                      ? 'border-[#F1C8C8]'
                      : isMed
                      ? 'border-[#F6E1C4]'
                      : 'border-[#D8D5CD]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#214C3A]">{t.transaction_id}</span>
                      {t.is_collect_request && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4] font-bold">
                          COLLECT
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHigh
                          ? 'bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]'
                          : isMed
                          ? 'bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]'
                          : 'bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]'
                      }`}
                    >
                      {cat} ({score})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <div>
                      <span className="text-[#4B6072] text-[11px]">From:</span>{' '}
                      <span className="text-[#26332C] font-mono font-medium">{t.sender_id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#4B6072] text-[11px]">To:</span>{' '}
                      <span className="text-[#26332C] font-mono font-medium">{t.receiver_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D8D5CD] text-xs">
                    <span className="text-base font-bold font-mono text-[#26332C]">
                      ₹{Number(t.amount).toLocaleString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isHigh ? 'text-[#B74A4A]' : isMed ? 'text-[#D4A44B]' : 'text-[#2E8B57]'
                      }`}
                    >
                      {t.prediction?.recommended_action || 'ALLOW'}
                    </span>
                  </div>

                  {reasons.length > 0 && (
                    <div className="mt-2.5 text-[11px] text-[#4B6072] bg-[#F5F3ED] p-2.5 rounded-xl border border-[#D8D5CD]">
                      <span className="text-[#214C3A] font-bold">Explainability:</span> {reasons[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
