import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface AnalyzeTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: (result: any) => void;
}

export const AnalyzeTransactionModal: React.FC<AnalyzeTransactionModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
}) => {
  const [formData, setFormData] = useState({
    transaction_id: `TXN-CLI-${Math.floor(100000 + Math.random() * 900000)}`,
    sender_id: 'vikram.mehta@okaxis',
    receiver_id: 'unknown_payee_claim@paytm',
    amount: 45000,
    transaction_type: 'COLLECT_REQUEST',
    payment_method: 'UPI',
    device_id: 'DEV-IPHONE-15',
    ip_address: '103.45.120.88',
    location: 'Mumbai, IN',
    transaction_frequency: 5,
    account_age: 18,
    previous_behavior: 0.4,
    receiver_risk_history: 0.85,
    is_collect_request: true,
    is_new_beneficiary: true,
    transaction_velocity: 4.2,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'UPI Collect Phishing',
      desc: '₹48,000 fake collect request from newly added unverified VPA',
      data: {
        amount: 48000,
        transaction_type: 'COLLECT_REQUEST',
        receiver_id: 'lucky_draw_reward@paytm',
        is_collect_request: true,
        is_new_beneficiary: true,
        receiver_risk_history: 0.88,
        transaction_velocity: 3.5,
        previous_behavior: 0.3,
      },
    },
    {
      title: 'Velocity Burst Attack',
      desc: '₹75,000 rapid transfers within minutes to new beneficiary',
      data: {
        amount: 75000,
        transaction_type: 'P2P',
        receiver_id: 'quick_swap_crypto@icici',
        is_collect_request: false,
        is_new_beneficiary: true,
        receiver_risk_history: 0.75,
        transaction_velocity: 8.4,
        transaction_frequency: 18,
        previous_behavior: 0.5,
      },
    },
    {
      title: 'Everyday Merchant Grocery',
      desc: '₹85 regular QR merchant payment to verified store',
      data: {
        amount: 85,
        transaction_type: 'P2M',
        receiver_id: 'swastik_provisions@okaxis',
        is_collect_request: false,
        is_new_beneficiary: false,
        receiver_risk_history: 0.02,
        transaction_velocity: 0.8,
        transaction_frequency: 2,
        previous_behavior: 1.1,
      },
    },
  ];

  const applyPreset = (presetData: any) => {
    setFormData((prev) => ({
      ...prev,
      ...presetData,
      transaction_id: `TXN-CLI-${Math.floor(100000 + Math.random() * 900000)}`,
    }));
    setResult(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.transactions.analyze(formData);
      setResult(res);
      if (onAnalysisComplete) onAnalysisComplete(res);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (cat: string) => {
    if (cat === 'High') return 'text-[#B74A4A] bg-[#FBF1F1] border-[#F1C8C8]';
    if (cat === 'Medium') return 'text-[#D4A44B] bg-[#FEF7EC] border-[#F6E1C4]';
    return 'text-[#2E8B57] bg-[#F0F7F3] border-[#B9D6C3]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col enterprise-shadow overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#D8D5CD] flex items-center justify-between bg-[#F5F3ED]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#214C3A] text-[#B9D6C3] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#26332C]">Digital Payment Risk Probe</h2>
              <p className="text-xs text-[#4B6072]">Evaluate transactional threat vectors with calibrated ML Ensemble</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#4B6072] hover:text-[#26332C] hover:bg-[#EAE7DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#FFFFFF]">
          {/* Presets */}
          <div>
            <label className="text-xs font-bold text-[#4B6072] uppercase tracking-wider block mb-2 font-heading">
              Quick Test Vectors
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.data)}
                  className="text-left p-3 rounded-xl bg-[#F5F3ED] hover:bg-[#EAE7DF] border border-[#D8D5CD] transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-[#26332C] group-hover:text-[#214C3A]">{p.title}</p>
                  <p className="text-[11px] text-[#4B6072] mt-0.5 line-clamp-2">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">Sender UPI ID</label>
                <input
                  type="text"
                  value={formData.sender_id}
                  onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] focus:outline-none focus:border-[#214C3A] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">Beneficiary (Payee) UPI ID</label>
                <input
                  type="text"
                  value={formData.receiver_id}
                  onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] focus:outline-none focus:border-[#214C3A] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">Payment Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] focus:outline-none focus:border-[#214C3A] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">Transaction Category</label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] focus:outline-none focus:border-[#214C3A]"
                >
                  <option value="COLLECT_REQUEST">COLLECT_REQUEST (UPI Collect)</option>
                  <option value="P2P">P2P (Peer-to-Peer Transfer)</option>
                  <option value="P2M">P2M (Merchant Payment)</option>
                  <option value="BILL_PAY">BILL_PAY (Utility Bills)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">
                  Beneficiary Historical Risk: {(formData.receiver_risk_history * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.receiver_risk_history}
                  onChange={(e) => setFormData({ ...formData, receiver_risk_history: parseFloat(e.target.value) })}
                  className="w-full accent-[#214C3A] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">
                  Velocity: {formData.transaction_velocity} txns/hr
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={formData.transaction_velocity}
                  onChange={(e) => setFormData({ ...formData, transaction_velocity: parseFloat(e.target.value) })}
                  className="w-full accent-[#214C3A] cursor-pointer"
                />
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-[#26332C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_collect_request}
                  onChange={(e) => setFormData({ ...formData, is_collect_request: e.target.checked })}
                  className="rounded border-[#D8D5CD] text-[#214C3A] focus:ring-[#214C3A]"
                />
                <span>Is UPI Collect Request</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#26332C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_new_beneficiary}
                  onChange={(e) => setFormData({ ...formData, is_new_beneficiary: e.target.checked })}
                  className="rounded border-[#D8D5CD] text-[#214C3A] focus:ring-[#214C3A]"
                />
                <span>Is Unverified New Payee</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white font-semibold text-xs tracking-wide shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Auditing Transaction Telemetry...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#B9D6C3]" />
                  <span>Execute CyberShield AI Assessment</span>
                </>
              )}
            </button>
          </form>

          {/* Results Output */}
          {result && (
            <div className="p-5 rounded-2xl bg-[#F5F3ED] border border-[#D8D5CD] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CD]">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(result.risk_category)}`}>
                    {result.risk_category} Risk
                  </div>
                  <span className="text-2xl font-bold font-mono text-[#26332C]">
                    {result.risk_score} <span className="text-xs text-[#4B6072] font-sans">/ 100</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#4B6072] uppercase tracking-wider block font-bold font-heading">
                    Security Action
                  </span>
                  <span
                    className={`text-xs font-bold uppercase ${
                      result.recommended_action.includes('BLOCK')
                        ? 'text-[#B74A4A]'
                        : result.recommended_action.includes('2FA')
                        ? 'text-[#D4A44B]'
                        : 'text-[#2E8B57]'
                    }`}
                  >
                    {result.recommended_action}
                  </span>
                </div>
              </div>

              {/* Technical ML Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD]">
                  <span className="text-[10px] text-[#4B6072] block">Random Forest Probability</span>
                  <span className="font-mono font-bold text-[#26332C] text-sm">
                    {(result.fraud_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD]">
                  <span className="text-[10px] text-[#4B6072] block">Isolation Forest Anomaly Score</span>
                  <span className="font-mono font-bold text-[#214C3A] text-sm">
                    {(result.anomaly_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Explainable Reasons */}
              <div>
                <h4 className="text-xs font-bold text-[#26332C] uppercase tracking-wider mb-2 font-heading">
                  Explainable AI (WHY It Was Flagged):
                </h4>
                <ul className="space-y-1.5">
                  {result.detection_reasons.map((reason: string, rIdx: number) => (
                    <li key={rIdx} className="flex items-start gap-2 text-xs text-[#26332C]">
                      <span className="text-[#214C3A] mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
