/**
 * AIBC Signal Ingestion Service
 * Handles news and Reddit signals for agent routing
 */
// Thresholds from orchestration spec
const GLOBAL_MIN_CONFIDENCE = 0.6;
/**
 * Fetch news from NewsData.io (free tier: 200 req/day)
 */
export async function fetchNewsSignals(query, apiKey) {
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.results)
            return [];
        return data.results.map((article, index) => ({
            id: `news-${Date.now()}-${index}`,
            source: 'news',
            category: classifySignal(article.title, article.description),
            title: article.title,
            content: article.description || '',
            url: article.link,
            confidence: 0.75, // Default confidence for news
            metadata: {
                pubDate: article.pubDate,
                creator: article.creator,
                source_id: article.source_id,
            },
            createdAt: new Date(article.pubDate || Date.now()),
        }));
    }
    catch (error) {
        console.error('News fetch error:', error);
        return [];
    }
}
/**
 * Fetch trending posts from Reddit (free, no auth needed)
 */
export async function fetchRedditSignals(subreddit = 'marketing') {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'AIBC-Agent/1.0' }
        });
        const data = await response.json();
        if (!data.data?.children)
            return [];
        return data.data.children
            .filter((post) => post.data.score > 10) // Filter low engagement
            .map((post, index) => ({
            id: `reddit-${post.data.id}`,
            source: 'reddit',
            category: classifySignal(post.data.title, post.data.selftext),
            title: post.data.title,
            content: post.data.selftext?.substring(0, 500) || '',
            url: `https://reddit.com${post.data.permalink}`,
            confidence: calculateRedditConfidence(post.data),
            metadata: {
                score: post.data.score,
                num_comments: post.data.num_comments,
                subreddit: post.data.subreddit,
                author: post.data.author,
            },
            createdAt: new Date(post.data.created_utc * 1000),
        }));
    }
    catch (error) {
        console.error('Reddit fetch error:', error);
        return [];
    }
}
/**
 * Classify signal into category based on content
 */
function classifySignal(title, content) {
    const text = `${title} ${content}`.toLowerCase();
    // Keyword-based classification
    if (text.includes('competitor') || text.includes('rival') || text.includes('vs ')) {
        return 'competitor';
    }
    if (text.includes('regulation') || text.includes('law') || text.includes('policy')) {
        return 'regulatory';
    }
    if (text.includes('viral') || text.includes('trending') || text.includes('meme')) {
        return 'viral';
    }
    if (text.includes('culture') || text.includes('gen z') || text.includes('millennial')) {
        return 'cultural';
    }
    if (text.includes('platform') || text.includes('algorithm') || text.includes('tiktok') || text.includes('instagram')) {
        return 'platform';
    }
    return 'market'; // Default
}
/**
 * Calculate confidence score for Reddit posts
 */
function calculateRedditConfidence(postData) {
    const score = postData.score || 0;
    const comments = postData.num_comments || 0;
    const upvoteRatio = postData.upvote_ratio || 0.5;
    // Higher engagement = higher confidence
    let confidence = 0.5;
    if (score > 100)
        confidence += 0.15;
    if (score > 500)
        confidence += 0.1;
    if (comments > 50)
        confidence += 0.1;
    if (upvoteRatio > 0.8)
        confidence += 0.1;
    return Math.min(confidence, 0.95);
}
/**
 * Filter signals below confidence threshold
 */
export function filterSignals(signals) {
    return signals.filter(s => s.confidence >= GLOBAL_MIN_CONFIDENCE);
}
/**
 * Route signals to appropriate agents
 */
export function routeSignal(signal) {
    const ROUTING_TABLE = {
        competitor: ['competitor_intelligence'],
        regulatory: ['competitor_intelligence', 'growth_strategy'],
        market: ['competitor_intelligence', 'growth_strategy'],
        cultural: ['content_director'],
        viral: ['content_director', 'growth_strategy'],
        platform: ['content_director'],
        internal_brand: ['brand_architect'],
    };
    return ROUTING_TABLE[signal.category] || ['competitor_intelligence'];
}
//# sourceMappingURL=ingestion.js.map