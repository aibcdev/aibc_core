import type { Signal } from '../../types/marketing-os';

// Configurable polling interval
export const POLLING_INTERVAL_MS = 30000; // 30 seconds for demo

export class PollingService {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private onSignalDetected: (signal: Signal) => void;

    constructor(onSignalDetected: (signal: Signal) => void) {
        this.onSignalDetected = onSignalDetected;
    }

    start() {
        if (this.intervalId) return;
        console.log('Echo Agent: Observing market...');

        // Initial poll
        this.poll();

        // Start interval
        this.intervalId = setInterval(() => this.poll(), POLLING_INTERVAL_MS);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async poll() {
        // In a real implementation, this would call NewsAPI, Twitter API, etc.
        // For now, we simulate finding a signal occasionally.

        const shouldFindSignal = Math.random() > 0.7; // 30% chance per poll
        if (!shouldFindSignal) return;

        const mockSignal: Signal = await this.generateMockSignal();
        console.log('Echo Agent: Signal detected:', mockSignal.topic);
        this.onSignalDetected(mockSignal);
    }

    private async generateMockSignal(): Promise<Signal> {
        const scenarios = [
            { topic: 'Competitor Price Drop', source: 'manual', classification: 'competitor_move', urgency: 'high' },
            { topic: 'Viral Industry Thread', source: 'social', classification: 'market_opportunity', urgency: 'medium' },
            { topic: 'New Regulation Announced', source: 'news', classification: 'risk', urgency: 'high' },
            { topic: 'Conference Sponsorship Open', source: 'manual', classification: 'market_opportunity', urgency: 'low' }
        ];

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        return {
            signal_id: crypto.randomUUID(),
            source: scenario.source as any,
            timestamp: new Date(),
            topic: scenario.topic,
            summary: `Detected significant activity regarding ${scenario.topic}.`,
            industry: 'Tech',
            confidence: 0.85 + (Math.random() * 0.1),
            classification: scenario.classification as any,
            urgency: scenario.urgency as any,
            tags: ['AI', 'market_shift', 'automated'],
            processed: false
        };
    }
}
