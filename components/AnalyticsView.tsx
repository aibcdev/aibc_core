import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Bell, Download, Filter, Loader2, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  marketShare?: number;
  marketShareChange?: number;
  rank?: number;
  totalCompetitors?: number;
  brandSentiment?: number;
  sentimentChange?: number;
  competitorMentions?: number;
  mentionsChange?: number;
  industry?: string;
  isLoading: boolean;
  error?: string;
}

const AnalyticsView: React.FC = () => {
  const [dateRange] = useState('Last 30 Days');
  const [analytics, setAnalytics] = useState<AnalyticsData>({ isLoading: true });
  const [competitorData, setCompetitorData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setAnalytics({ isLoading: true });
      
      // Get scan data to determine if this is a website or social account
      const lastScanResults = localStorage.getItem('lastScanResults');
      const lastUsername = localStorage.getItem('lastScannedUsername');
      
      if (!lastScanResults || !lastUsername) {
        setAnalytics({ 
          isLoading: false, 
          error: 'No scan data available. Run a digital footprint scan first.' 
        });
        return;
      }

      const scanData = JSON.parse(lastScanResults);
      const marketShare = scanData.marketShare;
      const competitors = scanData.competitorIntelligence || [];

      // Determine if website or social account based on scan data
      const isWebsite = scanData.brandDNA?.industry || scanData.extractedContent?.content_themes?.some((t: string) => 
        t.toLowerCase().includes('website') || t.toLowerCase().includes('business')
      );

      if (isWebsite) {
        // For websites: Use free SEO tools (like Ubersuggest, SimilarWeb free tier, etc.)
        // In production, you'd call these APIs
        await loadWebsiteAnalytics(scanData, competitors);
      } else {
        // For social accounts: Use free social analytics APIs
        await loadSocialAnalytics(scanData, competitors);
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setAnalytics({ 
        isLoading: false, 
        error: 'Failed to load analytics data. Please try again.' 
      });
    }
  };

  const loadWebsiteAnalytics = async (scanData: any, competitors: any[]) => {
    // Use free SEO APIs like:
    // - Ubersuggest API (free tier)
    // - SimilarWeb API (free tier)
    // - Ahrefs API (if available)
    // For now, use scan data as base
    
    const marketShare = scanData.marketShare || {
      percentage: 0,
      industry: scanData.brandDNA?.industry || 'Unknown',
      yourRank: 0,
      totalCreatorsInSpace: competitors.length || 0
    };

    setAnalytics({
      marketShare: marketShare.percentage || 0,
      marketShareChange: 0, // Would come from API
      rank: marketShare.yourRank || 0,
      totalCompetitors: marketShare.totalCreatorsInSpace || competitors.length,
      brandSentiment: 0, // Would come from sentiment analysis API
      sentimentChange: 0,
      competitorMentions: 0, // Would come from mention tracking
      mentionsChange: 0,
      industry: marketShare.industry,
      isLoading: false
    });

    setCompetitorData(competitors.slice(0, 5).map((c: any, i: number) => ({
      name: c.name || `Competitor ${i + 1}`,
      growth: '+0%', // Would come from API
      share: '0%', // Would come from API
      status: c.threatLevel === 'HIGH' ? 'Leader' : c.threatLevel === 'MEDIUM' ? 'Rising' : 'Stable',
      statusColor: c.threatLevel === 'HIGH' ? 'bg-green-500/20 text-green-400' : 
                   c.threatLevel === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 
                   'bg-white/10 text-white/60'
    })));
  };

  const loadSocialAnalytics = async (scanData: any, competitors: any[]) => {
    // For social accounts, use free APIs like:
    // - Social Blade API (free tier)
    // - Brandwatch API (if available)
    // - Custom scraping with rate limits
    
    const marketShare = scanData.marketShare || {
      percentage: 0,
      industry: 'Social Media',
      yourRank: 0,
      totalCreatorsInSpace: competitors.length || 0
    };

    setAnalytics({
      marketShare: marketShare.percentage || 0,
      marketShareChange: 0,
      rank: marketShare.yourRank || 0,
      totalCompetitors: marketShare.totalCreatorsInSpace || competitors.length,
      brandSentiment: 0,
      sentimentChange: 0,
      competitorMentions: 0,
      mentionsChange: 0,
      industry: marketShare.industry || 'Social Media',
      isLoading: false
    });

    setCompetitorData(competitors.slice(0, 5).map((c: any, i: number) => ({
      name: c.name || `Competitor ${i + 1}`,
      growth: '+0%',
      share: '0%',
      status: c.threatLevel === 'HIGH' ? 'Leader' : c.threatLevel === 'MEDIUM' ? 'Rising' : 'Stable',
      statusColor: c.threatLevel === 'HIGH' ? 'bg-green-500/20 text-green-400' : 
                   c.threatLevel === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 
                   'bg-white/10 text-white/60'
    })));
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm text-white/40 mb-1">Dashboards / Market Overview</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Market Overview</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg">
            <span className="text-xs text-white/60">{dateRange}</span>
            <span className="text-xs text-white/40">•</span>
            <span className="text-xs text-white">Oct 14 - Nov 14</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-white/60" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {analytics.isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {analytics.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-bold text-red-400 mb-1">Unable to load analytics</p>
              <p className="text-xs text-white/60">{analytics.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Metrics */}
      {!analytics.isLoading && !analytics.error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Market Share */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Total Market Share</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {analytics.marketShare !== undefined ? `${analytics.marketShare}%` : 'N/A'}
              </span>
              {analytics.marketShareChange !== undefined && analytics.marketShareChange !== 0 && (
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  analytics.marketShareChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {analytics.marketShareChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {analytics.marketShareChange > 0 ? '+' : ''}{analytics.marketShareChange}%
                </span>
              )}
            </div>
            {analytics.marketShare !== undefined && (
              <>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${Math.min(analytics.marketShare, 100)}%` }}></div>
                </div>
                <div className="text-xs text-white/60">
                  {analytics.rank ? `Ranked #${analytics.rank}` : 'Initializing'} {analytics.totalCompetitors ? `of ${analytics.totalCompetitors}` : ''} in {analytics.industry || 'Industry'}
                </div>
              </>
            )}
            {analytics.marketShare === undefined && (
              <div className="text-xs text-white/40">Run a scan to see market share data</div>
            )}
          </div>

          {/* Brand Sentiment */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Brand Sentiment</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {analytics.brandSentiment !== undefined ? analytics.brandSentiment.toFixed(1) : 'N/A'}
              </span>
              {analytics.sentimentChange !== undefined && analytics.sentimentChange !== 0 && (
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  analytics.sentimentChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {analytics.sentimentChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {analytics.sentimentChange > 0 ? '+' : ''}{analytics.sentimentChange}%
                </span>
              )}
            </div>
            {analytics.brandSentiment !== undefined ? (
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${
                      i <= Math.round((analytics.brandSentiment || 0) / 20) ? 'bg-green-500' : 'bg-white/10'
                    }`}
                  ></div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-white/40">Initializing sentiment analysis</div>
            )}
          </div>

          {/* Competitor Mentions */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Competitor Mentions</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {analytics.competitorMentions !== undefined ? analytics.competitorMentions.toLocaleString() : 'N/A'}
              </span>
              {analytics.mentionsChange !== undefined && analytics.mentionsChange !== 0 && (
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  analytics.mentionsChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {analytics.mentionsChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {analytics.mentionsChange > 0 ? '+' : ''}{analytics.mentionsChange}%
                </span>
              )}
            </div>
            {competitorData.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {competitorData.slice(0, 3).map((comp, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white border-2 border-[#0A0A0A]"
                      title={comp.name}
                    >
                      {comp.name[0]}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analytics.competitorMentions === undefined && (
              <div className="text-xs text-white/40">Initializing mention tracking</div>
            )}
          </div>
        </div>
      )}

      {/* Competitor Insights Chart */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Competitor Insights</h3>
            <p className="text-sm text-white/40">Traffic growth comparison vs Top 3 Competitors</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[400px] bg-[#050505] rounded-lg border border-white/5 p-6 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-white/40 font-mono py-6">
            <span>100k</span>
            <span>75k</span>
            <span>50k</span>
            <span>25k</span>
            <span>0</span>
          </div>

          {/* Chart content */}
          <div className="ml-12 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-white/5"></div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute top-0 right-0 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-purple-500"></div>
                <span className="text-white/60">Your Company</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-white/30"></div>
                <span className="text-white/60">Acme Corp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-white/20 border-dashed border-t"></div>
                <span className="text-white/60">Globex Inc</span>
              </div>
            </div>

            {/* Placeholder for chart - would use a charting library in production */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20 text-sm">Chart visualization would appear here</div>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="ml-12 mt-4 flex justify-between text-xs text-white/40 font-mono">
            <span>Oct 14</span>
            <span>Oct 21</span>
            <span>Oct 28</span>
            <span>Nov 4</span>
            <span>Nov 11</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Positioning */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Market Positioning</h3>
          <div className="space-y-3">
            {competitorData.length > 0 ? competitorData.map((company, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#050505] rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                    {company.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{company.name}</div>
                    <div className="text-xs text-white/40">Growth: {company.growth} • Share: {company.share}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${company.statusColor}`}>
                  {company.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-white/40 text-sm">
                No competitor data available. Run a scan to see market positioning.
              </div>
            )}
          </div>
        </div>

        {/* Feature Gap Analysis */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Feature Gap Analysis</h3>
            <span className="text-xs text-white/40">Q4 2023</span>
          </div>
          <div className="space-y-4">
            {[
              { feature: 'API Performance', us: 98, avg: 80, status: 'Superior', statusColor: 'text-green-400' },
              { feature: 'User Retention', us: 85, avg: 84, status: 'Parity', statusColor: 'text-orange-400' },
              { feature: 'Mobile Experience', us: 62, avg: 78, status: 'Lagging', statusColor: 'text-red-400' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{item.feature}</span>
                  <span className={`text-xs font-bold ${item.statusColor}`}>{item.status}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{item.us}/100 (Us)</span>
                    <span className="text-white/40">{item.avg}/100 (Avg)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${item.us}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;

