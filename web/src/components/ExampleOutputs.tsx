
import React, { useState } from 'react';
import { ArrowRight, X, Play, Volume2, TrendingUp, Sparkles, Zap, Target, Activity, Fingerprint } from 'lucide-react';
import { OUTPUTS } from '../constants';

const ExampleOutputs: React.FC = () => {
    const [activeSample, setActiveSample] = useState<string | null>(null);

    const handleClose = () => setActiveSample(null);

    const renderSampleContent = (id: string) => {
        switch (id) {
            case 'intelligence':
                return (
                    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
                        {/* Background Blobs */}
                        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full mix-blend-screen"></div>

                        {/* HUD Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-12">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md">
                                    <Activity className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-mono text-zinc-300 tracking-wider">LIVE INTELLIGENCE FEED</span>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-3xl font-medium text-white mb-1">Competitor Watch</h3>
                                    <p className="text-zinc-500 font-mono text-xs">Sector: B2B SaaS • Region: NA</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                                {/* Main Signal Card */}
                                <div className="lg:col-span-2 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <div className="relative h-full bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between overflow-hidden">
                                        <div className="absolute top-0 right-0 p-32 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                                    <img src="https://logo.clearbit.com/stripe.com" className="w-8 h-8 object-contain" alt="Stripe" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white text-xl font-medium">Stripe</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                        <span className="text-red-400 text-xs font-medium uppercase tracking-wide">Critical Shift Detected</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl text-zinc-100 font-light leading-snug mb-6">
                                                Competitor has initiated a <span className="text-white font-medium border-b-2 border-orange-500">predatory pricing strategy</span> targeting your Enterprise segment.
                                            </h2>
                                            <div className="flex flex-wrap gap-3">
                                                <span className="px-3 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-zinc-400">Source: Pricing Page API</span>
                                                <span className="px-3 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-zinc-400">Confidence: 99.8%</span>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-zinc-800/50">
                                            <button className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                                                <Zap className="w-4 h-4 fill-black" /> Generate Counter-Campaign
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Side Metrics */}
                                <div className="space-y-6 flex flex-col">
                                    <div className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5"></div>
                                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Churn Risk</span>
                                        <span className="text-5xl font-instrument-serif text-white mb-2">High</span>
                                        <span className="text-red-400 text-sm font-medium">+15% exposure</span>
                                    </div>
                                    <div className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5"></div>
                                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Market Sentiment</span>
                                        <span className="text-5xl font-instrument-serif text-white mb-2">Mixed</span>
                                        <span className="text-zinc-400 text-sm">Social volume spiking</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'brand':
                return (
                    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col">
                        {/* Organic Background Shape */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent blur-[100px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_20s_linear_infinite]"></div>

                        <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-instrument-serif text-white mb-1">Brand DNA Guardrails</h3>
                                    <p className="text-zinc-500 text-sm">Real-time Tone Enforcement Engine</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                                    <Fingerprint className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                                {/* Visualizer Side */}
                                <div className="relative h-[400px] lg:h-full w-full bg-zinc-900/30 rounded-[3rem] border border-zinc-800/50 backdrop-blur-xl p-8 flex flex-col items-center justify-center">
                                    {/* Rings */}
                                    <div className="absolute w-64 h-64 border border-emerald-500/20 rounded-full animate-[ping_3s_linear_infinite]"></div>
                                    <div className="absolute w-48 h-48 border border-emerald-500/30 rounded-full"></div>
                                    <div className="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-xl"></div>

                                    <div className="relative z-10 text-center space-y-2">
                                        <div className="text-6xl font-medium text-white tracking-tighter">98<span className="text-2xl text-emerald-500">%</span></div>
                                        <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Resonance Score</div>
                                    </div>

                                    {/* Floating Attributes */}
                                    <div className="absolute top-10 left-10 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300 shadow-xl">
                                        Authority: <span className="text-emerald-400">High</span>
                                    </div>
                                    <div className="absolute bottom-20 right-10 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300 shadow-xl">
                                        Empathy: <span className="text-emerald-400">Calibrated</span>
                                    </div>
                                    <div className="absolute top-20 right-0 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300 shadow-xl">
                                        Clarity: <span className="text-emerald-400">Optimal</span>
                                    </div>
                                </div>

                                {/* Text Transformation Side */}
                                <div className="space-y-8">
                                    <div className="relative pl-6 border-l-2 border-zinc-800">
                                        <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Incoming Draft</p>
                                        <p className="text-zinc-400 text-lg line-through decoration-zinc-600 decoration-1">
                                            "Hey guys, we just shipped a fix for the slow loading thing."
                                        </p>
                                    </div>

                                    <div className="flex justify-center lg:justify-start pl-2">
                                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                                            <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
                                        </div>
                                    </div>

                                    <div className="relative pl-6 border-l-2 border-emerald-500">
                                        <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                        <p className="text-emerald-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" /> Optimized Output
                                        </p>
                                        <p className="text-white text-2xl font-medium leading-relaxed">
                                            "Performance update deployed: <span className="text-emerald-400">Latency reduced by 40%</span>. System stability restored."
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                );

            case 'strategy':
                return (
                    <div className="relative w-full h-full bg-[#050505] overflow-hidden flex flex-col">
                        {/* Grid & Glow */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent"></div>

                        <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-3xl font-instrument-serif text-white">Growth Vector Map</h3>
                                <p className="text-zinc-500 text-sm">Strategic Leverage Points • Week 42</p>
                            </div>

                            <div className="flex-1 relative border border-zinc-800 bg-zinc-900/30 rounded-3xl backdrop-blur-sm overflow-hidden">
                                {/* Map Visualization */}

                                {/* Center Node */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] z-10 relative">
                                        Growth
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-zinc-700/50 rounded-full -z-0"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-zinc-800/50 rounded-full -z-10"></div>
                                </div>

                                {/* Satellite Nodes */}
                                <div className="absolute top-[20%] right-[20%] group cursor-pointer">
                                    <div className="relative z-10 bg-black border border-emerald-500/50 p-4 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <span className="text-emerald-500 text-xs font-bold uppercase">High Leverage</span>
                                        </div>
                                        <p className="text-white font-medium text-sm">Programmatic SEO</p>
                                    </div>
                                    <div className="absolute top-10 right-10 w-32 h-[1px] bg-gradient-to-r from-transparent to-zinc-700 origin-right -rotate-45"></div>
                                </div>

                                <div className="absolute bottom-[25%] left-[15%] group cursor-pointer">
                                    <div className="relative z-10 bg-black border border-blue-500/50 p-4 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            <span className="text-blue-500 text-xs font-bold uppercase">Undervalued</span>
                                        </div>
                                        <p className="text-white font-medium text-sm">LinkedIn Ads (CMO)</p>
                                    </div>
                                </div>

                                <div className="absolute top-[30%] left-[20%] opacity-50 grayscale">
                                    <div className="bg-black border border-zinc-700 p-3 rounded-xl">
                                        <p className="text-zinc-500 text-xs">Meta Ads (Sat.)</p>
                                    </div>
                                </div>

                                {/* Lines (Simulated with absolute divs for simplicity) */}
                                <svg className="absolute inset-0 pointer-events-none opacity-20">
                                    <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="white" strokeWidth="1" />
                                    <line x1="50%" y1="50%" x2="15%" y2="75%" stroke="white" strokeWidth="1" />
                                </svg>
                            </div>

                            {/* Bottom Panel */}
                            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                                <div className="min-w-[200px] p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Total Opportunity</span>
                                    <span className="text-2xl text-white font-instrument-serif">$1.2M ARR</span>
                                </div>
                                <div className="min-w-[200px] p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Execution Time</span>
                                    <span className="text-2xl text-white font-instrument-serif">2 Weeks</span>
                                </div>
                                <button className="ml-auto px-6 py-2 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors self-center">
                                    Export Plan
                                </button>
                            </div>
                        </div>
                    </div>
                );

            // Fallback or other simple ones (keeping them roughly the same but cleaner)
            case 'content':
                return (
                    <div className="bg-[#f5f5f7] w-full h-full flex flex-col font-sans text-black relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center items-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform rotate-[-2deg] transition-transform hover:rotate-0 duration-500 border border-zinc-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        in
                                    </div>
                                    <div>
                                        <div className="h-2 w-24 bg-zinc-100 rounded mb-1"></div>
                                        <div className="h-2 w-16 bg-zinc-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-zinc-100 rounded w-full"></div>
                                    <div className="h-4 bg-zinc-100 rounded w-5/6"></div>
                                </div>
                                <div className="w-full aspect-video bg-zinc-100 rounded-xl mb-4 flex items-center justify-center text-zinc-300">
                                    <span className="text-xs font-medium uppercase tracking-widest">Gen-AI Image Asset</span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <span className="px-4 py-2 bg-white rounded-full shadow-sm text-xs font-medium text-zinc-500 border border-zinc-200">#ThoughtLeadership</span>
                                <span className="px-4 py-2 bg-white rounded-full shadow-sm text-xs font-medium text-zinc-500 border border-zinc-200">#Growth</span>
                            </div>
                        </div>
                    </div>
                );

            case 'video':
                return (
                    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center group overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1588&auto=format&fit=crop"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-700"
                            alt="Background"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>

                        <div className="relative z-10 text-center">
                            <button className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </button>
                            <h3 className="text-white text-2xl font-medium tracking-tight">Q3 Market Update</h3>
                            <p className="text-zinc-400 text-sm mt-2">Generated by <span className="text-white">Agent Elena</span></p>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-white"></div>
                                </div>
                            </div>
                            <span className="text-xs text-zinc-400 font-mono">0:24 / 1:15</span>
                        </div>
                    </div>
                );

            default:
                return <div className="text-white p-10">Select a sample</div>;
        }
    }

    return (
        <section className="py-32 px-6 md:px-12 bg-zinc-950 border-b border-zinc-900/50" id="outputs">
            <div className="max-w-[1800px] mx-auto">
                <h2 className="text-5xl md:text-7xl font-instrument-serif font-normal text-white tracking-tight mb-24">
                    Example Outputs
                    <span className="block font-inter text-xl text-zinc-400 font-light mt-6 max-w-2xl tracking-normal leading-relaxed">
                        Real deliverables generated by your AI agents, continuously and on-demand.
                    </span>
                </h2>

                <div className="flex flex-col">
                    {OUTPUTS.map((output, index) => (
                        <article key={index} className="group grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-8 py-10 border-t border-zinc-800 items-center hover:bg-zinc-900/20 transition-colors duration-300 cursor-pointer" onClick={() => setActiveSample(output.id)}>
                            <div className="lg:col-span-2">
                                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{output.type}</span>
                            </div>
                            <div className="lg:col-span-6">
                                <h3 className="text-2xl md:text-3xl text-white leading-snug">
                                    <span className="font-semibold tracking-tight">{output.title}</span>
                                    <span className="font-instrument-serif text-zinc-400 italic ml-2">{output.subtitle}</span>
                                </h3>
                            </div>
                            <div className="lg:col-span-2 lg:text-right">
                                <span className="text-sm font-medium text-zinc-400">{output.readTime}</span>
                            </div>
                            <div className="lg:col-span-2 flex justify-start lg:justify-end">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveSample(output.id); }}
                                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-800 border border-zinc-700/50 text-white hover:bg-white hover:text-black transition-all duration-300 group/btn"
                                >
                                    <span className="text-sm font-medium">View Sample</span>
                                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 group-hover/btn:bg-black/10 transition-colors">
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                                    </div>
                                </button>
                            </div>
                        </article>
                    ))}
                    <div className="border-b border-zinc-800 w-full"></div>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeSample && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={handleClose}
                >
                    {/* Modal Content - Using irregular border radius/shape concepts visually via internal content */}
                    <div
                        className="w-full max-w-6xl h-[85vh] md:h-[800px] relative flex flex-col animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/20 hover:bg-white hover:text-black text-white border border-white/10 transition-all backdrop-blur-sm"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {renderSampleContent(activeSample)}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ExampleOutputs;
