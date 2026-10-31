import React, { useState } from 'react';
import { Sliders, User, Server, ShieldCheck, ShieldAlert, Smartphone, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, login } = useAuth();
  const [lowThreshold, setLowThreshold] = useState(29);
  const [medThreshold, setMedThreshold] = useState(69);
  const [switchingUser, setSwitchingUser] = useState(false);

  const handleQuickSwitch = async (email: string, pass: string) => {
    setSwitchingUser(true);
    try {
      await login(email, pass);
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingUser(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#26332C]">Platform Settings & Policy Governance</h1>
        <p className="text-xs text-[#4B6072] mt-0.5">
          Configure risk classification boundaries, manage demo role sessions, and inspect system telemetry
        </p>
      </div>

      {/* Configurable Risk Boundaries */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D8D5CD]">
          <Sliders className="w-4 h-4 text-[#214C3A]" />
          <h3 className="text-sm font-bold text-[#26332C]">Configurable Risk Scoring Thresholds</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-xs text-[#2E8B57] font-bold block mb-1">Low Risk Category (0–{lowThreshold})</span>
            <p className="text-[11px] text-[#4B6072] mb-2 font-medium">Instant Automated Clearance ("ALLOW")</p>
            <input
              type="range"
              min="10"
              max="40"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(parseInt(e.target.value))}
              className="w-full accent-[#214C3A] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-xs text-[#D4A44B] font-bold block mb-1">
              Medium Risk ({lowThreshold + 1}–{medThreshold})
            </span>
            <p className="text-[11px] text-[#4B6072] mb-2 font-medium">Secondary Authentication ("STEP_UP_2FA")</p>
            <input
              type="range"
              min="50"
              max="80"
              value={medThreshold}
              onChange={(e) => setMedThreshold(parseInt(e.target.value))}
              className="w-full accent-[#D4A44B] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-xs text-[#B74A4A] font-bold block mb-1">
              High Risk ({medThreshold + 1}–100)
            </span>
            <p className="text-[11px] text-[#4B6072] mb-2 font-medium">Payment Suspension ("BLOCK_AND_VERIFY")</p>
            <div className="font-mono text-xs text-[#B74A4A] font-bold mt-2">Critical Threat Trigger</div>
          </div>
        </div>
      </div>

      {/* Demo Credentials & Fast Role Switcher */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D8D5CD]">
          <User className="w-4 h-4 text-[#214C3A]" />
          <h3 className="text-sm font-bold text-[#26332C]">Demo Role Authentication & Access Control</h3>
        </div>

        <p className="text-xs text-[#4B6072]">
          Easily test role-based access control with pre-seeded demo accounts:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admin Account */}
          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#26332C]">Chief Risk Officer (Admin)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">ADMIN</span>
              </div>
              <p className="text-xs text-[#4B6072] font-mono font-medium">admin@fraudguard.ai</p>
              <p className="text-[11px] text-[#4B6072] mt-0.5">Password: Admin@123</p>
            </div>
            <button
              onClick={() => handleQuickSwitch('admin@fraudguard.ai', 'Admin@123')}
              disabled={switchingUser || user?.email === 'admin@fraudguard.ai'}
              className="mt-3 w-full py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE7DF] disabled:opacity-50 text-[#214C3A] border border-[#D8D5CD] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {user?.email === 'admin@fraudguard.ai' ? 'Active Session' : 'Switch to Admin'}
            </button>
          </div>

          {/* Analyst Account */}
          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#26332C]">Sarah Jenkins (Fraud Analyst)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">ANALYST</span>
              </div>
              <p className="text-xs text-[#4B6072] font-mono font-medium">analyst@fraudguard.ai</p>
              <p className="text-[11px] text-[#4B6072] mt-0.5">Password: Analyst@123</p>
            </div>
            <button
              onClick={() => handleQuickSwitch('analyst@fraudguard.ai', 'Analyst@123')}
              disabled={switchingUser || user?.email === 'analyst@fraudguard.ai'}
              className="mt-3 w-full py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE7DF] disabled:opacity-50 text-[#214C3A] border border-[#D8D5CD] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {user?.email === 'analyst@fraudguard.ai' ? 'Active Session' : 'Switch to Analyst'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Application & Android Build Downloads */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8D5CD]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#214C3A]" />
            <h3 className="text-sm font-bold text-[#26332C]">Mobile App & Android Builds</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">
            Signed Android APK v1.0
          </span>
        </div>

        <p className="text-xs text-[#3B5369]">
          Download the mobile application directly to your Android smartphone to test real-time fraud alerts, on-device telemetry, and payment verification on the go.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* APK Direct Download Card */}
          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#26332C]">Android APK Package</span>
                <span className="text-[10px] text-[#2E8B57] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Signed & Verified
                </span>
              </div>
              <p className="text-[11px] text-[#3B5369] font-mono">CyberShieldOne.apk (273 KB)</p>
              <p className="text-[11px] text-[#3B5369] mt-1">
                Package: <code className="text-[#214C3A]">ai.fraudguard.cybershield</code> • Min SDK 24 (Android 7.0+)
              </p>
            </div>

            <a
              href={api.download.getApkUrl()}
              download="CyberShieldOne.apk"
              className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#B9D6C3]" />
              <span>Download Android APK</span>
            </a>
          </div>

          {/* Android Source Code Card */}
          <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#26332C]">Android Studio Project</span>
                <span className="text-[10px] text-[#3B5369] font-bold">Gradle 8.2</span>
              </div>
              <p className="text-[11px] text-[#3B5369] font-mono">CyberShieldOne-Android-Source.zip (264 KB)</p>
              <p className="text-[11px] text-[#3B5369] mt-1">
                Includes full Gradle build script, MainActivity, Native WebView bridge, and Proguard rules.
              </p>
            </div>

            <a
              href={api.download.getSourceUrl()}
              download="CyberShieldOne-Android-Source.zip"
              className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE7DF] border border-[#D8D5CD] text-[#214C3A] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-[#214C3A]" />
              <span>Download Source (.zip)</span>
            </a>
          </div>
        </div>

        {/* Mobile Install Note */}
        <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] text-[11px] text-[#3B5369]">
          <strong className="text-[#26332C]">How to install on mobile:</strong> Tap "Download Android APK" on your phone. When Chrome shows "File might be harmful", tap <em>Download anyway</em>. Open the downloaded file, toggle <em>Allow from this source</em> if prompted, and tap <em>Install</em>.
        </div>
      </div>

      {/* System Telemetry & Architecture Diagnostics */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D8D5CD]">
          <Server className="w-4 h-4 text-[#214C3A]" />
          <h3 className="text-sm font-bold text-[#26332C]">System Architecture & Engine Status</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-[10px] text-[#4B6072] block">Backend</span>
            <span className="text-[#26332C] font-mono font-bold">FastAPI v0.139</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-[10px] text-[#4B6072] block">Database</span>
            <span className="text-[#26332C] font-mono font-bold">SQLAlchemy + SQLite/PG</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-[10px] text-[#4B6072] block">ML Engines</span>
            <span className="text-[#26332C] font-mono font-bold">IsolationForest + RF</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
            <span className="text-[10px] text-[#4B6072] block">Streaming</span>
            <span className="text-[#2E8B57] font-mono font-bold">Native WebSockets</span>
          </div>
        </div>
      </div>

      {/* Security & Privacy Compliance Disclaimer */}
      <div className="p-5 rounded-2xl bg-[#F0F7F3] border border-[#B9D6C3] flex items-start gap-3.5 enterprise-shadow">
        <ShieldAlert className="w-5 h-5 text-[#214C3A] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#4B6072] leading-relaxed">
          <span className="font-bold text-[#214C3A]">Security & Privacy Protocol:</span> CyberShield One is an
          intelligent fraud prevention analytics demonstration platform. In strict accordance with Indian financial
          regulations and RBI cybersecurity guidelines, this system never collects, stores, or transmits actual UPI PINs,
          OTP passwords, card CVVs, or secret payment credentials. All analysis utilizes behavioral metadata and anonymized signals.
        </p>
      </div>
    </div>
  );
};
