import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceUploaderProps {
    onUploadComplete: (file: File, durationSeconds: number) => void;
    onDurationChange?: (seconds: number) => void;
}

export function VoiceUploader({ onUploadComplete, onDurationChange }: VoiceUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const getQualityTier = (seconds: number): { label: string; color: string; percent: number } => {
        if (seconds >= 600) return { label: 'Exceptional', color: 'text-emerald-400', percent: 100 };
        if (seconds >= 300) return { label: 'Great', color: 'text-emerald-400', percent: 75 };
        if (seconds >= 180) return { label: 'Usable', color: 'text-amber-400', percent: 50 };
        if (seconds > 0) return { label: 'Too Short', color: 'text-red-400', percent: 25 };
        return { label: 'Upload Audio', color: 'text-zinc-500', percent: 0 };
    };

    const processFile = useCallback(async (audioFile: File) => {
        setFile(audioFile);
        setStatus('processing');
        setError(null);

        try {
            const audioContext = new AudioContext();
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const durationSec = Math.floor(audioBuffer.duration);

            setDuration(durationSec);
            onDurationChange?.(durationSec);

            if (durationSec < 30) {
                setError('Audio must be at least 30 seconds long.');
                setStatus('error');
                return;
            }

            setStatus('complete');
            onUploadComplete(audioFile, durationSec);
        } catch (err) {
            console.error('Audio processing error:', err);
            setError('Could not process audio file. Please try a different format.');
            setStatus('error');
        }
    }, [onUploadComplete, onDurationChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('audio/')) {
            processFile(droppedFile);
        } else {
            setError('Please drop an audio file (MP3, WAV, M4A, etc.)');
        }
    }, [processFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const tier = getQualityTier(duration);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Drop Zone */}
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                    relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
                    ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/20 hover:border-white/40'}
                    ${status === 'complete' ? 'border-emerald-500 bg-emerald-500/5' : ''}
                    ${status === 'error' ? 'border-red-500 bg-red-500/5' : ''}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {status === 'idle' && (
                    <>
                        <Upload className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
                        <p className="text-white font-medium mb-1">Drop your voice here</p>
                        <p className="text-zinc-500 text-sm">Podcast, voice note, call recording, or video audio</p>
                    </>
                )}

                {status === 'processing' && (
                    <>
                        <Loader2 className="w-12 h-12 mx-auto text-emerald-500 mb-4 animate-spin" />
                        <p className="text-white font-medium">Processing audio...</p>
                    </>
                )}

                {status === 'complete' && (
                    <>
                        <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                        <p className="text-white font-medium mb-1">🔒 Voice Locked</p>
                        <p className="text-zinc-400 text-sm truncate max-w-xs mx-auto">{file?.name}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <p className="text-red-400 font-medium mb-1">Upload Failed</p>
                        <p className="text-zinc-500 text-sm">{error}</p>
                    </>
                )}
            </motion.div>

            {/* Duration Progress */}
            {duration > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">Voice Quality</span>
                        <span className={`text-sm font-medium ${tier.color}`}>{tier.label}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${tier.percent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-600 mt-1">
                        <span>0-3 min</span>
                        <span>5-10 min</span>
                        <span>10+ min</span>
                    </div>
                    <p className="text-center text-sm text-zinc-500 mt-2">
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')} uploaded
                    </p>
                </div>
            )}

            {/* Hint */}
            <p className="text-center text-xs text-zinc-600 mt-4">
                <Mic className="inline w-3 h-3 mr-1" />
                Your agent will sound like you — confident, natural, human.
            </p>
        </div>
    );
}

export default VoiceUploader;
