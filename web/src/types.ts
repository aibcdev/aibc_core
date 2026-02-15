
export interface Agent {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  image: string;
  action: string;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  readTime: string;
}
