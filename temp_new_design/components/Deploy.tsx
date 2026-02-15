
import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Globe, 
  Upload, 
  Cpu, 
  Activity, 
  Zap, 
  Eye, 
  FileText, 
  Video, 
  Search, 
  Megaphone, 
  Briefcase, 
  Loader2, 
  Sparkles,
  Shield
} from 'lucide-react';

// --- Types & Data ---

interface AgentDef {
  id: string;
  name: string;
  purpose: string;
  personality: string;
  icon: any;
  premium?: boolean;
}

const AGENT_TYPES: AgentDef[] = [
  {
    id: 'brand',
    name: 'The Brand Architect',
    purpose: 'Define and protect brand identity',
    personality: 'Calm, confident, opinionated',
    icon: Shield
  },
  {
    id: 'growth',
    name: 'The Growth Hacker',
    purpose: 'Find leverage and exploit it',
    personality: 'Energetic, aggressive, experimental',
    icon: Zap
  },
  {
    id: 'intel',
    name: 'The Intel Analyst',
    purpose: 'Surveillance + insight',
    personality: 'Cold, analytical',
    icon: Eye
  },
  {
    id: 'content',
    name: 'The Content Director',
    purpose: 'Content systems, not posts',
    personality: 'Structured creative',
    icon: FileText
  },
  {
    id: 'video',
    name: 'The Video Spokesperson',
    purpose: 'Human-facing brand presence',
    personality: 'Polished, relatable',
    icon: Video,
    premium: true
  },
  {
    id: 'research',
    name: 'The Market Researcher',
    purpose: 'Signal extraction',
    personality: 'Curious, neutral',
    icon: Search
  },
  {
    id: 'sales',
    name: 'The Persuasion Specialist',
    purpose: 'Conversion and influence',
    personality: 'Confident, subtle',
    icon: Megaphone
  },
  {
    id: 'exec',
    name: 'The Executive Briefing',
    purpose: 'Decision compression',
    personality: 'Direct, concise',
    icon: Briefcase
  }
];

// --- Components ---

