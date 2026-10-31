import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertTriangle, ShieldCheck, FileDown } from 'lucide-react';
import { api } from '../services/api';

export const DatasetAnalysisPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.transactions.bulkUpload(file);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to process dataset. Ensure it is a valid CSV.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const headers = [
      'transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp',
      'transaction_type', 'payment_method', 'device_id', 'ip_address', 'location',
      'transaction_frequency', 'account_age', 'previous_behavior', 'receiver_risk_history',
      'is_collect_request', 'is_new_beneficiary', 'transaction_velocity'
    ].join(',');

    const rows = [
      'TXN-SAMPLE-101,rahul@okaxis,store@paytm,120.00,2026-10-30T10:15:00Z,P2M,QR_CODE,DEV-S24,192.168.1.10,Mumbai,2,120,1.0,0.02,false,false,0.5',
      'TXN-SAMPLE-102,priya@okhdfc,unknown_lottery@icici,65000.00,2026-10-30T02:30:00Z,COLLECT_REQUEST,UPI,DEV-REDMI,103.45.67.89,Delhi,8,15,0.3,0.89,true,true,5.2',
      'TXN-SAMPLE-103,amit@oksbi,crypto_agent@ybl,85000.00,2026-10-30T03:45:00Z,P2P,UPI,DEV-IPHONE,103.12.44.11,Bengaluru,14,35,0.4,0.92,false,true,9.5',
      'TXN-SAMPLE-104,sneha@okicici,mother_dairy@upi,45.00,2026-10-30T08:00:00Z,P2M,UPI,DEV-PIXEL,192.168.1.15,Pune,1,300,1.2,0.01,false,false,0.2',
      'TXN-SAMPLE-105,vikas@okaxis,cashback_reward@airtel,32000.00,2026-10-30T14:20:00Z,COLLECT_REQUEST,UPI,DEV-MOTO,103.88.99.12,Hyderabad,4,45,0.5,0.76,true,true,3.1',
    ].join('\n');

    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_cybershield_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#26332C]">Batch CSV Dataset Audit</h1>
          <p className="text-xs text-[#4B6072] mt-0.5">
            Upload enterprise transaction archives or synthetic datasets for automated ML risk scoring
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F3ED] text-[#214C3A] text-xs font-semibold border border-[#D8D5CD] transition-colors cursor-pointer enterprise-shadow"
        >
          <FileDown className="w-4 h-4 text-[#214C3A]" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="p-8 rounded-2xl bg-[#FFFFFF] border-2 border-dashed border-[#B9D6C3] hover:border-[#214C3A] transition-colors text-center enterprise-shadow">
        <UploadCloud className="w-12 h-12 text-[#214C3A] mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#26332C]">Upload Transaction Archive (CSV)</h3>
        <p className="text-xs text-[#4B6072] mt-1 max-w-md mx-auto">
          Expected features: amount, sender_id, receiver_id, transaction_type, is_collect_request, velocity, etc.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <label className="px-4 py-2 rounded-xl bg-[#F5F3ED] hover:bg-[#EAE7DF] text-[#26332C] text-xs font-semibold cursor-pointer border border-[#D8D5CD]">
            <span>{file ? file.name : 'Choose CSV File'}</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-6 py-2 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {loading ? 'Executing Ensemble Predictions...' : 'Process Dataset'}
          </button>
        </div>

        {error && <p className="text-xs text-[#B74A4A] mt-3 font-medium">{error}</p>}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
              <span className="text-xs text-[#4B6072] block mb-1">Total Processed</span>
              <span className="text-2xl font-bold font-mono text-[#26332C]">{result.total_processed}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#B9D6C3] enterprise-shadow">
              <span className="text-xs text-[#2E8B57] font-semibold block mb-1">Safe Transactions</span>
              <span className="text-2xl font-bold font-mono text-[#2E8B57]">{result.safe_count}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#F6E1C4] enterprise-shadow">
              <span className="text-xs text-[#D4A44B] font-semibold block mb-1">Suspicious (Medium)</span>
              <span className="text-2xl font-bold font-mono text-[#D4A44B]">{result.suspicious_count}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#F1C8C8] enterprise-shadow">
              <span className="text-xs text-[#B74A4A] font-semibold block mb-1">Critical (Blocked)</span>
              <span className="text-2xl font-bold font-mono text-[#B74A4A]">{result.high_risk_count}</span>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8D5CD] bg-[#F5F3ED]/60 text-[#4B6072]">
                    <th className="py-3.5 px-4 font-semibold font-heading">Transaction ID</th>
                    <th className="py-3.5 px-4 font-semibold font-heading">Amount</th>
                    <th className="py-3.5 px-4 font-semibold font-heading">Risk Score</th>
                    <th className="py-3.5 px-4 font-semibold font-heading">Category</th>
                    <th className="py-3.5 px-4 font-semibold font-heading">Flagged</th>
                    <th className="py-3.5 px-4 font-semibold font-heading">Top Explainability Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D5CD]/60">
                  {result.results.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-[#F5F3ED]/40">
                      <td className="py-2.5 px-4 font-mono text-[#214C3A] font-bold">{row.transaction_id}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#26332C]">
                        ₹{Number(row.amount).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold">{row.risk_score}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.risk_category === 'High'
                              ? 'bg-[#FBF1F1] text-[#B74A4A]'
                              : row.risk_category === 'Medium'
                              ? 'bg-[#FEF7EC] text-[#D4A44B]'
                              : 'bg-[#F0F7F3] text-[#2E8B57]'
                          }`}
                        >
                          {row.risk_category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold">
                        {row.is_flagged ? '⚠️ Flagged' : '✅ Clear'}
                      </td>
                      <td className="py-2.5 px-4 text-[#4B6072]">
                        {row.reasons && row.reasons.length > 0 ? row.reasons[0] : 'Normal baseline'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
