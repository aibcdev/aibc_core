
import React from 'react';
import { Terminal, Zap, Fingerprint, Activity, FileText, Lock } from 'lucide-react';

const OperatingSystem: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-zinc-950 border-b border-zinc-900/50 overflow-hidden relative" id="platform">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

       <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-24">
             <h2 className="text-5xl md:text-7xl font-instrument-serif text-white tracking-tight mb-6">
                Computing that feels <br/> like a <span className="text-emerald-500">collaboration.</span>
             </h2>
             <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                From simple prompts to autonomous execution, we add perception, memory, and strategy to all the ways you interact with AI.
             </p>
          </div>

          <div className="relative min-h-[600px] md:min-h-[800px] w-full flex items-center justify-center">
             
             {/* --- Central "Neural Core" (Replacing the computer) --- */}
             <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center z-10">
                {/* Glowing Pulse */}
                <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse"></div>
                
                {/* The Core Object */}
                <div className="w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center relative shadow-2xl overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                   <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black"></div>
                   
                   {/* Spinning Element */}
                   <div className="relative w-32 h-32 md:w-40 md:h-40">
                      <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-2 border-2 border-emerald-500/50 rounded-full border-t-transparent animate-[spin_3s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Zap className="w-12 h-12 md:w-16 md:h-16 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      </div>
                   </div>

                   {/* Tech Label */}
                   <div className="absolute bottom-6 font-mono text-[10px] text-zinc-500 tracking-[0.2em] uppercase">Neural Core v2.4</div>
                </div>
             </div>

             {/* --- Floating Window 1 (Top Left): Strategy/Analysis --- */}
             <div className="absolute top-0 md:top-10 left-4 md:left-10 lg:left-0 max-w-[300px] md:max-w-sm w-full animate-float z-20">
                <div className="bg-[#0f0f11] border border-zinc-700/50 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                   {/* Retro Header */}
                   <div className="bg-[#1a1a1c] px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                      <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                      </div>
                      <span className="ml-auto text-[10px] font-mono text-zinc-500">ANALYSIS_MODE</span>
                   </div>
                   
                   <div className="p-5 md:p-6">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                            <Fingerprint className="w-5 h-5 text-emerald-400" />
                         </div>
                         <div>
                            <h3 className="font-instrument-serif text-lg text-white leading-none">Brand DNA</h3>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">Tone Analysis</p>
                         </div>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed mb-4 font-light border-l-2 border-zinc-700 pl-3">
                         "Adjusting campaign voice to <span className="text-emerald-400 font-medium">Authoritative</span> based on recent competitor shifts."
                      </p>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                         <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-emerald-500"></div>
                         </div>
                         <span>85%</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* --- Floating Window 2 (Bottom Right): Agent Output (The "Paper" Look) --- */}
             <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 lg:right-0 max-w-[300px] md:max-w-sm w-full animate-float-delayed z-30">
                <div className="bg-zinc-100 border border-white rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] transform rotate-[-2deg]">
                    {/* Light Header */}
                    <div className="bg-zinc-200 px-3 py-2 border-b border-zinc-300 flex items-center gap-2">
                       <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-zinc-400"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-zinc-400"></div>
                      </div>
                      <span className="ml-auto text-[10px] font-mono text-zinc-400">DELIVERABLE</span>
                   </div>

                   <div className="p-5 md:p-6">
                      <div className="flex items-center gap-3 mb-5">
                         <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md">
                            <Activity className="w-5 h-5 text-white" />
                         </div>
                         <div>
                            <h3 className="font-instrument-serif text-xl text-black leading-none">Agent Sarah</h3>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">Content Director</p>
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-sm hover:border-emerald-500 transition-colors cursor-pointer group">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-zinc-800 group-hover:text-black">Q3_Strategy_Brief.pdf</span>
                            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500"></div>
                         </div>
                         <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-sm hover:border-emerald-500 transition-colors cursor-pointer group">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-zinc-800 group-hover:text-black">LinkedIn_Assets.zip</span>
                            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* --- Floating Window 3 (Bottom Left): Code/Config (Technical Depth) --- */}
             <div className="hidden md:block absolute bottom-10 left-10 lg:left-0 max-w-xs w-full animate-float-slow z-10 opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-[#050505] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl font-mono text-[10px] md:text-xs">
                   <div className="bg-[#111] px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                      <Terminal className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-600">config.json</span>
                   </div>

                   <div className="p-5 text-zinc-500 space-y-1.5 leading-relaxed">
                      <div className="flex"><span className="text-purple-400">const</span> <span className="text-blue-300">agent_config</span> = {'{'}</div>
                      <div className="pl-4 flex"><span className="text-blue-300">role</span>: <span className="text-orange-300">"Strategist"</span>,</div>
                      <div className="pl-4 flex"><span className="text-blue-300">perception</span>: <span className="text-emerald-500">true</span>,</div>
                      <div className="pl-4 flex"><span className="text-blue-300">tools</span>: [<span className="text-orange-300">"Search"</span>, <span className="text-orange-300">"CRM"</span>],</div>
                      <div className="pl-4 flex"><span className="text-blue-300">autonomy</span>: <span className="text-emerald-500">1.0</span></div>
                      <div className="flex">{'}'};</div>
                      <div className="mt-2 text-zinc-700">// System ready...</div>
                   </div>
                </div>
             </div>

          </div>
       </div>
    </section>
  );
};

export default OperatingSystem;
