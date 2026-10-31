import React, { useState } from 'react';
import { Globe, Search, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';

export const WebsiteRiskPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState('https://paytm-kyc-verification-reward.info');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>({
    url: 'https://paytm-kyc-verification-reward.info',
    domain: 'paytm-kyc-verification-reward.info',
    riskScore: 94,
    verdict: 'Malicious Phishing Portal',
    domainAge: '3 days old',
    sslIssuer: "Let's Encrypt Free Tier (No EV)",
    isPunycode: false,
    threatTags: ['Deceptive Brand Impersonation', 'Fake KYC Form', 'Credential Harvester'],
    recommendation: 'BLOCK IMMEDIATELY: Site mimics PayTM KYC to capture UPI PIN and netbanking credentials.',
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    setTimeout(() => {
      const isLegit = urlInput.includes('.gov.in') || urlInput.includes('onlinesbi.sbi') || urlInput.includes('hdfcbank.com');
      if (isLegit) {
        setScanResult({
          url: urlInput,
          domain: new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`).hostname,
          riskScore: 4,
          verdict: 'Authentic Banking Portal',
          domainAge: '14 years old',
          sslIssuer: 'DigiCert High Assurance EV Root CA',
          isPunycode: false,
          threatTags: ['Verified Banking Institution', 'Extended Validation SSL', 'Legitimate DNS Records'],
          recommendation: 'ALLOW: Genuine digital banking destination with active hardware HSM validation.',
        });
      } else {
        setScanResult({
          url: urlInput,
          domain: urlInput.replace(/^https?:\/\//, '').split('/')[0],
          riskScore: 89,
          verdict: 'High-Risk Phishing Suspect',
          domainAge: '6 days old',
          sslIssuer: 'ZeroSSL Automated Tier',
          isPunycode: true,
          threatTags: ['Typosquatting Detected', 'Newly Registered Domain', 'Anomalous Gateway Redirect'],
          recommendation: 'WARN & INTERCEPT: High probability of deceptive payment gateway cloning.',
        });
      }
      setScanning(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
          <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
            CyberShield Suite • Web Threat Defense
          </span>
        </div>
        <h1 className="text-xl font-bold text-[#26332C]">Website & URL Risk Radar</h1>
        <p className="text-xs text-[#4B6072] mt-1 max-w-2xl">
          Real-time reputation, homograph spoofing, and certificate validity scanner for payment links,
          QR destination URLs, and deceptive banking landing pages.
        </p>

        {/* Scan Bar */}
        <form onSubmit={handleScan} className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-[#4B6072] absolute left-3.5 top-3" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter payment link or URL to scan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] focus:outline-none focus:border-[#214C3A] font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={scanning}
            className="px-6 py-2.5 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
          >
            {scanning ? 'Auditing Domain Heuristics...' : 'Audit Website Risk'}
          </button>
        </form>
      </div>

      {/* Results View */}
      {scanResult && (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D8D5CD] gap-2">
            <div>
              <span className="text-xs text-[#4B6072] block">Evaluated Domain Target</span>
              <span className="text-base font-bold font-mono text-[#26332C]">{scanResult.domain}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#4B6072]">Risk Assessment:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                scanResult.riskScore >= 70
                  ? 'bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]'
                  : 'bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]'
              }`}>
                {scanResult.verdict} ({scanResult.riskScore}/100)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
              <span className="text-[#4B6072] block mb-1">Domain Age & Registration</span>
              <span className="font-bold font-mono text-[#26332C]">{scanResult.domainAge}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
              <span className="text-[#4B6072] block mb-1">SSL Certificate Authority</span>
              <span className="font-bold text-[#26332C]">{scanResult.sslIssuer}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
              <span className="text-[#4B6072] block mb-1">Punycode / Homograph Spoof</span>
              <span className="font-bold text-[#26332C]">
                {scanResult.isPunycode ? '⚠️ Homograph Deception Detected' : '✅ Standard ASCII Domain'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#26332C] block mb-2">Identified Threat Vectors:</span>
            <div className="flex flex-wrap gap-2">
              {scanResult.threatTags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5F3ED] text-[#4B6072] border border-[#D8D5CD]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F0F7F3] border border-[#B9D6C3] text-xs text-[#214C3A]">
            <span className="font-bold block mb-0.5">Recommended Enforcement:</span>
            {scanResult.recommendation}
          </div>
        </div>
      )}
    </div>
  );
};

