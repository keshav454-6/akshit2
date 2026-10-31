import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Flame, X } from 'lucide-react';
import { Alert } from '../types';
import { api } from '../services/api';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.alerts.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.alerts.update(alertId, {
        status: newStatus,
        resolution_notes: resolutionNotes || undefined,
      });
      setActiveAlert(null);
      setResolutionNotes('');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'critical') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8] flex items-center gap-1">
          <Flame className="w-3 h-3" /> CRITICAL
        </span>
      );
    }
    if (p === 'high') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]">
          HIGH
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F7F3] text-[#214C3A] border border-[#B9D6C3]">
        MEDIUM
      </span>
    );
  };

  const getStatusBadge = (s: string) => {
    if (s === 'resolved') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F7F3] text-[#2E8B57] border border-[#B9D6C3]">RESOLVED</span>;
    }
    if (s === 'escalated') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F3ED] text-[#214C3A] border border-[#D8D5CD]">ESCALATED</span>;
    }
    if (s === 'under_review') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EC] text-[#D4A44B] border border-[#F6E1C4]">IN REVIEW</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF1F1] text-[#B74A4A] border border-[#F1C8C8]">NEW</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#26332C]">Scam Detection & Alert Operations</h1>
          <p className="text-xs text-[#4B6072] mt-0.5">
            Triage, investigate, review, and escalate suspicious transactions flagged by automated security rules
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] p-1 shadow-xs">
            {['all', 'new', 'under_review', 'escalated', 'resolved'].map((st) => (
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

          {/* Priority Filter */}
          <div className="flex items-center rounded-xl bg-[#FFFFFF] border border-[#D8D5CD] p-1 shadow-xs">
            {['all', 'critical', 'high', 'medium'].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-3 py-1 rounded-lg transition-all font-semibold capitalize cursor-pointer ${
                  priorityFilter === pr
                    ? 'bg-[#214C3A] text-white shadow-xs'
                    : 'text-[#4B6072] hover:text-[#26332C]'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-3 border-[#214C3A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#FFFFFF] border border-[#D8D5CD] enterprise-shadow">
          <ShieldCheck className="w-10 h-10 text-[#2E8B57] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#26332C]">No active alerts found</p>
          <p className="text-xs text-[#4B6072] mt-1">All flagged events have been reviewed or resolved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl bg-[#FFFFFF] border transition-all enterprise-shadow ${
                alert.priority === 'critical'
                  ? 'border-[#F1C8C8]'
                  : 'border-[#D8D5CD]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {getPriorityBadge(alert.priority)}
                  {getStatusBadge(alert.status)}
                  <span className="font-mono text-xs font-bold text-[#214C3A]">
                    {alert.transaction_details?.transaction_id || alert.transaction_id}
                  </span>
                  {alert.transaction_details?.amount && (
                    <span className="font-mono text-xs font-bold text-[#26332C]">
                      ₹{Number(alert.transaction_details.amount).toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#4B6072] font-mono">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>

              {/* Alert Reason */}
              <p className="text-xs text-[#26332C] font-semibold my-2">{alert.reason}</p>

              {/* Triggered Rules Tags */}
              {alert.triggered_rules && alert.triggered_rules.length > 0 && (
                <div className="flex flex-wrap gap-1.5 my-2">
                  {alert.triggered_rules.map((rule, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F5F3ED] text-[#4B6072] border border-[#D8D5CD]"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              )}

              {/* Transaction Participant summary */}
              {alert.transaction_details && (
                <div className="flex items-center gap-4 text-[11px] text-[#4B6072] pt-2 border-t border-[#D8D5CD]">
                  <div>
                    Sender: <span className="text-[#26332C] font-mono font-medium">{alert.transaction_details.sender_id}</span>
                  </div>
                  <div>
                    Beneficiary: <span className="text-[#26332C] font-mono font-medium">{alert.transaction_details.receiver_id}</span>
                  </div>
                  {alert.transaction_details.location && (
                    <div>
                      Location: <span className="text-[#26332C]">{alert.transaction_details.location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#D8D5CD]">
                <button
                  onClick={() => {
                    setActiveAlert(alert);
                    setResolutionNotes(alert.resolution_notes || '');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F5F3ED] hover:bg-[#EAE7DF] text-[#214C3A] text-xs font-semibold border border-[#D8D5CD] transition-colors cursor-pointer"
                >
                  Manage Alert Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Action Modal */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#D8D5CD] rounded-2xl w-full max-w-lg p-6 space-y-4 enterprise-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D5CD]">
              <h3 className="text-base font-bold text-[#26332C]">Manage Alert Action</h3>
              <button
                onClick={() => setActiveAlert(null)}
                className="p-1 text-[#4B6072] hover:text-[#26332C] rounded-lg hover:bg-[#F5F3ED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#4B6072] mb-1">Triggered Reason:</p>
              <p className="text-xs text-[#26332C] bg-[#F5F3ED] p-2.5 rounded-xl border border-[#D8D5CD] font-medium">
                {activeAlert.reason}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#26332C] block mb-1">Analyst Notes & Mitigation</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter investigation notes, user verification outcome, or mitigation steps..."
                className="w-full px-3 py-2 rounded-xl bg-[#F5F3ED] border border-[#D8D5CD] text-xs text-[#26332C] placeholder-[#4B6072] focus:outline-none focus:border-[#214C3A]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(activeAlert.id, 'under_review')}
                className="py-2 rounded-xl bg-[#FEF7EC] hover:bg-[#F6E1C4] text-[#D4A44B] text-xs font-semibold border border-[#F6E1C4] transition-colors cursor-pointer"
              >
                Mark In Review
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(activeAlert.id, 'escalated')}
                className="py-2 rounded-xl bg-[#F0F7F3] hover:bg-[#E3EFE8] text-[#214C3A] text-xs font-semibold border border-[#B9D6C3] transition-colors cursor-pointer"
              >
                Escalate Case
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(activeAlert.id, 'resolved')}
                className="py-2 rounded-xl bg-[#214C3A] hover:bg-[#2C6A50] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Resolve Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
