import React, { useEffect, useState } from 'react';
import { SearchCheck, X } from 'lucide-react';
import { Investigation } from '../types';
import { api } from '../services/api';

export const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<Investigation | null>(null);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('confirmed_fraud');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await api.investigations.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setInvestigations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSaving(true);
    try {
      await api.investigations.update(selectedCase.id, {
        notes,
        outcome,
        status: 'closed',
      });
      setSelectedCase(null);
      fetchCases();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'closed') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F3ED] text-[#4B6072] border border-[#D8D5CD]">CLOSED</span>;
    }
    if (status === 'in_progress') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]">IN PROGRESS</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">OPEN CASE</span>;
  };

  const getOutcomeBadge = (out?: string) => {
    if (!out) return null;
    if (out === 'confirmed_fraud') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]">CONFIRMED FRAUD</span>;
    }
    if (out === 'false_positive') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]">FALSE POSITIVE</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F3ED] text-[#214C3A] border border-[#D8D5CD]">{out.toUpperCase()}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#26332C]">Fraud Investigation Workbench</h1>
          <p className="text-xs text-[#4B6072] mt-0.5">
            Detailed case management, analyst forensic notes, and formal fraud classifications
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] p-1 text-xs shadow-xs">
          {['all', 'open', 'in_progress', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-all font-semibold capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#214C3A] text-white shadow-xs'
                  : 'text-[#4B6072] hover:text-[#26332C]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Case Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-[#214C3A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : investigations.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <SearchCheck className="w-10 h-10 text-[#4B6072] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#26332C]">No investigation cases open</p>
          <p className="text-xs text-[#4B6072] mt-1">Escalate alerts from Scam Detection to open cases.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investigations.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow hover:border-[#214C3A]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(inv.status)}
                    {getOutcomeBadge(inv.outcome)}
                  </div>
                  <span className="font-mono text-[11px] text-[#4B6072]">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs space-y-1 mb-3">
                  <p className="text-[#26332C]">
                    <span className="text-[#4B6072]">Transaction:</span>{' '}
                    <span className="font-mono text-[#214C3A] font-bold">
                      {inv.transaction_details?.transaction_id || inv.transaction_id}
                    </span>
                  </p>
                  {inv.transaction_details?.amount && (
                    <p className="text-[#26332C]">
                      <span className="text-[#4B6072]">Amount:</span>{' '}
                      <span className="font-mono font-bold text-[#26332C]">
                        ₹{Number(inv.transaction_details.amount).toLocaleString()}
                      </span>
                    </p>
                  )}
                  {inv.analyst_name && (
                    <p className="text-[#4B6072]">
                      Assigned Officer: <span className="text-[#26332C] font-semibold">{inv.analyst_name}</span>
                    </p>
                  )}
                </div>

                {inv.notes && (
                  <div className="p-3 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] mb-3">
                    <span className="text-[10px] text-[#4B6072] uppercase tracking-wider block mb-1 font-bold font-heading">
                      Analyst Notes:
                    </span>
                    {inv.notes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#D8D5CD] flex items-center justify-between">
                <span className="text-[11px] text-[#4B6072] font-mono">Case #{inv.id.slice(0, 8)}</span>
                <button
                  onClick={() => {
                    setSelectedCase(inv);
                    setNotes(inv.notes || '');
                    setOutcome(inv.outcome || 'confirmed_fraud');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F5F3ED] hover:bg-[#EAE7DF] text-[#214C3A] border border-[#D8D5CD] text-xs font-semibold transition-all cursor-pointer"
                >
                  Inspect & Conclude
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Conclusion Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-2xl w-full max-w-xl p-6 space-y-4 enterprise-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CD]">
              <h3 className="text-base font-bold text-[#26332C]">Conclude Fraud Investigation</h3>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 text-[#4B6072] hover:text-[#26332C] rounded-lg hover:bg-[#F5F3ED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">Final Classification Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] focus:outline-none focus:border-[#214C3A]"
                >
                  <option value="confirmed_fraud">Confirmed Fraud (Unauthorized / Social Engineering)</option>
                  <option value="false_positive">False Positive (Cardholder Intent Confirmed)</option>
                  <option value="customer_verified">Customer Verified (Legitimate Transfer)</option>
                  <option value="blocked_user">Blocked User (Beneficiary VPA Blacklisted)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26332C] block mb-1">Detailed Findings & Evidence</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail behavioral anomalies, call verification records, IP geolocations, and bank response..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] placeholder-[#4B6072] focus:outline-none focus:border-[#214C3A]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 rounded-xl bg-[#F5F3ED] text-[#4B6072] text-xs font-semibold hover:bg-[#EAE7DF] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {isSaving ? 'Submitting Report...' : 'Save & Close Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
