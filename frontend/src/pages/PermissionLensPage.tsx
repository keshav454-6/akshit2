import React, { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle, AlertTriangle, Smartphone, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';

export const PermissionLensPage: React.FC = () => {
  const [apps, setApps] = useState([
    {
      id: 'app-1',
      name: 'QuickClean Cleaner & Optimizer',
      packageName: 'com.quickclean.deviceopt',
      riskLevel: 'critical',
      overlayDetected: true,
      smsReadAccess: true,
      accessibilityAbuse: true,
      description: 'Requests DRAW_OVER_OTHER_APPS permission over payment apps and reads OTP incoming SMS strings.',
      status: 'Quarantined',
    },
    {
      id: 'app-2',
      name: 'FlashLoan Instant Credit 24/7',
      packageName: 'in.fastcredit.easycash',
      riskLevel: 'high',
      overlayDetected: false,
      smsReadAccess: true,
      accessibilityAbuse: false,
      description: 'Accesses contacts and banking SMS without explicit customer transactional necessity.',
      status: 'Restricted',
    },
    {
      id: 'app-3',
      name: 'HDFC Mobile Banking',
      packageName: 'com.snapwork.hdfc',
      riskLevel: 'safe',
      overlayDetected: false,
      smsReadAccess: false,
      accessibilityAbuse: false,
      description: 'Verified official digital banking portal. Strictly conforms to RBI app sandboxing.',
      status: 'Verified Safe',
    },
    {
      id: 'app-4',
      name: 'GPay (Google Pay)',
      packageName: 'com.google.android.apps.nbu.paisa.user',
      riskLevel: 'safe',
      overlayDetected: false,
      smsReadAccess: false,
      accessibilityAbuse: false,
      description: 'Official NPCI certified UPI client. Zero suspicious overlay triggers detected.',
      status: 'Verified Safe',
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredApps = apps.filter((a) => {
    if (filter === 'risky') return a.riskLevel !== 'safe';
    if (filter === 'safe') return a.riskLevel === 'safe';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
            <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
              CyberShield Suite • Mobile & Endpoint Auditing
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#26332C]">Permission Lens Security Auditor</h1>
          <p className="text-xs text-[#4B6072] mt-1 max-w-2xl">
            Detects rogue overlay permissions, unauthorized SMS OTP reading, and malicious accessibility services
            attempting to hijack digital wallet transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F5F3ED] p-1 rounded-xl border border-[#D8D5CD]">
          {['all', 'risky', 'safe'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                filter === opt
                  ? 'bg-[#214C3A] text-white shadow-sm'
                  : 'text-[#4B6072] hover:text-[#26332C]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className={`p-5 rounded-2xl bg-[#FFFFFF] border transition-all enterprise-shadow ${
              app.riskLevel === 'critical'
                ? 'border-[#F1C8C8]'
                : app.riskLevel === 'high'
                ? 'border-[#F6E1C4]'
                : 'border-[#D8D5CD]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  app.riskLevel === 'safe'
                    ? 'bg-[#F0F7F3] text-[#2E8B57]'
                    : 'bg-[#FBF1F1] text-[#B74A4A]'
                }`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#26332C]">{app.name}</h4>
                  <p className="text-[11px] font-mono text-[#4B6072]">{app.packageName}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                app.riskLevel === 'critical'
                  ? 'bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]'
                  : app.riskLevel === 'high'
                  ? 'bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]'
                  : 'bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]'
              }`}>
                {app.status}
              </span>
            </div>

            <p className="text-xs text-[#4B6072] leading-relaxed mb-4">
              {app.description}
            </p>

            <div className="pt-3 border-t border-[#D8D5CD] grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className={`p-2 rounded-lg ${app.overlayDetected ? 'bg-[#FBF1F1] text-[#B74A4A]' : 'bg-[#F5F3ED] text-[#4B6072]'}`}>
                <span className="block font-semibold">Overlay Screen</span>
                <span>{app.overlayDetected ? '⚠️ Hijack Risk' : 'None'}</span>
              </div>
              <div className={`p-2 rounded-lg ${app.smsReadAccess ? 'bg-[#FEF7EC] text-[#D4A44B]' : 'bg-[#F5F3ED] text-[#4B6072]'}`}>
                <span className="block font-semibold">SMS / OTP Read</span>
                <span>{app.smsReadAccess ? '⚠️ Active Read' : 'Blocked'}</span>
              </div>
              <div className={`p-2 rounded-lg ${app.accessibilityAbuse ? 'bg-[#FBF1F1] text-[#B74A4A]' : 'bg-[#F5F3ED] text-[#4B6072]'}`}>
                <span className="block font-semibold">Accessibility</span>
                <span>{app.accessibilityAbuse ? '⚠️ Abused' : 'Clean'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

