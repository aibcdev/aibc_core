/**
 * AIBC Signal Ingestion Service
 * Handles news and Reddit signals for agent routing
 */
export type SignalCategory = 'competitor' | 'market' | 'regulatory' | 'cultural' | 'viral' | 'platform' | 'internal_brand';
export interface Signal {
    id: string;
    source: 'news' | 'reddit' | 'manual';
    category: SignalCategory;
    title: string;
    content: string;
    url?: string;
    confidence: number;
    metadata: Record<string, unknown>;
    createdAt: Date;
}
/**
 * Fetch news from NewsData.io (free tier: 200 req/day)
 */
export declare function fetchNewsSignals(query: string, apiKey: string): Promise<Signal[]>;
/**
 * Fetch trending posts from Reddit (free, no auth needed)
 */
export declare function fetchRedditSignals(subreddit?: string): Promise<Signal[]>;
/**
 * Filter signals below confidence threshold
 */
export declare function filterSignals(signals: Signal[]): Signal[];
/**
 * Route signals to appropriate agents
 */
export declare function routeSignal(signal: Signal): string[];
//# sourceMappingURL=ingestion.d.ts.map