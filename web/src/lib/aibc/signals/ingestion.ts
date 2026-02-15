/**
 * AIBC Signal Ingestion Service
 * Handles news and Reddit signals for agent routing
 */

import type { Signal, SignalClassification } from '../../types/marketing-os';

// Thresholds from orchestration spec (Production)
export const GLOBAL_MIN_CONFIDENCE = 0.65;

/**
 * Get API Key safely
 */
function getApiKey(name: string): string | null {
    try {
        // @ts-ignore - access safe in simulated env
        return import.meta.env?.[name] || localStorage.getItem(name);
    } catch {
        return null;
    }
}

/**
 * Fetch simulated signals (fallback when no API key)
 */
export async function simulateSignals(): Promise<Signal[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const TOPICS: { title: string; category: SignalClassification; urgency: import('../../types/marketing-os').Priority }[] = [
        { title: 'Intel cuts enterprise GPU pricing by 15%', category: 'competitor_move', urgency: 'high' },
        { title: 'NVIDIA GTC 2026 Conference Announced', category: 'competitor_move', urgency: 'medium' },
        { title: 'AMD launches new "AI Ready" enterprise campaign', category: 'competitor_move', urgency: 'low' },
        { title: 'Enterprise AI spending expected to grow 40% in 2026', category: 'market_opportunity', urgency: 'medium' },
        { title: 'EU proposes new AI infrastructure regulations', category: 'risk', urgency: 'medium' },
        { title: 'OpenAI releases GPT-5 Turbo for Enterprise', category: 'competitor_move', urgency: 'high' },
        { title: 'Google Gemini integration hits 50% market share', category: 'market_opportunity', urgency: 'medium' }
    ];

    return TOPICS.map((topic, i) => ({
        signal_id: `sim-${Date.now()}-${i}`,
        source: 'rss',
        topic: topic.title,
        summary: `Simulated signal regarding ${topic.title}. Potential impact on strategy.`,
        industry: 'Tech',
        confidence: 0.85 + (Math.random() * 0.1),
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        tags: [topic.category, 'tech', 'ai', topic.urgency],
        classification: topic.category,
        urgency: topic.urgency,
        processed: false,
        raw_content: JSON.stringify(topic)
    }));
}

/**
 * Fetch news from NewsData.io (free tier: 200 req/day)
 */
export async function fetchNewsSignals(query: string = 'artificial intelligence enterprise'): Promise<Signal[]> {
    const apiKey = getApiKey('VITE_NEWS_API_KEY');

    if (!apiKey) {
        return simulateSignals();
    }

    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results) return [];

        return data.results.map((article: any, index: number) => ({
            signal_id: `news-${Date.now()}-${index}`,
            source: 'news',
            topic: article.title,
            summary: article.description || article.title,
            industry: 'Tech',
            confidence: 0.9,
            timestamp: new Date(article.pubDate || Date.now()),
            tags: ['news', 'market'],
            classification: classifySignal(article.title, article.description),
            processed: false,
            url: article.link,
            raw_content: article.content
        }));
    } catch (error) {
        console.error('News fetch error:', error);
        return simulateSignals();
    }
}

/**
 * Classify signal into category based on content
 */
function classifySignal(title: string, content: string = ''): SignalClassification {
    const text = `${title} ${content}`.toLowerCase();

    if (text.includes('competitor') || text.includes('rival') || text.includes('vs ')) return 'competitor_move';
    if (text.includes('trend') || text.includes('viral')) return 'cultural_moment';
    if (text.includes('risk') || text.includes('regulation') || text.includes('law')) return 'risk';
    if (text.includes('growth') || text.includes('opportunity') || text.includes('market')) return 'market_opportunity';

    return 'market_opportunity'; // Default
}

/**
 * Filter signals based on confidence and relevance
 */
export function filterSignals(signals: Signal[]): Signal[] {
    return signals.filter(s => s.confidence >= GLOBAL_MIN_CONFIDENCE);
}

/**
 * Route signal to appropriate agents based on classification
 */
export function routeSignal(signal: Signal): import('../../types/marketing-os').AgentId[] {
    const routing: Record<SignalClassification, import('../../types/marketing-os').AgentId[]> = {
        'competitor_move': ['vantage', 'echo'],
        'market_opportunity': ['vantage', 'sage'],
        'risk': ['vantage', 'echo'],
        'cultural_moment': ['sage', 'pulse'],
        'product_launch': ['vantage', 'sage']
    };

    return routing[signal.classification] || ['echo'];
}

/**
 * Fetch simulated Reddit signals
 */
export async function fetchRedditSignals(subreddit: string): Promise<Signal[]> {
    console.log(`Fetching signals from r/${subreddit}`);
    // Stub implementation
    return simulateSignals();
}


