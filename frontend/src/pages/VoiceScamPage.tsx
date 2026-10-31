import React, { useState } from 'react';
import { Mic, PhoneCall, ShieldAlert, CheckCircle, AlertTriangle, Radio, Volume2, PhoneOff } from 'lucide-react';

export const VoiceScamPage: React.FC = () => {
  const [analyzingAudio, setAnalyzingAudio] = useState(false);
  const [vishingEvents, setVishingEvents] = useState([
    {
      id: 'VSH-409',
      callerNumber: '+91 98200-XXXXX (Spoofed Axis Bank IVR)',
      callerName: 'Purported Cyber Crime Cell Officer',
      riskScore: 96,
      aiVoiceCloningProb: 0.94,
      status: 'Blocked Call',
      urgencyKeywords: ['Account Frozen', 'Share 6-digit OTP', 'CBI Investigation Warrant', 'Immediate Arrest'],
      timestamp: 'Today, 14:12',
      details: 'Synthetic text-to-speech formant distortion identified. Voice synthetic harmonics score 94%.',
    },
    {
      id: 'VSH-410',
      callerNumber: '+91 70450-XXXXX (Unknown VoIP)',
      callerName: 'Purported Electricity Department',
      riskScore: 88,
      aiVoiceCloningProb: 0.12,
      status: 'Warning Injected',
      urgencyKeywords: ['Power Cut in 30 Mins', 'Pay Bill via AnyDesk', 'Install QuickSupport'],
      timestamp: 'Yesterday, 19:30',
      details: 'Human voice with high-pressure social engineering tactics and remote desktop screen share solicitation.',
    },
    {
      id: 'VSH-411',
      callerNumber: '+91 22 6160-XXXXX',
      callerName: 'HDFC Official Customer Service',
      riskScore: 5,
      aiVoiceCloningProb: 0.02,
      status: 'Verified Authenticated',
      urgencyKeywords: [],
      timestamp: 'Oct 28, 11:05',
      details: 'Telecom provider verified STIR/SHAKEN digital signature matching licensed HDFC BPO trunk line.',
    },
  ]);

  const simulateLiveAnalysis = () => {
    setAnalyzingAudio(true);
    setTimeout(() => {
      setAnalyzingAudio(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
            <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
              CyberShield Suite • Vishing & Audio Biometrics
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#26332C]">Voice Scam & Deepfake Vishing Defense</h1>
          <p className="text-xs text-[#4B6072] mt-1 max-w-2xl">
            Detects telecom caller-ID spoofing, synthetic AI voice clones, and urgent social engineering scripts
            during live cellular calls before digital transfers are initiated.
          </p>
        </div>

        <button
          onClick={simulateLiveAnalysis}
          disabled={analyzingAudio}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Mic className="w-4 h-4 text-[#B9D6C3]" />
          <span>{analyzingAudio ? 'Calibrating Audio Telemetry...' : 'Test Deepfake Voice Probe'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] font-medium block mb-1">Deepfake Intercept Rate</span>
          <span className="text-2xl font-bold font-mono text-[#2E8B57]">99.1%</span>
          <span className="text-[11px] text-[#4B6072] block mt-1">Spectral acoustic analysis</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] font-medium block mb-1">Spoofed Callers Blocked</span>
          <span className="text-2xl font-bold font-mono text-[#214C3A]">1,840</span>
          <span className="text-[11px] text-[#4B6072] block mt-1">Cross-referenced with TRAI registry</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <span className="text-xs text-[#4B6072] font-medium block mb-1">Vishing Scams Prevented</span>
          <span className="text-2xl font-bold font-mono text-[#26332C]">₹4.2 Cr</span>
          <span className="text-[11px] text-[#4B6072] block mt-1">Protected user capital</span>
        </div>
      </div>

      {/* Vishing Incidents */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D8D5CD] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#26332C]">Audio Interception Log & Forensic Signals</h3>
          <span className="text-xs text-[#4B6072] font-medium">STIR/SHAKEN Signature Verified</span>
        </div>

        <div className="divide-y divide-[#D8D5CD]">
          {vishingEvents.map((evt) => (
            <div key={evt.id} className="p-5 hover:bg-[#F5F3ED]/50 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#214C3A]">{evt.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    evt.riskScore >= 70
                      ? 'bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]'
                      : 'bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]'
                  }`}>
                    {evt.status}
                  </span>
                  <span className="text-xs font-bold text-[#26332C]">{evt.callerName}</span>
                </div>
                <span className="text-[11px] text-[#4B6072] font-mono">{evt.timestamp}</span>
              </div>

              <div className="text-xs text-[#4B6072] flex flex-wrap gap-4">
                <div>
                  Caller ID: <span className="font-mono text-[#26332C] font-semibold">{evt.callerNumber}</span>
                </div>
                <div>
                  Synthetic AI Likelihood:{' '}
                  <span className="font-mono font-bold text-[#214C3A]">
                    {(evt.aiVoiceCloningProb * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {evt.urgencyKeywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#4B6072] font-medium mr-1">Urgency Cues:</span>
                  {evt.urgencyKeywords.map((kw, kIdx) => (
                    <span key={kIdx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-[#4B6072] bg-[#F5F3ED] p-2.5 rounded-xl border border-[#D8D5CD]">
                <span className="font-semibold text-[#26332C]">Acoustic Analysis:</span> {evt.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

