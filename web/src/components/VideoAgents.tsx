
import React from 'react';
import { Play, Clock, CheckCircle2 } from 'lucide-react';

const VideoAgents: React.FC = () => {
    return (
        <section id="video-agents" className="py-32 px-6 md:px-12 bg-zinc-950 border-b border-zinc-900/50 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left: Text Content */}
                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-7xl font-instrument-serif text-white tracking-tight mb-8">
                            AI Video Agents
                        </h2>

                        <p className="text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-lg">
                            For high-tier clients, AIBC offers AI-powered video agents trained on your brand and voice. Deliver studio-quality updates without the studio.
                        </p>

                        <div className="space-y-10 mb-12">
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Use Cases</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2">
                                    {[
                                        'Marketing announcements',
                                        'Product explainers',
                                        'Thought leadership content',
                                        'Internal communications',
                                        'Social media videos'
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 group">
                                            <CheckCircle2 className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors mt-0.5 shrink-0" />
                                            <span className="text-zinc-300 font-light group-hover:text-white transition-colors">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-white text-base font-medium mb-2">Asynchronous Generation</p>
                                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                                    Video agents are generated asynchronously to ensure quality and alignment. Delivered with a short turnaround window to maintain professional-grade results.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Preview */}
                    <div className="relative">
                        {/* Decorative elements */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/30 to-zinc-500/0 blur-2xl opacity-20 rounded-[2.5rem]"></div>

                        <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[9/16] md:aspect-[4/5] shadow-2xl group cursor-pointer">
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1588&auto=format&fit=crop"
                                alt="AI Video Agent"
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-1000 ease-out"
                            />

                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90"></div>

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-xl">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>
                            </div>

                            {/* UI Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-lg">Agent: Elena</p>
                                        <p className="text-xs text-zinc-400 uppercase tracking-wider">Product Specialist</p>
                                    </div>
                                </div>

                                {/* Fake Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
                                        <span>Generating...</span>
                                        <span>98%</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-[98%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoAgents;
