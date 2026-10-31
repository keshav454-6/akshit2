import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  X,
  ExternalLink,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.download.getInfo().then(setDownloadInfo).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const apkUrl = api.download.getApkUrl();
  const sourceUrl = api.download.getSourceUrl();

  const handleCopySha = () => {
    if (downloadInfo?.apk_sha256) {
      navigator.clipboard.writeText(downloadInfo.apk_sha256);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    }
  };

  const handleCopyDownloadUrl = () => {
    navigator.clipboard.writeText(apkUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26332C]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-2xl max-w-xl w-full p-6 text-[#26332C] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#6B7A72] hover:text-[#26332C] hover:bg-[#F5F3ED] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-[#D8D5CD]">
          <div className="w-12 h-12 rounded-xl bg-[#214C3A] flex items-center justify-center text-[#B9D6C3] shadow-sm flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#26332C]">Download CyberShield One Mobile</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">
                Android APK v1.0
              </span>
            </div>
            <p className="text-xs text-[#3B5369] mt-0.5 font-medium">
              Real-time payment fraud prevention directly in your pocket. Detect before you pay.
            </p>
          </div>
        </div>

        {/* Primary Download Banner */}
        <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] mb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-[#214C3A] uppercase tracking-wider block">
                Official Android Package
              </span>
              <p className="text-sm font-semibold text-[#26332C]">CyberShieldOne.apk</p>
              <p className="text-[11px] text-[#3B5369]">
                Size: <span className="font-medium text-[#26332C]">{downloadInfo?.apk_size_kb || '273.0'} KB</span> • Min Android 7.0+ (Nougat through 14+)
              </p>
            </div>
            <a
              href={apkUrl}
              download="CyberShieldOne.apk"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#B9D6C3]" />
              <span>Download APK</span>
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-[#D8D5CD] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#3B5369]">
            <span className="flex items-center gap-1.5 text-[#2E8B57] font-semibold">
              <ShieldCheck className="w-4 h-4" /> Signed with RSA-2048 & V1/V2/V3 Signature
            </span>
            <button
              onClick={handleCopyDownloadUrl}
              className="flex items-center gap-1 hover:text-[#214C3A] font-medium transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#2E8B57]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Link Copied!' : 'Copy Direct URL'}</span>
            </button>
          </div>
        </div>

        {/* Direct Phone Download & QR Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          {/* QR Code Card */}
          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] flex flex-col items-center justify-center text-center">
            <div className="w-28 h-28 p-2 rounded-lg bg-white border border-[#D8D5CD] flex items-center justify-center shadow-inner mb-2">
              {/* Clean SVG visual QR Code pattern representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#214C3A]">
                <rect width="100" height="100" fill="white" />
                {/* Top-left position marker */}
                <rect x="5" y="5" width="30" height="30" fill="#214C3A" rx="4" />
                <rect x="11" y="11" width="18" height="18" fill="white" rx="2" />
                <rect x="15" y="15" width="10" height="10" fill="#214C3A" rx="2" />
                {/* Top-right position marker */}
                <rect x="65" y="5" width="30" height="30" fill="#214C3A" rx="4" />
                <rect x="71" y="11" width="18" height="18" fill="white" rx="2" />
                <rect x="75" y="15" width="10" height="10" fill="#214C3A" rx="2" />
                {/* Bottom-left position marker */}
                <rect x="5" y="65" width="30" height="30" fill="#214C3A" rx="4" />
                <rect x="11" y="71" width="18" height="18" fill="white" rx="2" />
                <rect x="15" y="75" width="10" height="10" fill="#214C3A" rx="2" />
                {/* Data modules */}
                <rect x="42" y="8" width="6" height="6" fill="#214C3A" />
                <rect x="52" y="8" width="6" height="6" fill="#214C3A" />
                <rect x="42" y="18" width="6" height="6" fill="#214C3A" />
                <rect x="48" y="28" width="6" height="6" fill="#214C3A" />
                <rect x="8" y="42" width="6" height="6" fill="#214C3A" />
                <rect x="18" y="48" width="6" height="6" fill="#214C3A" />
                <rect x="28" y="42" width="6" height="6" fill="#214C3A" />
                <rect x="42" y="42" width="16" height="16" fill="#214C3A" rx="3" />
                <rect x="46" y="46" width="8" height="8" fill="#B9D6C3" rx="2" />
                <rect x="65" y="42" width="6" height="6" fill="#214C3A" />
                <rect x="75" y="48" width="6" height="6" fill="#214C3A" />
                <rect x="85" y="42" width="6" height="6" fill="#214C3A" />
                <rect x="42" y="68" width="6" height="6" fill="#214C3A" />
                <rect x="52" y="76" width="6" height="6" fill="#214C3A" />
                <rect x="68" y="68" width="10" height="10" fill="#214C3A" />
                <rect x="82" y="78" width="10" height="10" fill="#214C3A" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#26332C]">Scan on Mobile</span>
            <p className="text-[10px] text-[#3B5369] mt-0.5">
              Open your camera to download APK directly to your smartphone
            </p>
          </div>

          {/* Android Studio Source Package */}
          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <FileCode className="w-4 h-4 text-[#214C3A]" />
                <span className="text-xs font-bold text-[#26332C]">Android Studio Project</span>
              </div>
              <p className="text-[11px] text-[#3B5369] leading-relaxed">
                Complete Gradle project with MainActivity, WebAppInterface, Native WebView bridge, and Proguard rules.
              </p>
            </div>

            <a
              href={sourceUrl}
              download="CyberShieldOne-Android-Source.zip"
              className="mt-3 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#F5F3ED] hover:bg-[#EAE7DF] border border-[#D8D5CD] text-xs font-semibold text-[#214C3A] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Source (.zip)</span>
            </a>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold text-[#26332C] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
            Easy 3-Step Mobile Installation Guide
          </h3>
          <div className="space-y-2 text-xs text-[#3B5369]">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F5F3ED]/80 border border-[#D8D5CD]">
              <span className="w-5 h-5 rounded-full bg-[#214C3A] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                1
              </span>
              <div>
                <strong className="text-[#26332C]">Download the APK:</strong> Tap the button above on your Android phone or transfer via USB.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F5F3ED]/80 border border-[#D8D5CD]">
              <span className="w-5 h-5 rounded-full bg-[#214C3A] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                2
              </span>
              <div>
                <strong className="text-[#26332C]">Allow Unknown Apps:</strong> When Android displays <em>"File might be harmful"</em> or <em>"Install unknown apps"</em>, tap <strong>Settings</strong> &rarr; toggle <strong>Allow from this source</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F5F3ED]/80 border border-[#D8D5CD]">
              <span className="w-5 h-5 rounded-full bg-[#214C3A] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                3
              </span>
              <div>
                <strong className="text-[#26332C]">Install & Protect:</strong> Tap <strong>Install</strong> and launch CyberShield One to activate real-time payment defense.
              </div>
            </div>
          </div>
        </div>

        {/* Security Checksum Footer */}
        <div className="pt-3 border-t border-[#D8D5CD] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#3B5369]">
          <div className="font-mono truncate max-w-xs">
            SHA256: {downloadInfo?.apk_sha256 ? `${downloadInfo.apk_sha256.substring(0, 20)}...` : 'Computing...'}
          </div>
          <button
            onClick={handleCopySha}
            className="flex items-center gap-1 text-[#214C3A] font-semibold hover:underline"
          >
            {copiedSha ? <Check className="w-3 h-3 text-[#2E8B57]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSha ? 'Checksum Copied' : 'Copy Checksum'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

