import { motion } from 'framer-motion';
import { Phone, Globe, MessageCircle, MessageSquare, Users, Download, CheckCircle } from 'lucide-react';
import type { AgentProfile } from '../../lib/types/agent-identity';

interface DeploymentPanelProps {
    profile: AgentProfile;
    onDeploy: (target: string) => void;
}

const DEPLOYMENT_OPTIONS = [
    { id: 'bland', label: 'Bland Voice Agent', icon: Phone, description: 'Deploy to phone calls via Bland AI', color: 'bg-violet-500' },
    { id: 'widget', label: 'Website Widget', icon: Globe, description: 'Embed on your website', color: 'bg-blue-500' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Connect to WhatsApp Business', color: 'bg-green-500' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Enable SMS conversations', color: 'bg-amber-500' },
    { id: 'internal', label: 'Internal Tools', icon: Users, description: 'Training & sales enablement', color: 'bg-pink-500' },
];

export function DeploymentPanel({ profile, onDeploy }: DeploymentPanelProps) {
    const isDeployed = (id: string) => profile.deployed_to.includes(id as any);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Deploy Your Agent</h3>
                <p className="text-sm text-zinc-500">Export your locked voice config and personality schema to these platforms.</p>
            </div>

            <div className="grid gap-3">
                {DEPLOYMENT_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const deployed = isDeployed(option.id);

                    return (
                        <motion.button
                            key={option.id}
                            onClick={() => onDeploy(option.id)}
                            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${deployed
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-white/10 hover:border-white/30 bg-white/5'
                                }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className={`p-3 rounded-lg ${option.color}`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-white">{option.label}</p>
                                <p className="text-xs text-zinc-500">{option.description}</p>
                            </div>
                            {deployed ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <span className="text-xs text-zinc-500">Deploy →</span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Export Config */}
            <div className="pt-4 border-t border-white/10">
                <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export Config (JSON)</span>
                </button>
                <p className="text-xs text-zinc-600 text-center mt-2">
                    Includes: Locked voice config, Personality schema, Conversation policies
                </p>
            </div>
        </div>
    );
}

export default DeploymentPanel;
