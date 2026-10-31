import React, { useEffect, useState } from 'react';
import { Search, Eye, ShieldCheck, X } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.transactions.list({
        risk_category: riskFilter !== 'all' ? riskFilter : undefined,
        search: searchTerm || undefined,
        limit: 100,
      });
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [riskFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const getCategoryBadge = (cat?: string) => {
    if (cat === 'High') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]">
          High Risk
        </span>
      );
    }
    if (cat === 'Medium') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]">
          Medium Risk
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]">
        Safe Clearance
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#26332C]">Digital Payment Transaction Guard</h1>
          <p className="text-xs text-[#4B6072] mt-0.5">
            Full repository of scanned UPI transactions with behavioral risk vectors and ensemble classifications
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 text-[#4B6072] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, VPA, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] text-xs text-[#26332C] placeholder-[#4B6072] focus:outline-none focus:border-[#214C3A] w-48 sm:w-60 shadow-xs"
            />
          </form>

          {/* Risk Category Filter */}
          <div className="flex items-center rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] p-1 text-xs shadow-xs">
            {['all', 'High', 'Medium', 'Low'].map((cat) => (
              <button
                key={cat}
                onClick={() => setRiskFilter(cat)}
                className={`px-3 py-1 rounded-lg transition-all font-semibold capitalize cursor-pointer ${
                  riskFilter === cat
                    ? 'bg-[#214C3A] text-white shadow-xs'
                    : 'text-[#4B6072] hover:text-[#26332C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-[#214C3A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck className="w-10 h-10 text-[#4B6072] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#26332C]">No transactions match your criteria</p>
            <p className="text-xs text-[#4B6072] mt-1">Try resetting search filters or start the live simulator.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8D5CD] bg-[#F5F3ED]/60 text-[#4B6072]">
                  <th className="py-3.5 px-4 font-semibold font-heading">Transaction ID</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Sender</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Beneficiary (Payee)</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Amount</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Risk Score</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Category</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Recommended Action</th>
                  <th className="py-3.5 px-4 font-semibold font-heading">Location / Device</th>
                  <th className="py-3.5 px-4 font-semibold font-heading text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D5CD]/60">
                {transactions.map((txn) => {
                  const pred = txn.prediction;
                  const cat = pred?.risk_category || 'Low';
                  const score = pred?.risk_score ?? 0;
                  return (
                    <tr key={txn.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#214C3A]">
                        {txn.transaction_id}
                        {txn.is_collect_request && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4] font-bold">
                            COLLECT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#26332C] font-medium">{txn.sender_id}</td>
                      <td className="py-3 px-4">
                        <span className="text-[#26332C] font-medium">{txn.receiver_id}</span>
                        {txn.is_new_beneficiary && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-[#F0F7F3] text-[#214C3A] font-bold border border-[#B9D6C3]">
                            NEW
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#26332C]">
                        ₹{Number(txn.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            cat === 'High'
                              ? 'bg-[#FBF1F1] text-[#B74A4A]'
                              : cat === 'Medium'
                              ? 'bg-[#FEF7EC] text-[#D4A44B]'
                              : 'bg-[#F0F7F3] text-[#2E8B57]'
                          }`}
                        >
                          {score}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getCategoryBadge(cat)}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[11px] text-[#26332C] uppercase">
                          {pred?.recommended_action || 'ALLOW'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#4B6072]">
                        <div className="font-medium text-[#26332C]">{txn.location}</div>
                        <div className="text-[10px] text-[#4B6072] font-mono">{txn.device_id}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="p-1.5 rounded-lg bg-[#F5F3ED] hover:bg-[#EAE7DF] text-[#214C3A] border border-[#D8D5CD] transition-colors cursor-pointer"
                          title="Inspect AI Evaluation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 enterprise-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CD]">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-[#26332C] font-mono">{selectedTxn.transaction_id}</h3>
                {getCategoryBadge(selectedTxn.prediction?.risk_category)}
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 text-[#4B6072] hover:text-[#26332C] rounded-lg hover:bg-[#F5F3ED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
                <span className="text-[10px] text-[#4B6072] block">Risk Score</span>
                <span className="text-xl font-bold font-mono text-[#26332C]">
                  {selectedTxn.prediction?.risk_score ?? 0}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
                <span className="text-[10px] text-[#4B6072] block">Amount</span>
                <span className="text-xl font-bold font-mono text-[#214C3A]">
                  ₹{Number(selectedTxn.amount).toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
                <span className="text-[10px] text-[#4B6072] block">Action</span>
                <span className="text-xs font-bold text-[#26332C] block mt-1 uppercase">
                  {selectedTxn.prediction?.recommended_action || 'ALLOW'}
                </span>
              </div>
            </div>

            {/* Behavioral Features */}
            <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] space-y-2">
              <h4 className="text-xs font-bold text-[#26332C] uppercase tracking-wider mb-2 font-heading">
                Behavioral & Risk Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#4B6072]">Sender VPA:</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">{selectedTxn.sender_id}</span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Beneficiary VPA:</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">{selectedTxn.receiver_id}</span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Velocity:</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">{selectedTxn.transaction_velocity} txns/hr</span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Frequency (24h):</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">{selectedTxn.transaction_frequency} txns</span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Beneficiary Risk Index:</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">
                    {(selectedTxn.receiver_risk_history * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Account Age:</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">{selectedTxn.account_age} days</span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Location:</span>{' '}
                  <span className="text-[#26332C] font-semibold">{selectedTxn.location}</span>
                </div>
                <div>
                  <span className="text-[#4B6072]">Synthetic IP:</span>{' '}
                  <span className="text-[#26332C] font-mono font-semibold">{selectedTxn.ip_address}</span>
                </div>
              </div>
            </div>

            {/* Explainable AI Reasons */}
            <div className="p-4 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD]">
              <h4 className="text-xs font-bold text-[#26332C] uppercase tracking-wider mb-2 font-heading">
                Explainable AI (WHY Flagged):
              </h4>
              <ul className="space-y-1.5 text-xs text-[#26332C]">
                {(selectedTxn.prediction?.detection_reasons || ['No anomaly detected']).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#214C3A] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
