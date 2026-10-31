import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Activity,
  AlertTriangle,
  SearchCheck,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
  Lock,
  Eye,
  Globe,
  Mic,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ alertCount = 0 }) => {
  const sections = [
    {
      title: 'Core Platform',
      items: [
        { label: 'Security Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Transaction Guard', path: '/transactions', icon: ReceiptText },
        { label: 'Live Stream Radar', path: '/live-monitoring', icon: Activity },
      ],
    },
    {
      title: 'CyberShield Suite',
      items: [
        { label: 'Scam Detection', path: '/alerts', icon: AlertTriangle, badge: alertCount },
        { label: 'Leak Lock', path: '/leak-lock', icon: Lock },
        { label: 'Permission Lens', path: '/permission-lens', icon: Eye },
        { label: 'Website & URL Risk', path: '/website-risk', icon: Globe },
        { label: 'Voice Scam Defense', path: '/voice-scam', icon: Mic },
        { label: 'Session Monitor', path: '/session-monitoring', icon: Clock },
      ],
    },
    {
      title: 'Operations & ML',
      items: [
        { label: 'Investigations', path: '/investigations', icon: SearchCheck },
        { label: 'AI Model Insights', path: '/model-insights', icon: BrainCircuit },
        { label: 'Dataset Analysis', path: '/dataset-analysis', icon: FileSpreadsheet },
        { label: 'Settings & Policy', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#EAE7DF] border-r border-[#D8D5CD] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="py-5 px-3.5 space-y-5">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="text-[10px] font-bold text-[#4B6072] uppercase tracking-wider px-3 mb-1.5 font-heading">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#214C3A] font-semibold border border-[#D8D5CD] shadow-sm'
                        : 'text-[#4B6072] hover:text-[#26332C] hover:bg-[#E3DFD5]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 shrink-0 text-[#214C3A]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Model Status Card at bottom */}
      <div className="p-3.5 m-3 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#214C3A]" />
          <span className="text-xs font-bold text-[#26332C]">CyberShield Core</span>
        </div>
        <p className="text-[11px] text-[#4B6072] leading-tight mb-2">
          Hybrid Ensemble Active: Isolation Forest & Random Forest with XAI Explainability.
        </p>
        <div className="flex items-center justify-between text-[10px] font-medium text-[#4B6072]">
          <span className="text-[#2E8B57] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
            99.8% Recall
          </span>
          <span className="text-[#4B6072] font-mono">v1.0-prod</span>
        </div>
      </div>
    </aside>
  );
};
