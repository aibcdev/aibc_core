
import { Check, Plus } from 'lucide-react';


const Pricing = () => {

   return (
      <section className="py-32 bg-zinc-950 relative overflow-hidden" id="pricing">
         {/* Background Gradients */}
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
               <h2 className="text-5xl md:text-7xl font-instrument-serif text-white mb-6">
                  Intelligent <span className="text-emerald-500">Capital.</span>
               </h2>
               <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
                  Deploy autonomous agents that cost a fraction of traditional headcount.
               </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-10">

               {/* Starter */}
               <div className="border border-zinc-800 bg-zinc-900/30 rounded-2xl p-8 hover:border-zinc-700 transition-colors relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 group-hover:bg-zinc-600 transition-colors rounded-t-2xl"></div>
                  <h3 className="text-2xl font-instrument-serif text-white mb-2">Starter</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                     <span className="text-4xl font-bold text-white">$2,500</span>
                     <span className="text-zinc-500">/mo</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-8 h-10">For startups needing core autonomous marketing functions.</p>

                  <ul className="space-y-4 mb-8">
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> 2 Autonomous Agents
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Daily social posting
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Weekly strategy report
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Email Support
                     </li>
                  </ul>

                  <button className="w-full py-4 rounded-lg border border-white text-white font-medium hover:bg-white hover:text-black transition-all">
                     Deploy Starter
                  </button>
               </div>

               {/* Growth */}
               <div className="border border-emerald-500/50 bg-zinc-900/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1 rounded-full">POPULAR</div>
                  <h3 className="text-2xl font-instrument-serif text-white mb-2">Growth</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                     <span className="text-4xl font-bold text-white">$5,000</span>
                     <span className="text-zinc-500">/mo</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-8 h-10">Full marketing team replacement for scaling brands.</p>

                  <ul className="space-y-4 mb-8">
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> 5 Autonomous Agents
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Full content production
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> 24/7 Community Mgmt
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Daily Strategy Adjustments
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Plus className="w-4 h-4 text-emerald-500 shrink-0" /> Priority Support
                     </li>
                  </ul>

                  <button className="w-full py-4 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20">
                     Deploy Growth
                  </button>
               </div>

               {/* Enterprise */}
               <div className="border border-zinc-800 bg-zinc-900/30 rounded-2xl p-8 hover:border-zinc-700 transition-colors relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 group-hover:bg-zinc-600 transition-colors rounded-t-2xl"></div>
                  <h3 className="text-2xl font-instrument-serif text-white mb-2">Enterprise</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                     <span className="text-4xl font-bold text-white">Custom</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-8 h-10">Custom agent architectures for global organizations.</p>

                  <ul className="space-y-4 mb-8">
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited Agents
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Custom Training Data
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> On-premise Deployment
                     </li>
                     <li className="flex gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated Success Manager
                     </li>
                  </ul>

                  <button className="w-full py-4 rounded-lg border border-white text-white font-medium hover:bg-white hover:text-black transition-all">
                     Contact Sales
                  </button>
               </div>

            </div>

         </div>
      </section>
   );
};

export default Pricing;
