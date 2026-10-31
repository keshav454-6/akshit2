import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle, AlertTriangle, Key, CreditCard, RefreshCw, Smartphone } from 'lucide-react';

export const LeakLockPage: React.FC = () => {
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [leaks, setLeaks] = useState([
    {
      id: 'LK-8891',
      source: 'Dark Web Forum Aggregator',
      type: 'UPI VPA & Partial Phone',
      severity: 'high',
      status: 'contained',
      exposedAsset: 'vikram.mehta***@okaxis',
      timestamp: '2 hours ago',
      actionTaken: 'Auto-Token Invalidation & VPA Risk Score raised to 85%',
    },
    {
      id: 'LK-8892',
      source: 'Third-Party Merchant Database Breach',
      type: 'Credit Card Token & Hash',
      severity: 'critical',
      status: 'locked',
      exposedAsset: 'HDFC Corp Visa ending in 4091',
      timestamp: 'Yesterday, 18:40',
      actionTaken: 'Payment gateway token revoked. Zero-liability flag attached.',
    },
    {
      id: 'LK-8893',
      source: 'Pastebin API Secret Exposure',
      type: 'Internal UPI Gateway Key',
      severity: 'medium',
      status: 'resolved',
      exposedAsset: 'GATEWAY_SECRET_TEST_ENV',
      timestamp: '3 days ago',
      actionTaken: 'Rotated secret keys and regenerated SHA-256 HMAC salts.',
    },
  ]);

  const toggleLockdown = () => {
    setIsLockdownActive(!isLockdownActive);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
            <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
              CyberShield Suite • Data Exposure Guard
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#26332C]">Leak Lock Protection Engine</h1>
          <p className="text-xs text-[#4B6072] mt-1 max-w-2xl">
            Continuously monitors breach dumps, public repositories, and unauthorized data brokers for exposed
            payment VPAs, card hashes, and banking credentials.
          </p>
        </div>

        <button
          onClick={toggleLockdown}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm ${
            isLockdownActive
              ? 'bg-[#B74A4A] text-white hover:bg-[#9B3C3C]'
              : 'bg-[#214C3A] text-white hover:bg-[#2C6A50]'
          }`}
        >
          <Lock className="w-4 h-4 text-[#B9D6C3]" />
          <span>{isLockdownActive ? 'Emergency Lockdown Active' : 'Engage Emergency Leak Lock'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] font-medium block mb-1">Monitored Assets</span>
          <span className="text-2xl font-bold font-mono text-[#26332C]">12,480</span>
          <span className="text-[11px] text-[#2E8B57] font-medium block mt-1">100% active coverage</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] font-medium block mb-1">Exposures Mitigated</span>
          <span className="text-2xl font-bold font-mono text-[#214C3A]">47</span>
          <span className="text-[11px] text-[#4B6072] block mt-1">Tokens revoked automatically</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] font-medium block mb-1">Exposure Mean Time to Contain</span>
          <span className="text-2xl font-bold font-mono text-[#26332C]">1.4s</span>
          <span className="text-[11px] text-[#4B6072] block mt-1">Automated API webhooks</span>
        </div>
      </div>

      {/* Leak Incidents List */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D8D5CD] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#26332C]">Recent Exposure Events & Interceptions</h3>
          <span className="text-xs text-[#4B6072] font-medium">Auto-synced with Threat Intelligence Feed</span>
        </div>

        <div className="divide-y divide-[#D8D5CD]">
          {leaks.map((item) => (
            <div key={item.id} className="p-5 hover:bg-[#F5F3ED]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#214C3A]">{item.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.severity === 'critical'
                      ? 'bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]'
                      : 'bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]'
                  }`}>
                    {item.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-[#26332C]">{item.type}</span>
                </div>
                <p className="text-xs text-[#4B6072]">
                  Exposed Vector: <span className="font-mono text-[#26332C] font-semibold">{item.exposedAsset}</span> via {item.source}
                </p>
                <p className="text-[11px] text-[#2E8B57] font-medium">
                  Resolution: {item.actionTaken}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-[#4B6072] block">{item.timestamp}</span>
                <span className="inline-block mt-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">
                  Shield Contained
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

