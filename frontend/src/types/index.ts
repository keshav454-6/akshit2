export type RiskCategory = 'Low' | 'Medium' | 'High';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'under_review' | 'resolved' | 'escalated';
export type InvestigationStatus = 'open' | 'in_progress' | 'closed' | 'escalated';

export interface FraudPrediction {
  id?: string;
  fraud_probability: number;
  risk_score: number;
  risk_category: RiskCategory;
  anomaly_score: number;
  is_flagged: boolean;
  detection_reasons: string[];
  rule_triggers: string[];
  recommended_action: string;
  model_version?: string;
  feature_contributions?: Record<string, number>;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  timestamp: string;
  transaction_type: string;
  payment_method: string;
  device_id: string;
  ip_address: string;
  location: string;
  transaction_frequency: number;
  account_age: number;
  previous_behavior: number;
  receiver_risk_history: number;
  is_collect_request: boolean;
  is_new_beneficiary: boolean;
  transaction_velocity: number;
  prediction?: FraudPrediction;
  created_at: string;
}

export interface Alert {
  id: string;
  transaction_id: string;
  alert_type: string;
  priority: AlertPriority;
  status: AlertStatus;
  reason: string;
  triggered_rules: string[];
  reviewed_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at?: string;
  transaction_details?: {
    transaction_id: string;
    amount: number;
    sender_id: string;
    receiver_id: string;
    location: string;
    timestamp: string;
  };
}

export interface AlertUpdate {
  status?: AlertStatus | string;
  priority?: AlertPriority | string;
  resolution_notes?: string;
}

export interface Investigation {
  id: string;
  alert_id?: string;
  transaction_id: string;
  analyst_id?: string;
  status: InvestigationStatus;
  notes?: string;
  findings: Record<string, any>;
  outcome?: string;
  created_at: string;
  updated_at?: string;
  analyst_name?: string;
  transaction_details?: {
    transaction_id: string;
    amount: number;
    sender_id: string;
    receiver_id: string;
    location: string;
  };
}

export interface InvestigationCreate {
  alert_id?: string;
  transaction_id: string;
  status?: InvestigationStatus | string;
  notes?: string;
  findings?: Record<string, any>;
  outcome?: string;
}

export interface InvestigationUpdate {
  status?: InvestigationStatus | string;
  notes?: string;
  findings?: Record<string, any>;
  outcome?: string;
}

export interface TrendPoint {
  timestamp: string;
  total_count: number;
  fraud_count: number;
  suspicious_count: number;
  safe_count: number;
}

export interface PieCategory {
  name: string;
  value: number;
  color: string;
}

export interface DashboardAnalytics {
  total_transactions: number;
  total_analyzed: number;
  safe_transactions: number;
  suspicious_transactions: number;
  confirmed_fraud_cases: number;
  total_transaction_value: number;
  fraud_detection_rate: number;
  average_risk_score: number;
  trend_data: TrendPoint[];
  pie_distribution: PieCategory[];
  risk_score_distribution: { range: string; min: number; max: number; count: number }[];
  recent_alerts: {
    id: string;
    transaction_id: string;
    amount: number;
    priority: string;
    status: string;
    reason: string;
    timestamp: string;
  }[];
  live_feed: {
    transaction_id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    risk_score: number;
    risk_category: string;
    is_flagged: boolean;
    timestamp: string;
  }[];
}

export interface ModelMetrics {
  model_name: string;
  model_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  false_positive_rate: number;
  false_negative_rate: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  feature_importances: Record<string, number>;
  evaluation_date: string;
  is_active: boolean;
  total_test_samples?: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}
