import { FileText, Image, Box, FileCode } from 'lucide-react';
import { useMarketingOS } from '../../lib/store';

interface ArtifactPreviewProps {
    artifactId: string;
    expanded?: boolean;
}

const typeIcons = {
    text: FileText,
    image: Image,
    code: FileCode,
    data: Box,
    default: FileText
};

export function ArtifactPreview({ artifactId, expanded = false }: ArtifactPreviewProps) {
    const artifact = useMarketingOS(state => state.artifacts.find(a => a.artifact_id === artifactId));

    if (!artifact) return null;

    const Icon = typeIcons[artifact.type as keyof typeof typeIcons] || typeIcons.default;

    return (
        <div className="group flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
            <div className="p-2 rounded bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate pr-2">
                        {artifact.title}
                    </h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${artifact.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        artifact.status === 'review' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-zinc-500/10 text-zinc-400'
                        }`}>
                        {artifact.status.replace('_', ' ')}
                    </span>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                    Version {artifact.version} • Created by {artifact.created_by}
                </p>

                {expanded && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                        <pre className="text-xs font-mono text-zinc-400 bg-black/20 p-2 rounded overflow-x-auto">
                            {JSON.stringify(artifact.content, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
