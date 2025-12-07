
export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNIN = 'SIGNIN',
  RESET_PASSWORD = 'RESET_PASSWORD',
  INGESTION = 'INGESTION',
  AUDIT = 'AUDIT',
  VECTORS = 'VECTORS',
  DASHBOARD = 'DASHBOARD',
  PRICING = 'PRICING',
  ADMIN = 'ADMIN'
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
