
import { Agent, ProcessStep, Insight } from './types';

export const AGENTS: Agent[] = [
  {
    id: 1,
    title: "Competitor Intelligence",
    description: "Tracks competitors, messaging shifts, and market movements in real-time.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1445aeb2-ddb4-4e4d-a151-c96381893f07_1600w.jpg"
  },
  {
    id: 2,
    title: "Content Director",
    description: "Builds structured content systems aligned with your brand voice and goals.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/04ff5a45-5b01-4b68-a092-f3ec2da28b5e_1600w.jpg"
  },
  {
    id: 3,
    title: "Brand Architect",
    description: "Defines and enforces brand positioning, tone, and visual identity consistency.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f365bf31-c2fb-44c2-a24a-c78fedc640ba_1600w.jpg"
  },
  {
    id: 4,
    title: "Growth Strategy",
    description: "Identifies leverage points, campaigns, and experiments to drive measurable growth.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Executive Briefing",
    description: "Delivers compressed insights for fast decision-making without the noise.",
    image: "https://images.unsplash.com/photo-1639322537228-ad7117a39490?q=80&w=2664&auto=format&fit=crop"
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    title: "Ingest Your Digital Footprint",
    description: "We analyze your website, content, competitors, and positioning to create a foundation for your AI agents.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f36259a7-cc94-4846-8290-2df52026731d_original.gif",
    action: "Start Analysis"
  },
  {
    id: 2,
    title: "Deploy Marketing Agents",
    description: "Choose the type of marketers you need — strategy, content, intelligence, video — and set them live.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ebfeb48e-4108-49c6-86a2-a1491f93b564_original.gif",
    action: "Select Agents"
  },
  {
    id: 3,
    title: "Train & Tune",
    description: "Adjust personality, tone, and focus areas. Upload proprietary knowledge to make them uniquely yours.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1445aeb2-ddb4-4e4d-a151-c96381893f07_1600w.jpg",
    action: "Customize"
  },
  {
    id: 4,
    title: "Receive Continuous Outputs",
    description: "Insights, content, video, and strategy — delivered on demand and continuously improved through feedback.",
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/04ff5a45-5b01-4b68-a092-f3ec2da28b5e_1600w.jpg",
    action: "View Dashboard"
  }
];

export const OUTPUTS: Insight[] = [
  {
    id: "intelligence",
    type: "Intelligence",
    title: "Weekly Competitor Briefings",
    subtitle: "Strategic Market Summaries",
    readTime: "Daily"
  },
  {
    id: "content",
    type: "Content",
    title: "Daily Content & Campaign Ideas",
    subtitle: "Brand-aligned messaging",
    readTime: "On Demand"
  },
  {
    id: "video",
    type: "Video",
    title: "AI-Generated Spokespeople",
    subtitle: "Scripts & Visuals",
    readTime: "Asynchronous"
  },
  {
    id: "strategy",
    type: "Strategy",
    title: "Market Movements Analysis",
    subtitle: "Leverage Points Identified",
    readTime: "Weekly"
  },
  {
    id: "brand",
    type: "Brand",
    title: "Voice & Tone Enforcement",
    subtitle: "Consistency Across Channels",
    readTime: "Real-time"
  }
];
