import React from 'react';
import { Clock, AlertOctagon, Layers, Sparkles, Shield, Lock, MoreHorizontal, CheckCircle, Plus } from 'lucide-react';
import type { AgentType } from '../lib/aibc/signals/types';

interface IntelligencePanelProps {
    agentType: AgentType;
}

const PanelContainer = ({ title, icon: Icon, children, accent = "zinc" }: { title: string, icon: any, children: React.ReactNode, accent?: string }) => (
    <div className={`rounded-xl border border-white/5 bg-black/20 overflow-hidden`}>
        <div className={`px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/5`}>
            <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 text-${accent}-400`} />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">{title}</span>
            </div>
            <MoreHorizontal className="w-3 h-3 text-zinc-600 cursor-pointer hover:text-white" />
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

export function IntelligencePanel({ agentType }: IntelligencePanelProps) {
    if (agentType === 'competitor_intelligence') {
        return (
            <>
                <PanelContainer title="Competitor Timeline" icon={Clock} accent="blue">
                    <div className="relative pl-4 border-l border-white/10 space-y-6 my-2">
                        {[
                            { t: '2h ago', items: ['Competitor X changed pricing', 'New feature launch detected'], color: 'bg-rose-500' },
                            { t: '5h ago', items: ['Hiring signal: VP of Marketing'], color: 'bg-emerald-500' },
                            { t: '1d ago', items: ['Press release: Series B funding'], color: 'bg-blue-500' }
                        ].map((event, i) => (
                            <div key={i} className="relative">
                                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${event.color} ring-4 ring-[#0a0a0f]`}></div>
                                <div className="text-[10px] text-zinc-500 font-mono mb-1">{event.t}</div>
                                {event.items.map((item, j) => (
                                    <div key={j} className="text-xs text-zinc-300 font-medium mb-1">{item}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                </PanelContainer>

                <PanelContainer title="Threat Heatmap" icon={AlertOctagon} accent="rose">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-white/5 rounded-lg text-center border border-white/5">
                            <div className="text-[9px] uppercase text-zinc-500 mb-1">Pricing</div>
                            <div className="text-xs font-black text-rose-400">HIGH</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg text-center border border-white/5">
                            <div className="text-[9px] uppercase text-zinc-500 mb-1">Product</div>
                            <div className="text-xs font-black text-amber-400">MED</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg text-center border border-white/5">
                            <div className="text-[9px] uppercase text-zinc-500 mb-1">Brand</div>
                            <div className="text-xs font-black text-emerald-400">LOW</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg text-center border border-white/5">
                            <div className="text-[9px] uppercase text-zinc-500 mb-1">Social</div>
                            <div className="text-xs font-black text-emerald-400">LOW</div>
                        </div>
                    </div>
                </PanelContainer>
            </>
        );
    }

    if (agentType === 'content_director') {
        return (
            <>
                <PanelContainer title="Editorial Command" icon={Layers} accent="violet">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider font-bold border-b border-white/5 pb-2">
                            <span>Drafting</span>
                            <span>Review</span>
                            <span>Ready</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="flex justify-between mb-2">
                                <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">LinkedIn</span>
                                <MoreHorizontal className="w-3 h-3 text-zinc-600" />
                            </div>
                            <div className="text-xs font-medium text-white mb-1">AI Productivity Trends</div>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-violet-500 h-full w-2/3"></div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5 opacity-70">
                            <div className="flex justify-between mb-2">
                                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Blog</span>
                            </div>
                            <div className="text-xs font-medium text-white mb-1">Q1 Market Analysis</div>
                        </div>
                    </div>
                </PanelContainer>

                <PanelContainer title="Angle Generator" icon={Sparkles} accent="fuchsia">
                    <div className="space-y-2">
                        {['Contrarian: "Why [Trend] is Dead"', 'Data-backed: "3 Stats changing X"', 'Human: "How we failed at Y"'].map((angle, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded transition-colors cursor-pointer group">
                                <Plus className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                                <span className="text-xs text-zinc-400 group-hover:text-white">{angle}</span>
                            </div>
                        ))}
                    </div>
                </PanelContainer>
            </>
        );
    }

    if (agentType === 'brand_architect') {
        return (
            <>
                <PanelContainer title="Brand DNA Map" icon={Shield} accent="amber">
                    <div className="flex justify-center py-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-dashed border-zinc-700 rounded-full"></div>
                            <div className="absolute inset-4 border border-zinc-600 rounded-full"></div>
                            <div className="absolute top-0 bottom-0 w-[1px] bg-zinc-800"></div>
                            <div className="absolute left-0 right-0 h-[1px] bg-zinc-800"></div>
                            <svg className="absolute inset-0 w-full h-full text-amber-500/20 fill-current" viewBox="0 0 100 100">
                                <polygon points="50,10 90,50 50,90 20,50" />
                            </svg>
                            <div className="text-2xl font-black text-amber-500 relative z-10">94%</div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-bold text-center">
                        <div>Tone</div>
                        <div>Visual</div>
                        <div>Values</div>
                    </div>
                </PanelContainer>

                <PanelContainer title="Guardrails" icon={Lock} accent="orange">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-rose-400">
                            <AlertOctagon className="w-3 h-3" />
                            <span>Blocked: "Cheap", "Discount"</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>Approved: "Premium", "Strategic"</span>
                        </div>
                    </div>
                </PanelContainer>
            </>
        );
    }

    // Default / other agent types
    return (
        <PanelContainer title="Agent Intelligence" icon={Shield} accent="zinc">
            <div className="text-xs text-zinc-500">No specialized panels available for this agent type yet.</div>
        </PanelContainer>
    );
}
