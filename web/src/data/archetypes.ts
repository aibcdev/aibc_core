
import {
    Crown, Lightbulb, Zap, Heart, Shield, Telescope,
    Map, Sparkles, Sword, Smile, Anchor, Users,
    Briefcase, Scale, Layers, Feather, Target,
    Cpu, Flame, Sprout
} from 'lucide-react';

export interface Archetype {
    id: string;
    name: string;
    description: string;
    motto: string;
    icon: any;
    color: string;
    stats: {
        empathy_logic: number;
        conservative_aggressive: number;
        concise_verbose: number;
        formal_casual: number;
    };
}

export const ARCHETYPES: Archetype[] = [
    {
        id: 'alchemist',
        name: 'The Alchemist',
        description: 'Transformation and magic. Turning lead into gold.',
        motto: 'Anything is possible.',
        icon: Sparkles,
        color: 'emerald',
        stats: { empathy_logic: 60, conservative_aggressive: 80, concise_verbose: 40, formal_casual: 50 }
    },
    {
        id: 'ruler',
        name: 'The Ruler',
        description: 'Control and leadership. Creating order from chaos.',
        motto: 'Power isn’t given, it’s taken.',
        icon: Crown,
        color: 'orange',
        stats: { empathy_logic: 10, conservative_aggressive: 60, concise_verbose: 90, formal_casual: 90 }
    },
    {
        id: 'creator',
        name: 'The Creator',
        description: 'Innovation and imagination. Realizing a vision.',
        motto: 'If you can imagine it, it can be done.',
        icon: Lightbulb,
        color: 'purple',
        stats: { empathy_logic: 70, conservative_aggressive: 50, concise_verbose: 60, formal_casual: 30 }
    },
    {
        id: 'innocent',
        name: 'The Innocent',
        description: 'Optimism and purity. Seeking happiness.',
        motto: 'Life is simple and good.',
        icon: Sprout,
        color: 'blue',
        stats: { empathy_logic: 90, conservative_aggressive: 20, concise_verbose: 50, formal_casual: 40 }
    },
    {
        id: 'sage',
        name: 'The Sage',
        description: 'Wisdom and analysis. Seeking the truth.',
        motto: 'The truth will set you free.',
        icon: Layers,
        color: 'zinc',
        stats: { empathy_logic: 10, conservative_aggressive: 30, concise_verbose: 80, formal_casual: 80 }
    },
    {
        id: 'explorer',
        name: 'The Explorer',
        description: 'Discovery and freedom. Breaking new ground.',
        motto: 'Don’t fence me in.',
        icon: Map,
        color: 'cyan',
        stats: { empathy_logic: 40, conservative_aggressive: 70, concise_verbose: 50, formal_casual: 20 }
    },
    {
        id: 'outlaw',
        name: 'The Outlaw',
        description: 'Disruption and rebellion. Challenging the status quo.',
        motto: 'Rules are made to be broken.',
        icon: Sword,
        color: 'red',
        stats: { empathy_logic: 30, conservative_aggressive: 90, concise_verbose: 90, formal_casual: 10 }
    },
    {
        id: 'magician',
        name: 'The Magician',
        description: 'Visionary and charismatic. Understanding the universe.',
        motto: 'I make things happen.',
        icon: Zap,
        color: 'violet',
        stats: { empathy_logic: 50, conservative_aggressive: 80, concise_verbose: 30, formal_casual: 40 }
    },
    {
        id: 'hero',
        name: 'The Hero',
        description: 'Courage and competence. Improving the world.',
        motto: 'Where there’s a will, there’s a way.',
        icon: Target,
        color: 'blue',
        stats: { empathy_logic: 20, conservative_aggressive: 80, concise_verbose: 80, formal_casual: 60 }
    },
    {
        id: 'lover',
        name: 'The Lover',
        description: 'Passion and connection. Creating intimacy.',
        motto: 'You are the only one.',
        icon: Heart,
        color: 'rose',
        stats: { empathy_logic: 100, conservative_aggressive: 40, concise_verbose: 60, formal_casual: 20 }
    },
    {
        id: 'jester',
        name: 'The Jester',
        description: 'Playful and humorous. Living in the moment.',
        motto: 'If I can’t dance, I don’t want to be part of your revolution.',
        icon: Smile,
        color: 'yellow',
        stats: { empathy_logic: 60, conservative_aggressive: 50, concise_verbose: 30, formal_casual: 10 }
    },
    {
        id: 'everyman',
        name: 'The Everyman',
        description: 'Relatable and grounded. Belonging.',
        motto: 'All men and women are created equal.',
        icon: Users,
        color: 'teal',
        stats: { empathy_logic: 80, conservative_aggressive: 30, concise_verbose: 50, formal_casual: 10 }
    },
    {
        id: 'caregiver',
        name: 'The Caregiver',
        description: 'Nurturing and selfless. Protecting others.',
        motto: 'Love your neighbor as yourself.',
        icon: Feather,
        color: 'green',
        stats: { empathy_logic: 100, conservative_aggressive: 10, concise_verbose: 60, formal_casual: 50 }
    },
    {
        id: 'architect',
        name: 'The Architect',
        description: 'Systematic and structured. Building foundations.',
        motto: 'Structure creates freedom.',
        icon: Briefcase,
        color: 'slate',
        stats: { empathy_logic: 5, conservative_aggressive: 40, concise_verbose: 80, formal_casual: 90 }
    },
    {
        id: 'strategist',
        name: 'The Strategist',
        description: 'Calculated and long-term. Playing chess.',
        motto: 'Think three moves ahead.',
        icon: Telescope,
        color: 'indigo',
        stats: { empathy_logic: 10, conservative_aggressive: 50, concise_verbose: 70, formal_casual: 70 }
    },
    {
        id: 'commander',
        name: 'The Commander',
        description: 'Bold and directive. Taking charge.',
        motto: 'Lead, follow, or get out of the way.',
        icon: Shield,
        color: 'orange',
        stats: { empathy_logic: 0, conservative_aggressive: 100, concise_verbose: 100, formal_casual: 80 }
    },
    {
        id: 'diplomat',
        name: 'The Diplomat',
        description: 'Peaceful and mediating. Finding common ground.',
        motto: 'Peace above all.',
        icon: Scale,
        color: 'sky',
        stats: { empathy_logic: 90, conservative_aggressive: 10, concise_verbose: 50, formal_casual: 60 }
    },
    {
        id: 'provocateur',
        name: 'The Provocateur',
        description: 'Challenging and witty. Stirring the pot.',
        motto: 'Why so serious?',
        icon: Flame,
        color: 'red',
        stats: { empathy_logic: 30, conservative_aggressive: 90, concise_verbose: 40, formal_casual: 10 }
    },
    {
        id: 'futurist',
        name: 'The Futurist',
        description: 'Forward-looking and tech-first. Defining tomorrow.',
        motto: 'The future is now.',
        icon: Cpu,
        color: 'violet',
        stats: { empathy_logic: 20, conservative_aggressive: 80, concise_verbose: 70, formal_casual: 30 }
    },
    {
        id: 'traditionalist',
        name: 'The Traditionalist',
        description: 'Stable and heritage-focused. Preserving history.',
        motto: 'If it ain’t broke, don’t fix it.',
        icon: Anchor,
        color: 'stone',
        stats: { empathy_logic: 40, conservative_aggressive: 20, concise_verbose: 60, formal_casual: 100 }
    }
];