const Deploy: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  // Slider States
  const [sliders, setSliders] = useState({
    empathyLogic: 50,
    conservativeAggressive: 70,
    conciseVerbose: 40,
    formalCasual: 30
  });

  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const toggleAgent = (id: string) => {
    if (selectedAgents.includes(id)) {
      setSelectedAgents(selectedAgents.filter(a => a !== id));
    } else {
      setSelectedAgents([...selectedAgents, id]);
    }
  };

  const handleScan = () => {
    if (!url) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const startDeployment = () => {
    setStep(4);
    // Simulate pipeline
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setDeploymentProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 50);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 md:px-8 relative z-10">
      
      {/* Header / Progress */}
      <div className="w-full max-w-5xl mb-12 fade-in-up">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-instrument-serif text-white">
             {step === 1 && "Choose Marketing Archetypes"}
             {step === 2 && "Ingest Digital Footprint"}
             {step === 3 && "Tune Agent Personality"}
             {step === 4 && "Deployment Pipeline"}
           </h1>
           <div className="flex gap-2">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className={`w-3 h-3 rounded-full transition-colors ${step >= i ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
             ))}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-xl rounded-3xl p-8 md:p-12 min-h-[600px] flex flex-col relative overflow-hidden shadow-2xl fade-in-up" style={{animationDelay: '0.2s'}}>
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        {/* Step 1: Select Agents */}
        {step === 1 && (
          <div className="flex flex-col h-full fade-in-up">
            <p className="text-zinc-400 font-light text-lg mb-8">
              Select the specialized agents you want to deploy to your team.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {AGENT_TYPES.map((agent) => {
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <div 
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`
                      relative p-5 rounded-xl border cursor-pointer transition-all duration-300 group
                      ${isSelected 
                        ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'}
                    `}
                  >
                    {agent.premium && (
                      <div className="absolute top-3 right-3">
                         <Sparkles className={`w-3 h-3 ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      </div>
                    )}
                    
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors
                      ${isSelected ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'}
                    `}>
                      <agent.icon className="w-5 h-5" />
                    </div>
                    
                    <h3 className={`font-medium mb-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {agent.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-3 font-mono border-b border-zinc-800/50 pb-2">
                      {agent.purpose}
                    </p>
                    <div className="flex items-center gap-1.5">
                       <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-zinc-600'}`}></div>
                       <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{agent.personality}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={selectedAgents.length === 0}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Digital Footprint */}
        {step === 2 && (
          <div className="flex flex-col h-full fade-in-up max-w-2xl mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-2xl text-white font-medium mb-3">Ingest Your Digital Footprint</h2>
              <p className="text-zinc-400 font-light">
                This is your moat. We analyze your website, socials, and documents to build a Brand DNA object unique to you.
              </p>
            </div>

            <div className="space-y-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
               <div>
                  <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Website URL</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com" 
                      className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button 
                      onClick={handleScan}
                      disabled={isScanning || !url || scanComplete}
                      className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium min-w-[120px] flex justify-center items-center"
                    >
                      {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : scanComplete ? <Check className="w-5 h-5 text-emerald-500" /> : 'Scan'}
                    </button>
                  </div>
               </div>

               {scanComplete && (
                 <div className="space-y-3 fade-in-up">
                    <div className="flex items-center justify-between text-sm p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                       <span className="text-emerald-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Site Content Ingested</span>
                       <span className="text-zinc-500 font-mono">142 Pages</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                       <span className="text-emerald-400 flex items-center gap-2"><Activity className="w-4 h-4" /> Brand Voice Detected</span>
                       <span className="text-zinc-500 font-mono">Professional / Tech</span>
                    </div>
                 </div>
               )}
               
               <div className="pt-6 border-t border-zinc-800">
                  <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Additional Context (Optional)</label>
                  <div className="border border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-900 hover:border-zinc-500 transition-colors">
                     <Upload className="w-8 h-8 text-zinc-600 mb-3" />
                     <p className="text-sm text-zinc-300">Upload Brand Guidelines (PDF)</p>
                     <p className="text-xs text-zinc-600 mt-1">Up to 25MB</p>
                  </div>
               </div>
            </div>

            <div className="mt-auto flex justify-between">
              <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white px-4">Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={!scanComplete}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Training Sliders */}
        {step === 3 && (
          <div className="flex flex-col h-full fade-in-up max-w-3xl mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-2xl text-white font-medium mb-3">Train & Tune</h2>
              <p className="text-zinc-400 font-light">
                Define how your agents think and communicate. Adjust these sliders to create a unique Brand DNA.
              </p>
            </div>

            <div className="space-y-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-10 mb-8">
               
               {/* Slider 1 */}
               <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium uppercase tracking-wide">
                     <span className="text-zinc-500">Empathy</span>
                     <span className="text-zinc-500">Logic</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={sliders.empathyLogic} 
                    onChange={(e) => setSliders({...sliders, empathyLogic: parseInt(e.target.value)})}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-emerald-400 transition-all"
                  />
               </div>

               {/* Slider 2 */}
               <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium uppercase tracking-wide">
                     <span className="text-zinc-500">Conservative</span>
                     <span className="text-zinc-500">Aggressive</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={sliders.conservativeAggressive} 
                    onChange={(e) => setSliders({...sliders, conservativeAggressive: parseInt(e.target.value)})}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-emerald-400 transition-all"
                  />
               </div>

               {/* Slider 3 */}
               <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium uppercase tracking-wide">
                     <span className="text-zinc-500">Concise</span>
                     <span className="text-zinc-500">Verbose</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={sliders.conciseVerbose} 
                    onChange={(e) => setSliders({...sliders, conciseVerbose: parseInt(e.target.value)})}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-emerald-400 transition-all"
                  />
               </div>

                {/* Slider 4 */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium uppercase tracking-wide">
                     <span className="text-zinc-500">Formal</span>
                     <span className="text-zinc-500">Casual</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={sliders.formalCasual} 
                    onChange={(e) => setSliders({...sliders, formalCasual: parseInt(e.target.value)})}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-emerald-400 transition-all"
                  />
               </div>

            </div>

            <div className="mt-auto flex justify-between">
              <button onClick={() => setStep(2)} className="text-zinc-500 hover:text-white px-4">Back</button>
              <button 
                onClick={startDeployment}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Deploy Agents <Cpu className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Pipeline Visualization */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full fade-in-up w-full">
            
            {deploymentProgress < 100 ? (
              <div className="w-full max-w-2xl">
                 <h2 className="text-3xl text-white font-instrument-serif text-center mb-16">Initializing Marketing Operating System...</h2>
                 
                 <div className="space-y-8">
                    {/* Stage 1 */}
                    <div className="flex items-center gap-6">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${deploymentProgress > 10 ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-zinc-700'}`}>
                          {deploymentProgress > 10 ? <Check className="w-4 h-4 text-white" /> : <span className="text-zinc-500 text-xs">1</span>}
                       </div>
                       <div className="flex-1">
                          <p className={`text-sm font-medium mb-1 ${deploymentProgress > 10 ? 'text-white' : 'text-zinc-500'}`}>Digital Footprint Ingest</p>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${Math.min(100, deploymentProgress * 3)}%`}}></div>
                          </div>
                       </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="flex items-center gap-6">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${deploymentProgress > 40 ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-zinc-700'}`}>
                          {deploymentProgress > 40 ? <Check className="w-4 h-4 text-white" /> : <span className="text-zinc-500 text-xs">2</span>}
                       </div>
                       <div className="flex-1">
                          <p className={`text-sm font-medium mb-1 ${deploymentProgress > 40 ? 'text-white' : 'text-zinc-500'}`}>Brand Voice & Personality Matrix</p>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${deploymentProgress > 33 ? Math.min(100, (deploymentProgress - 33) * 3) : 0}%`}}></div>
                          </div>
                       </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="flex items-center gap-6">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${deploymentProgress > 70 ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-zinc-700'}`}>
                          {deploymentProgress > 70 ? <Check className="w-4 h-4 text-white" /> : <span className="text-zinc-500 text-xs">3</span>}
                       </div>
                       <div className="flex-1">
                          <p className={`text-sm font-medium mb-1 ${deploymentProgress > 70 ? 'text-white' : 'text-zinc-500'}`}>Market & Competitor Context</p>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${deploymentProgress > 66 ? Math.min(100, (deploymentProgress - 66) * 3) : 0}%`}}></div>
                          </div>
                       </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="flex items-center gap-6">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${deploymentProgress > 95 ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-zinc-700'}`}>
                          {deploymentProgress > 95 ? <Check className="w-4 h-4 text-white" /> : <span className="text-zinc-500 text-xs">4</span>}
                       </div>
                       <div className="flex-1">
                          <p className={`text-sm font-medium mb-1 ${deploymentProgress > 95 ? 'text-white' : 'text-zinc-500'}`}>Agent Instance Deployment</p>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${deploymentProgress > 90 ? Math.min(100, (deploymentProgress - 90) * 10) : 0}%`}}></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="text-center fade-in-up">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-5xl font-instrument-serif text-white mb-6">Agents Deployed.</h2>
                <p className="text-zinc-400 text-xl font-light mb-12 max-w-xl mx-auto">
                   Your {selectedAgents.length} agents are now active and analyzing your market. Your first competitor briefing will arrive in 5 minutes.
                </p>
                <div className="flex gap-4 justify-center">
                   <button className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors">
                      Enter Dashboard
                   </button>
                   <button className="px-8 py-4 bg-zinc-800 text-white rounded-full font-semibold hover:bg-zinc-700 transition-colors">
                      View Live Logs
                   </button>
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
};

export default Deploy;
