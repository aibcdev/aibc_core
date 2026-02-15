
import React, { useState } from 'react';
import { Check, Plus, Minus, HelpCircle, Zap, Shield, BarChart3, Users } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="pt-40 pb-24 bg-zinc-950 relative overflow-hidden min-h-screen">
       {/* Section Header */}
       <div className="max-w-4xl mx-auto text-center px-6 mb-20">
          <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-4 block">Pricing</span>
          <h2 className="text-5xl md:text-6xl font-instrument-serif text-white tracking-tight mb-6">
             Scale Marketing by Deploying <br/> Agents — Not Headcount
          </h2>
          <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
             Pricing scales based on the number of deployed agents, depth of training, and output frequency. You’re not paying for software; you’re investing in continuous execution.
          </p>
       </div>

       {/* Pricing Cards */}
       <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24">
          
          {/* Starter Plan */}
          <div className="border border-zinc-800 bg-zinc-900/20 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-colors">
             <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-4xl font-instrument-serif text-white">$49</span>
                   <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm h-10">Deploy specialized intelligence for focused tasks.</p>
             </div>
             
             <button className="w-full py-3 rounded-lg border border-zinc-700 text-white font-medium hover:bg-white hover:text-black transition-all mb-8">
                Start Free Trial
             </button>

             <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Includes:</p>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      1–2 Specialized Agents
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Basic Digital Footprint Scan
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Daily Content Outputs
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Brand Voice Calibration
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Email Support
                   </li>
                </ul>
             </div>
          </div>

          {/* Growth Plan (Highlighted) */}
          <div className="border border-emerald-500/30 bg-zinc-900/40 rounded-2xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(16,185,129,0.05)]">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
             </div>
             <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
                <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-4xl font-instrument-serif text-white">$199</span>
                   <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm h-10">A full marketing team replacing manual grunt work.</p>
             </div>
             
             <button className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all mb-8 shadow-lg shadow-emerald-900/20">
                Deploy Agent Team
             </button>

             <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Everything in Starter, plus:</p>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm text-zinc-200 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Full Agent Team (Strategy, Content, Intel)
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Competitor Intelligence Agent
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Deep Knowledge Base Training
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Weekly Strategy Briefings
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      Priority Processing
                   </li>
                </ul>
             </div>
          </div>

          {/* Elite Plan */}
          <div className="border border-orange-500/20 bg-gradient-to-b from-orange-950/10 to-zinc-900/20 rounded-2xl p-8 flex flex-col hover:border-orange-500/40 transition-colors">
             <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
                <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-4xl font-instrument-serif text-white">$499</span>
                   <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm h-10">Video agents + advanced intelligence for scale.</p>
             </div>
             
             <button className="w-full py-3 rounded-lg bg-orange-700/80 text-white font-medium hover:bg-orange-600 transition-all mb-8 border border-orange-600/30">
                Contact Sales
             </button>

             <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Everything in Growth, plus:</p>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm text-white font-medium">
                      <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      AI Video Agents (Premium)
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      Unlimited Agent Instances
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      Real-time Market Adaptation
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      Dedicated Account Manager
                   </li>
                   <li className="flex gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      Custom API Integrations
                   </li>
                </ul>
             </div>
          </div>
       </div>

       {/* Enterprise Banner */}
       <div className="max-w-[1400px] mx-auto px-6 mb-32">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
             <div>
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise Custom Pricing</h3>
                <p className="text-zinc-400 max-w-xl">
                   Plug AIBC into your stack and scale content like software. Custom training, SSO, role-based access, and unlimited usage with SLAs.
                </p>
             </div>
             <button className="whitespace-nowrap px-8 py-3 rounded-lg border border-zinc-700 text-white font-medium hover:bg-white hover:text-black transition-all">
                Talk to Sales
             </button>
          </div>
       </div>

       {/* Features Grid */}
       <div className="max-w-[1200px] mx-auto px-6 mb-32">
          <p className="text-center text-zinc-500 text-sm uppercase tracking-widest mb-12">All plans include</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4 text-zinc-300">
                   <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-white font-medium text-sm mb-2">Footprint Ingestion</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">We read your site & socials to learn your voice instantly.</p>
             </div>
             <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4 text-zinc-300">
                   <Users className="w-5 h-5" />
                </div>
                <h4 className="text-white font-medium text-sm mb-2">Persona Tuning</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">Adjust agent behavior to match your exact brand tone.</p>
             </div>
             <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4 text-zinc-300">
                   <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-white font-medium text-sm mb-2">Brand Guardrails</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">Agents never hallucinate off-brand messaging.</p>
             </div>
             <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4 text-zinc-300">
                   <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-white font-medium text-sm mb-2">Outcome Focus</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">Outputs grouped by campaign theme & business goal.</p>
             </div>
          </div>
       </div>

       {/* Comparison / Cost Saving */}
       <div className="max-w-[1000px] mx-auto px-6 mb-32">
          <h3 className="text-3xl font-instrument-serif text-white text-center mb-16">
             Agency-level strategy for 1% of the price.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
             {/* Column 1 */}
             <div className="space-y-4">
                 <div className="pb-2 border-b border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider">Capability</div>
                 <div className="flex justify-between text-zinc-300"><span>Organic Social</span></div>
                 <div className="flex justify-between text-zinc-300"><span>Short Form Video</span></div>
                 <div className="flex justify-between text-zinc-300"><span>Paid Ads Strategy</span></div>
                 <div className="flex justify-between text-zinc-300"><span>SEO Content</span></div>
                 <div className="flex justify-between text-zinc-300"><span>Competitor Intel</span></div>
             </div>
             {/* Column 2 */}
             <div className="space-y-4">
                 <div className="pb-2 border-b border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider">Traditional Agency</div>
                 <div className="text-zinc-400">$5,000/mo</div>
                 <div className="text-zinc-400">$7,500/mo</div>
                 <div className="text-zinc-400">$3,000/mo</div>
                 <div className="text-zinc-400">$4,000/mo</div>
                 <div className="text-zinc-400">$2,000/mo</div>
             </div>
             {/* Column 3 */}
             <div className="space-y-4 bg-emerald-900/10 -m-4 p-4 rounded-xl border border-emerald-500/10">
                 <div className="pb-2 border-b border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">AIBC Agent Team</div>
                 <div className="text-white font-medium">Included</div>
                 <div className="text-white font-medium">Included</div>
                 <div className="text-white font-medium">Included</div>
                 <div className="text-white font-medium">Included</div>
                 <div className="text-white font-medium">Included</div>
             </div>
          </div>
       </div>

       {/* FAQ */}
       <div className="max-w-3xl mx-auto px-6 mb-32">
          <h3 className="text-3xl font-instrument-serif text-white mb-8">Frequently asked questions</h3>
          <div className="space-y-4">
             {[
                "What happens after I deploy an agent?",
                "Can I train the agents on my private documents?",
                "What is the difference between Growth and Elite?",
                "Do you post content for me?",
                "Can I cancel my plan?"
             ].map((q, i) => (
                <div key={i} className="group border border-zinc-800 rounded-lg p-5 hover:bg-zinc-900/50 cursor-pointer transition-colors">
                   <div className="flex justify-between items-center">
                      <span className="text-zinc-300 font-medium group-hover:text-white">{q}</span>
                      <Plus className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Bottom CTA */}
       <div className="max-w-[1400px] mx-auto px-6">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-orange-950/40 via-zinc-900 to-black border border-zinc-800 p-12 md:p-24 text-center relative overflow-hidden">
             {/* Abstract Glow */}
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-instrument-serif text-white tracking-tight mb-6">
                   Ready to stop staring at a <br/> blank content calendar?
                </h2>
                <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto mb-10">
                   Let AIBC turn your existing digital footprint into the next year of content ideas, scripts, posts, and video concepts.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                   <button className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors">
                      Start Free Trial
                   </button>
                   <span className="text-zinc-500 text-sm">No credit card needed · Upgrade only if you love the output.</span>
                </div>
             </div>
          </div>
       </div>

    </section>
  );
};

export default Pricing;
