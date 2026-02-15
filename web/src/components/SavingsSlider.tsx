
import React, { useState } from 'react';
import { Check } from 'lucide-react';

const SavingsSlider: React.FC = () => {
    const [volume, setVolume] = useState(50); // Represents % of output volume or spend

    // Calculate costs based on slider volume
    // Scale: 0 to 100
    // Agency Cost: $3,000 to $15,000+
    // AIBC Cost: Fixed at $499 (Elite) or relevant tier? Let's assume Elite for comparison.

    const agencyCost = Math.round(3000 + (volume * 150)); // $3000 base + variable
    const aibcCost = 499; // Fixed monthly price for Elite
    const savings = agencyCost - aibcCost;
    const savingsPercent = Math.round((savings / agencyCost) * 100);

    return (
        <div className="w-full max-w-4xl mx-auto mb-32">
            <h3 className="text-3xl md:text-5xl font-instrument-serif text-white text-center mb-6">
                Agency-level strategy for 1% of the price.
            </h3>
            <p className="text-zinc-400 text-center mb-16 max-w-lg mx-auto">
                Drag to compare traditional agency costs vs. the AIBC Elite infrastructure.
            </p>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 md:p-12 relative overflow-hidden">

                {/* Slider Control */}
                <div className="mb-12 relative z-10">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                        <span>Starter Output</span>
                        <span>Industrial Scale</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* Traditional Agency Side */}
                    <div className="md:border-r border-zinc-800 md:pr-12">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Traditional Agency</div>
                        <div className="text-4xl font-instrument-serif text-white mb-2">
                            ${agencyCost.toLocaleString()}
                            <span className="text-zinc-500 text-lg font-sans">/mo</span>
                        </div>
                        <ul className="space-y-3 mt-6 text-zinc-400 text-sm">
                            <li className="flex justify-between">
                                <span>Retainer Fee</span>
                                <span>${(agencyCost * 0.4).toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Content Production</span>
                                <span>${(agencyCost * 0.4).toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Strategy Hours</span>
                                <span>${(agencyCost * 0.2).toLocaleString()}</span>
                            </li>
                        </ul>
                    </div>

                    {/* AIBC Side */}
                    <div className="relative">
                        <div className="absolute -top-6 -right-6 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                            {savingsPercent}% Savings
                        </div>

                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">AIBC Elite Core</div>
                        <div className="text-4xl font-instrument-serif text-white mb-2">
                            ${aibcCost}
                            <span className="text-zinc-500 text-lg font-sans">/mo</span>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-zinc-400">
                                <strong>${savings.toLocaleString()} / mo</strong> saved
                            </div>
                        </div>
                    </div>

                </div>

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            </div>
        </div>
    );
};

export default SavingsSlider;
