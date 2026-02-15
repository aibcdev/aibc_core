import React from 'react';

interface TeamMemberProps {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'Active' | 'Scanning' | 'Reviewing' | 'Idle';
    gradient: string;
    accentColor: string;
    isSelected: boolean;
    onClick: () => void;
}

const statusConfig = {
    Active: { color: 'bg-emerald-400', label: 'Active', textColor: 'text-emerald-400' },
    Scanning: { color: 'bg-blue-400', label: 'Scanning', textColor: 'text-blue-400' },
    Reviewing: { color: 'bg-amber-400', label: 'Reviewing', textColor: 'text-amber-400' },
    Idle: { color: 'bg-zinc-400', label: 'Idle', textColor: 'text-zinc-400' },
};

const TeamMember: React.FC<TeamMemberProps> = ({
    name,
    role,
    avatar,
    status,
    gradient,
    isSelected,
    onClick,
}) => {
    const statusInfo = statusConfig[status];

    return (
        <button
            onClick={onClick}
            className={`
                w-full p-4 rounded-3xl transition-all duration-300 group relative overflow-hidden
                ${isSelected
                    ? `bg-gradient-to-br ${gradient} shadow-xl scale-[1.02]`
                    : 'bg-white/5 hover:bg-white/10 hover:scale-[1.01]'
                }
            `}
        >
            {/* Subtle glow effect when selected */}
            {isSelected && (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 blur-xl`}></div>
            )}

            <div className="relative flex items-center gap-4">
                {/* Avatar */}
                <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
                    ${isSelected
                        ? 'bg-white/20 shadow-lg'
                        : `bg-gradient-to-br ${gradient} shadow-md`
                    }
                    transition-all duration-300 group-hover:shadow-xl
                `}>
                    {avatar}
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`
                            text-base font-bold truncate
                            ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}
                        `}>
                            {name}
                        </span>
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full ${statusInfo.color} ${status === 'Active' || status === 'Scanning' ? 'animate-pulse' : ''}`}></div>
                    </div>
                    <div className={`
                        text-xs font-medium truncate
                        ${isSelected ? 'text-white/70' : 'text-zinc-500'}
                    `}>
                        {role}
                    </div>
                </div>

                {/* Status badge */}
                <div className={`
                    px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider
                    ${isSelected
                        ? 'bg-white/20 text-white'
                        : `bg-white/5 ${statusInfo.textColor}`
                    }
                `}>
                    {statusInfo.label}
                </div>
            </div>

            {/* Activity indicator bar */}
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isSelected ? 'bg-white/40' : `bg-gradient-to-r ${gradient}`}`}
                    style={{
                        width: status === 'Active' ? '85%' : status === 'Scanning' ? '60%' : status === 'Reviewing' ? '45%' : '15%',
                    }}
                ></div>
            </div>
        </button>
    );
};

export default TeamMember;
