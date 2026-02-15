import { motion } from 'framer-motion';
import { BarChart3, Fingerprint, Video, Search } from 'lucide-react';

const caps = [
    {
        icon: Search,
        title: 'Market Scouting',
        items: ['Niche Gap Analysis', 'Trend Arb. Reporting', 'Competitor Shadowing'],
        c: 'text-brand-orange',
        b: 'bg-brand-orange/10'
    },
    {
        icon: Fingerprint,
        title: 'Brand Synthesis',
        items: ['Recursive Voice Mapping', 'Compliance Safeguards', 'Persona Alignment'],
        c: 'text-brand-green',
        b: 'bg-brand-green/10'
    },
    {
        icon: Video,
        title: 'Video Fulfillment',
        items: ['Async Tavus Rendering', 'Elite Tier Pipeline', 'Virtual Avatar Narratives'],
        c: 'text-brand-pink',
        b: 'bg-brand-pink/10'
    },
    {
        icon: BarChart3,
        title: 'Strategic Ideation',
        items: ['Multi-Post Campaigns', 'High-Impact Hooks', 'Newsletter Structuring'],
        c: 'text-blue-500',
        b: 'bg-blue-500/10'
    }
];

export default function Capabilities() {
    return (
        <section id="capabilities" className="py-32 bg-[#050505] px-6">
            <div className="mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-16 items-start">

                    {/* Header Column */}
                    <div className="lg:col-span-1 sticky top-32">
                        <h2 className="text-5xl font-serif font-medium text-white mb-8 uppercase tracking-tight leading-tight">
                            Industrial <br />
                            <span className="italic text-brand-pink">Operations.</span>
                        </h2>
                        <p className="text-white/40 mb-10 leading-relaxed font-light">
                            We don't offer features. We offer
                            <span className="text-white"> operational capabilities </span>
                            previously reserved for the world's largest agencies.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div className="h-[1px] w-full bg-white/5"></div>
                            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/20">
                                <span>RELIABILITY</span>
                                <span>99.9%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/20">
                                <span>LATENCY (VIDEO)</span>
                                <span>‹ 24H</span>
                            </div>
                        </div>
                    </div>

                    {/* Grid Column */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {caps.map((cap, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="bg-[#0A0A0A] border border-white/5 p-10 hover:border-white/10 transition-colors shadow-neo-hover"
                            >
                                <div className={`w-14 h-14 ${cap.b} flex items-center justify-center ${cap.c} mb-8`}>
                                    <cap.icon size={28} strokeWidth={1} />
                                </div>

                                <h3 className="text-2xl font-serif font-medium text-white mb-6 italic uppercase group-hover:text-brand-orange transition-colors">
                                    {cap.title}
                                </h3>

                                <ul className="space-y-4">
                                    {cap.items.map((item, j) => (
                                        <li key={j} className="text-[11px] text-white/30 font-mono uppercase tracking-[0.2em] flex items-center gap-3">
                                            <div className={`w-1 h-1 rounded-full bg-current ${cap.c}`}></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
