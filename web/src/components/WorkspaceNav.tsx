import { useState } from 'react';
import {
    Inbox,
    FileText,
    Radar,
    Calendar,
    BarChart2,
    Settings,
    LogOut
} from 'lucide-react';
import type { WorkspaceId, AgentId } from '../lib/types/marketing-os';
import { SettingsDialog } from './SettingsDialog';

interface WorkspaceNavProps {
    activeWorkspace: WorkspaceId;
    onWorkspaceChange: (id: WorkspaceId) => void;
    activeAgent: AgentId | null;
    onAgentSelect: (id: AgentId) => void;
}

const WORKSPACE_ITEMS: { id: WorkspaceId; label: string; icon: React.ReactNode }[] = [
    { id: 'headquarters', label: 'Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'content_studio', label: 'Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'intelligence', label: 'Competitors', icon: <Radar className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

export function WorkspaceNav({
    activeWorkspace,
    onWorkspaceChange,
}: WorkspaceNavProps) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <nav className="w-64 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div>
                            <span className="text-white font-instrument-serif text-lg block leading-none">AIBC</span>
                            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">Media OS</span>
                        </div>
                    </div>
                </div>

                {/* Workspaces */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-1">
                        {WORKSPACE_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onWorkspaceChange(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                                    transition-all duration-200
                                    ${activeWorkspace === item.id
                                        ? 'bg-white text-black shadow-lg shadow-white/5'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.id === 'headquarters' && (
                                    <span className="ml-auto flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">
                                        3
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>

            <SettingsDialog
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}

export default WorkspaceNav;
