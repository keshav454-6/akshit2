import React, { useState, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AnalyzeTransactionModal } from './components/modals/AnalyzeTransactionModal';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { AlertsPage } from './pages/AlertsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { DatasetAnalysisPage } from './pages/DatasetAnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { LeakLockPage } from './pages/LeakLockPage';
import { PermissionLensPage } from './pages/PermissionLensPage';
import { WebsiteRiskPage } from './pages/WebsiteRiskPage';
import { VoiceScamPage } from './pages/VoiceScamPage';
import { SessionMonitoringPage } from './pages/SessionMonitoringPage';
import { useWebSocket } from './hooks/useWebSocket';
import { Transaction } from './types';

const MainLayout: React.FC = () => {
  const [realtimeTransactions, setRealtimeTransactions] = useState<Transaction[]>([]);
  const [alertCount, setAlertCount] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleIncomingTransaction = useCallback((data: any) => {
    setRealtimeTransactions((prev) => [data, ...prev.slice(0, 49)]);
  }, []);

  const handleIncomingAlert = useCallback((alertData: any) => {
    setAlertCount((prev) => prev + 1);
    setToastMessage(`🚨 Security Alert: ₹${Number(alertData.amount).toLocaleString()} (${alertData.reason})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  }, []);

  const { isConnected } = useWebSocket(handleIncomingTransaction, handleIncomingAlert);

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#26332C] flex flex-col font-sans selection:bg-[#B9D6C3] selection:text-[#214C3A]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#FFFFFF] border border-[#F1C8C8] text-[#26332C] px-4 py-3 rounded-xl enterprise-shadow flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B74A4A] animate-ping" />
          <p className="text-xs font-semibold text-[#B74A4A]">{toastMessage}</p>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
        wsConnected={isConnected}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar alertCount={alertCount} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F5F3ED] max-w-7xl mx-auto w-full">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  realtimeTransactions={realtimeTransactions}
                  onOpenAnalyze={() => setIsAnalyzeModalOpen(true)}
                />
              }
            />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route
              path="/live-monitoring"
              element={
                <LiveMonitoringPage
                  realtimeTransactions={realtimeTransactions}
                  isSimulating={isSimulating}
                  setIsSimulating={setIsSimulating}
                />
              }
            />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/leak-lock" element={<LeakLockPage />} />
            <Route path="/permission-lens" element={<PermissionLensPage />} />
            <Route path="/website-risk" element={<WebsiteRiskPage />} />
            <Route path="/voice-scam" element={<VoiceScamPage />} />
            <Route path="/session-monitoring" element={<SessionMonitoringPage />} />
            <Route path="/investigations" element={<InvestigationsPage />} />
            <Route path="/model-insights" element={<ModelInsightsPage />} />
            <Route path="/dataset-analysis" element={<DatasetAnalysisPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Single Transaction Analyze Modal */}
      <AnalyzeTransactionModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        onAnalysisComplete={(res) => {
          setRealtimeTransactions((prev) => [
            {
              id: 'txn-' + Date.now(),
              transaction_id: res.transaction_id,
              sender_id: 'current_user@upi',
              receiver_id: 'beneficiary@upi',
              amount: 0,
              timestamp: new Date().toISOString(),
              transaction_type: 'UPI',
              payment_method: 'UPI',
              device_id: 'DEV-CURRENT',
              ip_address: '127.0.0.1',
              location: 'India',
              transaction_frequency: 1,
              account_age: 30,
              previous_behavior: 1.0,
              receiver_risk_history: 0.0,
              is_collect_request: false,
              is_new_beneficiary: false,
              transaction_velocity: 1.0,
              created_at: new Date().toISOString(),
              prediction: res,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}
