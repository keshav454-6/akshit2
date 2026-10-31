import React, { useState } from 'react';
import { Clock, Smartphone, Laptop, ShieldAlert, CheckCircle, AlertTriangle, LogOut, Radio } from 'lucide-react';

export const SessionMonitoringPage: React.FC = () => {
  const [sessions, setSessions] = useState([
    {
      id: 'SES-901',
      device: 'Apple iPhone 15 Pro',
      type: 'Mobile App (UPI Primary)',
      location: 'Mumbai, Maharashtra, IN',
      ip: '103.45.120.88',
      lastActive: 'Active Just Now',
      isCurrent: true,
      riskLevel: 'safe',
      velocity: '0.8 txns/hr',
    },
    {
      id: 'SES-902',
      device: 'Samsung Galaxy A53 (Virtual Emulator)',
      type: 'Unregistered Android Device',
      location: 'Frankfurt, DE (Tor Exit Node)',
      ip: '185.220.101.5',
      lastActive: '3 minutes ago',
      isCurrent: false,
      riskLevel: 'critical',
      velocity: '9.4 txns/hr',
    },
    {
      id: 'SES-903',
      device: 'MacBook Pro 16" (macOS 15)',
      type: 'Chrome 130 / Netbanking Web',
      location: 'Pune, Maharashtra, IN',
      ip: '49.36.110.22',
      lastActive: '45 minutes ago',
      isCurrent: false,
      riskLevel: 'safe',
      velocity: '0.2 txns/hr',
    },
  ]);

  const terminateSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
            <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
              CyberShield Suite • Access & Identity Telemetry
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#26332C]">Active Session Monitoring</h1>
          <p className="text-xs text-[#4B6072] mt-1 max-w-2xl">
            Track multi-device concurrency, geofence hops, VPN/Tor exit nodes, and terminate unauthorized sessions
            before fraudulent fund transfers execute.
          </p>
        </div>

        <button
          onClick={() => setSessions(sessions.filter((s) => s.isCurrent))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8] hover:bg-[#F8E5E5] text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Terminate All Remote Sessions</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-3">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={`p-5 rounded-2xl bg-[#FFFFFF] border transition-all enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              sess.riskLevel === 'critical'
                ? 'border-[#F1C8C8]'
                : 'border-[#D8D5CD]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                sess.type.includes('Mobile') ? 'bg-[#F0F7F3] text-[#214C3A]' : 'bg-[#F5F3ED] text-[#4B6072]'
              }`}>
                {sess.type.includes('Mobile') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[#26332C]">{sess.device}</span>
                  {sess.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">
                      Current Active Session
                    </span>
                  )}
                  {sess.riskLevel === 'critical' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]">
                      ⚠️ Impossible Travel Anomaly
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#4B6072] flex flex-wrap gap-4 pt-1">
                  <div>
                    Type: <span className="text-[#26332C] font-medium">{sess.type}</span>
                  </div>
                  <div>
                    Location: <span className="text-[#26332C] font-medium">{sess.location}</span>
                  </div>
                  <div>
                    IP: <span className="font-mono text-[#26332C]">{sess.ip}</span>
                  </div>
                  <div>
                    Velocity: <span className="font-mono text-[#26332C] font-semibold">{sess.velocity}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <span className="text-xs text-[#4B6072] font-mono">{sess.lastActive}</span>
              {!sess.isCurrent && (
                <button
                  onClick={() => terminateSession(sess.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8] hover:bg-[#F8E5E5] transition-colors cursor-pointer"
                >
                  Revoke & Kill
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

