import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  TrendingUp,
  Percent,
  Activity,
  ArrowUpRight,
  Radio,
  Lock,
  Eye,
  Globe,
  Mic,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardAnalytics, Transaction } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  realtimeTransactions: Transaction[];
  onOpenAnalyze: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  realtimeTransactions,
  onOpenAnalyze,
}) => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const data = await api.dashboard.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#214C3A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#4B6072]">Loading CyberShield One Intelligence...</p>
        </div>
      </div>
    );
  }

  const totalAnalyzed = analytics?.total_analyzed || 0;
  const safeTxns = analytics?.safe_transactions || 0;
  const suspiciousTxns = analytics?.suspicious_transactions || 0;
  const highRiskTxns = analytics?.confirmed_fraud_cases || 0;
  const detectionRate = analytics?.fraud_detection_rate || 0.0;
  const avgRisk = analytics?.average_risk_score || 0.0;

  const statCards = [
    {
      title: 'Total Scanned',
      value: totalAnalyzed.toLocaleString(),
      subtext: 'UPI Payments analyzed',
      icon: Activity,
      color: 'text-[#214C3A]',
      bgColor: 'bg-[#F0F7F3]',
      borderColor: 'border-[#B9D6C3]',
    },
    {
      title: 'Safe Clearances',
      value: safeTxns.toLocaleString(),
      subtext: `${totalAnalyzed > 0 ? ((safeTxns / totalAnalyzed) * 100).toFixed(1) : 0}% verified legitimate`,
      icon: ShieldCheck,
      color: 'text-[#2E8B57]',
      bgColor: 'bg-[#F0F7F3]',
      borderColor: 'border-[#B9D6C3]',
    },
    {
      title: 'Elevated Risk (2FA)',
      value: suspiciousTxns.toLocaleString(),
      subtext: 'Step-up biometric verification',
      icon: AlertTriangle,
      color: 'text-[#D4A44B]',
      bgColor: 'bg-[#FEF7EC]',
      borderColor: 'border-[#F6E1C4]',
    },
    {
      title: 'Critical Fraud Blocked',
      value: highRiskTxns.toLocaleString(),
      subtext: 'Immediate payment suspension',
      icon: Flame,
      color: 'text-[#B74A4A]',
      bgColor: 'bg-[#FBF1F1]',
      borderColor: 'border-[#F1C8C8]',
    },
    {
      title: 'Detection Sensitivity',
      value: `${detectionRate}%`,
      subtext: 'Ensemble model recall',
      icon: Percent,
      color: 'text-[#214C3A]',
      bgColor: 'bg-[#F0F7F3]',
      borderColor: 'border-[#B9D6C3]',
    },
    {
      title: 'Mean Risk Index',
      value: `${avgRisk}`,
      subtext: 'Weighted 0 to 100 benchmark',
      icon: TrendingUp,
      color: 'text-[#3B5369]',
      bgColor: 'bg-[#F5F3ED]',
      borderColor: 'border-[#D8D5CD]',
    },
  ];

  const pieColors = ['#2E8B57', '#D4A44B', '#B74A4A'];

  return (
    <div className="space-y-6">
      {/* Executive Overview Banner */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
            <span className="text-xs font-semibold text-[#214C3A] uppercase tracking-wider font-heading">
              CyberShield One • Threat Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#26332C]">
            Enterprise Payment Security & Behavioral Defense
          </h1>
          <p className="text-xs text-[#4B6072] mt-1 max-w-2xl leading-relaxed">
            Multi-layered defense evaluating digital transactions before fund settlement. Integrating
            Isolation Forest, Random Forest classifiers, and heuristic anomaly scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAnalyze}
            className="px-4 py-2.5 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Analyze Payment Threat</span>
            <ArrowUpRight className="w-4 h-4 text-[#B9D6C3]" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow hover:border-[#214C3A]/40 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#4B6072]">{card.title}</span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                <card.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-[#26332C]">{card.value}</div>
            <p className="text-[10px] text-[#4B6072] mt-1 font-medium">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#26332C]">Transaction Risk Activity & Volume</h3>
              <p className="text-xs text-[#4B6072]">Continuous timeline of clear vs. flagged payments</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#2E8B57]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" /> Safe
              </span>
              <span className="flex items-center gap-1.5 text-[#D4A44B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A44B]" /> Suspicious
              </span>
              <span className="flex items-center gap-1.5 text-[#B74A4A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B74A4A]" /> Critical
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trend_data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#4B6072" fontSize={11} tickLine={false} />
                <YAxis stroke="#4B6072" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D8D5CD',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#26332C',
                    boxShadow: '0 4px 16px -2px rgba(33, 76, 58, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="safe_count"
                  stroke="#2E8B57"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2E8B57' }}
                  name="Safe"
                />
                <Line
                  type="monotone"
                  dataKey="suspicious_count"
                  stroke="#D4A44B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#D4A44B' }}
                  name="Suspicious"
                />
                <Line
                  type="monotone"
                  dataKey="fraud_count"
                  stroke="#B74A4A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#B74A4A' }}
                  name="High Risk Fraud"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Distribution (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#26332C]">Risk Classification Ratio</h3>
            <p className="text-xs text-[#4B6072]">Aggregated transaction volume distribution</p>
          </div>

          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.pie_distribution || []}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.pie_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D8D5CD',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#26332C',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#D8D5CD]">
            {(analytics?.pie_distribution || []).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#4B6072]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-mono font-bold text-[#26332C]">{cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Risk Distribution & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Frequency Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#26332C]">Risk Score Frequency</h3>
            <p className="text-xs text-[#4B6072]">Histogram of evaluated risk levels</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.risk_score_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="range" stroke="#4B6072" fontSize={11} tickLine={false} />
                <YAxis stroke="#4B6072" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D8D5CD',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#26332C',
                  }}
                />
                <Bar dataKey="count" fill="#214C3A" radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Transaction Feed (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#214C3A]" />
                <h3 className="text-sm font-bold text-[#26332C]">Real-Time Payment Feed</h3>
              </div>
              <p className="text-xs text-[#4B6072]">Live digital transactions evaluated via WebSocket</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">
              Active Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8D5CD] text-[#4B6072] font-semibold">
                  <th className="pb-2.5">Txn ID</th>
                  <th className="pb-2.5">Sender / Payee</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Risk Score</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D5CD]/60">
                {(realtimeTransactions.length > 0 ? realtimeTransactions.slice(0, 6) : analytics?.live_feed || []).map(
                  (item: any, idx: number) => {
                    const category = item.risk_category || 'Low';
                    return (
                      <tr key={idx} className="hover:bg-[#F5F3ED]/60 transition-colors">
                        <td className="py-2.5 font-mono font-semibold text-[#214C3A]">
                          {item.transaction_id || `TXN-${idx}`}
                        </td>
                        <td className="py-2.5">
                          <div className="text-[#26332C] font-medium">{item.sender_id || 'sender@okaxis'}</div>
                          <div className="text-[10px] text-[#4B6072]">→ {item.receiver_id || 'merchant@paytm'}</div>
                        </td>
                        <td className="py-2.5 font-mono font-bold text-[#26332C]">
                          ₹{Number(item.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              category === 'High'
                                ? 'bg-[#FBF1F1] text-[#B74A4A]'
                                : category === 'Medium'
                                ? 'bg-[#FEF7EC] text-[#D4A44B]'
                                : 'bg-[#F0F7F3] text-[#2E8B57]'
                            }`}
                          >
                            {item.risk_score || 0}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              category === 'High'
                                ? 'bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]'
                                : category === 'Medium'
                                ? 'bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]'
                                : 'bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]'
                            }`}
                          >
                            {category}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-[#4B6072] font-mono text-[11px]">
                          {item.timestamp ? String(item.timestamp).slice(-8) : 'Now'}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
