import React, { useState, useEffect } from 'react';
import {
    Zap,
    ShieldAlert,
    Lightbulb,
    Anchor,
    MessageSquare,
    Volume2,
    Save,
    Mic,
    AlertTriangle,
    Users
} from 'lucide-react';
import type { PersonalityProfile } from '../lib/aibc/signals/agents';
import type { AgentType } from '../lib/aibc/signals/types';
import type { AgentId } from '../lib/types/marketing-os';
import { updateAgentPersonality } from '../lib/aibc/signals/storage';

interface AgentControlsProps {
    agentType: AgentType;
    personality: PersonalityProfile;
    onUpdate: (newProfile: PersonalityProfile) => void;
}

const ControlSlider: React.FC<{
    label: string,
    icon: React.ElementType,
    value: number,
    onChange: (val: number) => void,
    leftLabel: string,
    rightLabel: string,
    color: string
}> = ({ label, icon: Icon, value, onChange, leftLabel, rightLabel, color }) => (
    <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
                <Icon className={`w-3 h-3 ${color}`} />
                <label className="text-xs font-medium text-zinc-300">{label}</label>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{value}%</span>
        </div>

        <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-600 w-8 text-right leading-tight">{leftLabel}</span>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[9px] text-zinc-600 w-8 leading-tight">{rightLabel}</span>
        </div>
    </div>
);

const GroupHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="mt-6 mb-3 px-2 flex items-center gap-2">
        <div className="h-px bg-zinc-800 flex-1"></div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{title}</span>
        <div className="h-px bg-zinc-800 flex-1"></div>
    </div>
);

export const AgentControls: React.FC<AgentControlsProps> = ({ agentType, personality, onUpdate }) => {
    const [localProfile, setLocalProfile] = useState<PersonalityProfile>(personality);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLocalProfile(personality);
        setIsDirty(false);
    }, [personality]);

    const handleChange = (key: keyof PersonalityProfile, val: number) => {
        const newProfile = { ...localProfile, [key]: val };
        setLocalProfile(newProfile);
        setIsDirty(true);
    };

    const handleSave = async () => {
        await updateAgentPersonality(agentType as AgentId, localProfile);
        onUpdate(localProfile);
        setIsDirty(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950/50">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-sm font-medium text-white">Personality Matrix</h3>
                    <p className="text-[10px] text-zinc-500">Tune behavioral DNA</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isDirty
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                >
                    <Save className="w-3 h-3" />
                    Save
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">

                {/* 1. Core Traits */}
                <GroupHeader title="Core Traits" />
                <ControlSlider
                    label="Aggression"
                    icon={Zap}
                    color="text-red-400"
                    value={localProfile.aggression}
                    onChange={(v) => handleChange('aggression', v)}
                    leftLabel="Passive"
                    rightLabel="Bold"
                />
                <ControlSlider
                    label="Criticality"
                    icon={ShieldAlert}
                    color="text-orange-400"
                    value={localProfile.criticality}
                    onChange={(v) => handleChange('criticality', v)}
                    leftLabel="Nice"
                    rightLabel="Critical"
                />
                <ControlSlider
                    label="Creativity"
                    icon={Lightbulb}
                    color="text-yellow-400"
                    value={localProfile.creativity}
                    onChange={(v) => handleChange('creativity', v)}
                    leftLabel="Proven"
                    rightLabel="Wild"
                />
                <ControlSlider
                    label="Caution"
                    icon={Anchor}
                    color="text-blue-400"
                    value={localProfile.caution}
                    onChange={(v) => handleChange('caution', v)}
                    leftLabel="Risky"
                    rightLabel="Safe"
                />

                {/* 2. Communication Style */}
                <GroupHeader title="Comm Style" />
                <ControlSlider
                    label="Confidence"
                    icon={Mic}
                    color="text-pink-400"
                    value={localProfile.confidence_expression}
                    onChange={(v) => handleChange('confidence_expression', v)}
                    leftLabel="Humble"
                    rightLabel="Assertive"
                />
                <ControlSlider
                    label="Tone"
                    icon={Volume2}
                    color="text-purple-400"
                    value={localProfile.emotional_tone}
                    onChange={(v) => handleChange('emotional_tone', v)}
                    leftLabel="Robot"
                    rightLabel="Human"
                />
                <ControlSlider
                    label="Density"
                    icon={MessageSquare}
                    color="text-emerald-400"
                    value={localProfile.communication_density}
                    onChange={(v) => handleChange('communication_density', v)}
                    leftLabel="Brief"
                    rightLabel="Detail"
                />

                {/* 3. Organizational Behavior */}
                <GroupHeader title="Org Behavior" />
                <ControlSlider
                    label="Disagreement"
                    icon={Users}
                    color="text-rose-400"
                    value={localProfile.disagreement_tendency}
                    onChange={(v) => handleChange('disagreement_tendency', v)}
                    leftLabel="Agree"
                    rightLabel="Pushback"
                />
                <ControlSlider
                    label="Escalation"
                    icon={AlertTriangle}
                    color="text-amber-400"
                    value={localProfile.escalation_bias}
                    onChange={(v) => handleChange('escalation_bias', v)}
                    leftLabel="Handle"
                    rightLabel="Flag"
                />
            </div>
        </div>
    );
};
