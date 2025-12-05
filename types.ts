
export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNIN = 'SIGNIN',
  INGESTION = 'INGESTION',
  AUDIT = 'AUDIT',
  VECTORS = 'VECTORS',
  DASHBOARD = 'DASHBOARD',
  PRICING = 'PRICING',
  HELPCENTER = 'HELPCENTER'
}

export interface NavProps {
  onNavigate: (view: ViewState) => void;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'SYSTEM' | 'AGENT' | 'METRICS' | 'INSIGHT' | 'INFO';
  message: string;
  subType?: string;
}
