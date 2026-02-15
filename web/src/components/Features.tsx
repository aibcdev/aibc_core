import { motion } from 'framer-motion';
import { Search, Brain, Shield, Layers } from 'lucide-react';

const features = [
    {
        icon: Search,
        title: 'Cognitive Reasoning',
        desc: 'Agents process your entire market footprint before generating. No generic loops.',
        tag: 'STRATEGIC',
        color: 'border-brand-orange/30',
        iconColor: 'text-brand-orange'
    },
    {
        icon: Brain,
        title: 'Static Personas',
        desc: 'Archetypes maintain 100% voice consistency. No model drift, no erratic shifts.',
        tag: 'DISCIPLINED',
        color: 'border-brand-green/30',
        iconColor: 'text-brand-green'
    },
    {
        icon: Shield,
        title: 'Brand Governance',
        desc: 'Strict brand overlays ensure every output is safe, compliant, and on-voice.',
        tag: 'SECURE',
        color: 'border-brand-pink/30',
        iconColor: 'text-brand-pink'
    },
    {
        icon: Layers,
        title: 'Unified Fulfillment',
        desc: 'A single agent powers your text, audio narration, and video avatars.',
        tag: 'SCALABLE',
        color: 'border-blue-500/30',
        iconColor: 'text-blue-500'
    }
];

export default function Features() {
    return (
        <section id="features" className="py-32 bg-[#050505] px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-24">
                    <h2 className="text-5xl font-serif font-medium text-white mb-6 uppercase tracking-tight">
                        Strategic <span className="italic text-brand-orange">Foundations</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-24 bg-white/20"></div>
                        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">Built for Industrial Scale</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="group relative"
                        >
                            <div className={`bg-[#0A0A0A] border ${f.color} p-8 h-full shadow-neo transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex flex-col md:flex-row items-start gap-8 relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <f.icon size={120} />
                                </div>

                                <div className={`w-16 h-16 shrink-0 bg-white/[0.03] border border-white/5 flex items-center justify-center ${f.iconColor}`}>
                                    <f.icon className="w-8 h-8" strokeWidth={1.2} />
                                </div>

                                <div className="relative z-10">
                                    <div className="text-[10px] font-mono mb-4 text-white/30 tracking-[0.4em] uppercase">{f.tag}</div>
                                    <h3 className="text-2xl font-serif font-medium text-white mb-4 italic">{f.title}</h3>
                                    <p className="text-white/50 leading-relaxed font-light">{f.desc}</p>
                                </div>

                                {/* Visual Corner Tab */}
                                <div className={`absolute bottom-0 right-0 w-8 h-8 ${f.iconColor} bg-current opacity-10 group-hover:opacity-100 transition-opacity`} style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
