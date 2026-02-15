import { motion } from 'framer-motion';
import type { BehaviorLayer, BehaviorLevel } from '../../lib/types/agent-identity';

interface BehaviorControlsProps {
    behavior: BehaviorLayer;
    onChange: (key: keyof BehaviorLayer, value: string) => void;
    disabled?: boolean;
}

const LEVEL_OPTIONS: { value: BehaviorLevel; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const CONTROLS: { key: keyof BehaviorLayer; label: string; description: string; options: { value: string; label: string }[] }[] = [
    {
        key: 'conversational_assertiveness',
        label: 'Conversational Assertiveness',
        description: 'How direct and confident the agent is in conversation.',
        options: LEVEL_OPTIONS
    },
    {
        key: 'sales_directness',
        label: 'Sales Directness',
        description: 'How pushy or consultative the sales approach is.',
        options: LEVEL_OPTIONS
    },
    {
        key: 'humor_level',
        label: 'Humor Level',
        description: 'Amount of wit and levity in responses.',
        options: [
            { value: 'none', label: 'None' },
            { value: 'subtle', label: 'Subtle' },
            { value: 'moderate', label: 'Moderate' },
        ]
    },
    {
        key: 'formality',
        label: 'Formality',
        description: 'Tone of language used.',
        options: [
            { value: 'casual', label: 'Casual' },
            { value: 'neutral', label: 'Neutral' },
            { value: 'formal', label: 'Formal' },
        ]
    },
    {
        key: 'risk_tolerance',
        label: 'Risk Tolerance',
        description: 'How bold vs cautious in statements and commitments.',
        options: [
            { value: 'conservative', label: 'Conservative' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'bold', label: 'Bold' },
        ]
    },
    {
        key: 'conversation_style',
        label: 'Conversation Style',
        description: 'Primary mode of engagement.',
        options: [
            { value: 'consultative', label: 'Consultative' },
            { value: 'directive', label: 'Directive' },
            { value: 'educational', label: 'Educational' },
            { value: 'friendly', label: 'Friendly' },
        ]
    }
];

export function BehaviorControls({ behavior, onChange, disabled }: BehaviorControlsProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Behavior Settings</h3>
                    <p className="text-sm text-zinc-500">Adjust how your agent interacts. Identity remains locked.</p>
                </div>
            </div>

            <div className="space-y-4">
                {CONTROLS.map(control => (
                    <motion.div
                        key={control.key}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="font-medium text-white">{control.label}</p>
                                <p className="text-xs text-zinc-500">{control.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                            {control.options.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => !disabled && onChange(control.key, option.value)}
                                    disabled={disabled}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${behavior[control.key] === option.value
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white/10 text-zinc-400 hover:text-white hover:bg-white/20'
                                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default BehaviorControls;
