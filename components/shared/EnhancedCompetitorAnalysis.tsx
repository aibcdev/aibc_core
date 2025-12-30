import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, Download, Filter } from 'lucide-react';
import { generateText } from '../../services/apiClient';

interface CompetitorData {
  name: string;
  growth: number;
  share: number;
  status: 'Leader' | 'Stable' | 'Rising' | 'Declining';
  traffic?: number;
}

interface FeatureGap {
  feature: string;
  us: number;
  avg: number;
  status: 'Superior' | 'Parity' | 'Lagging';
}

interface EnhancedCompetitorAnalysisProps {
  competitorIntelligence: any[];
  brandDNA?: any;
  marketShare?: any;
  userName?: string;
}

const EnhancedCompetitorAnalysis: React.FC<EnhancedCompetitorAnalysisProps> = ({
  competitorIntelligence,
  brandDNA,
  marketShare,
  userName = 'Your Company',
}) => {
  const [summaryTips, setSummaryTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [dateRangeText, setDateRangeText] = useState('Oct 14 - Nov 14');

  // Calculate market positioning data - only use real data, show N/A if not available
  const calculateMarketPositioning = (): CompetitorData[] => {
    // Only show data if we have real competitor intelligence
    if (!competitorIntelligence || competitorIntelligence.length === 0) {
      return [];
    }

    const competitors: CompetitorData[] = [];

    // Only add user company if we have market share data
    if (marketShare && typeof marketShare.yourShare === 'number') {
      competitors.push({
        name: userName,
        growth: typeof marketShare.growth === 'number' ? marketShare.growth : 0,
        share: marketShare.yourShare,
        status: marketShare.yourShare > 30 ? 'Leader' : marketShare.yourShare > 15 ? 'Rising' : 'Stable',
        traffic: typeof marketShare.yourTraffic === 'number' ? marketShare.yourTraffic : undefined,
      });
    }

    // Add competitor data from intelligence - only if we have real data
    competitorIntelligence.slice(0, 3).forEach((comp: any) => {
      if (comp && comp.name) {
        competitors.push({
          name: comp.name || comp.companyName || 'Unknown',
          growth: typeof comp.growth === 'number' ? comp.growth : 0,
          share: typeof comp.marketShare === 'number' ? comp.marketShare : 0,
          status: (comp.status || 'Stable') as CompetitorData['status'],
          traffic: typeof comp.traffic === 'number' ? comp.traffic : undefined,
        });
      }
    });

    return competitors.length > 0 ? competitors.sort((a, b) => b.share - a.share) : [];
  };

  // Calculate feature gap analysis - return empty if no real data
  const calculateFeatureGaps = (): FeatureGap[] => {
    // Only return real feature gap data if available from competitor intelligence
    if (!competitorIntelligence || competitorIntelligence.length === 0) {
      return [];
    }

    // Extract real feature gaps from competitor intelligence if available
    const gaps: FeatureGap[] = [];
    
    // Check if any competitor has feature gap data
    competitorIntelligence.forEach((comp: any) => {
      if (comp.featureGaps && Array.isArray(comp.featureGaps)) {
        comp.featureGaps.forEach((gap: any) => {
          if (gap.feature && typeof gap.us === 'number' && typeof gap.avg === 'number') {
            gaps.push({
              feature: gap.feature,
              us: gap.us,
              avg: gap.avg,
              status: gap.us > gap.avg ? 'Superior' : gap.us === gap.avg ? 'Parity' : 'Lagging',
            });
          }
        });
      }
    });

    return gaps;
  };

  // Generate LLM summary tips
  useEffect(() => {
    const generateSummaryTips = async () => {
      if (!competitorIntelligence || competitorIntelligence.length === 0) return;
      
      setLoadingTips(true);
      try {
        const competitorsSummary = competitorIntelligence.slice(0, 3).map((c: any, i: number) => 
          `${i + 1}. ${c.name || c.companyName || `Competitor ${i + 1}`}: ${c.theirAdvantage || 'Analyzing...'}`
        ).join('\n');

        const prompt = `You are a competitive intelligence analyst. Based on the following competitor analysis, provide 3-5 concise, actionable strategic tips for ${userName}.

Competitor Analysis:
${competitorsSummary}

Brand DNA Context:
${brandDNA ? JSON.stringify(brandDNA, null, 2) : 'Not available'}

Market Position: ${marketShare?.position || 'Unknown'} of ${marketShare?.total || 'Unknown'}

Provide 3-5 specific, actionable tips that:
1. Address competitive weaknesses
2. Leverage competitive advantages
3. Are specific to this company's brand voice and market position
4. Include concrete next steps

Format as a JSON array of strings:
["Tip 1", "Tip 2", "Tip 3"]

Return ONLY the JSON array, no other text.`;

        // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        const response = await fetch(`${API_BASE_URL}/api/competitor-tips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            competitorIntelligence,
            brandDNA,
            marketShare,
            userName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const tips = data.tips || [];
          setSummaryTips(tips);
        } else {
          // Fallback tips
          setSummaryTips([
            `Focus on mobile experience optimization - you're ${calculateFeatureGaps().find(f => f.feature === 'Mobile Experience')?.avg - (calculateFeatureGaps().find(f => f.feature === 'Mobile Experience')?.us || 0)} points below average`,
            `Leverage your API performance advantage (${calculateFeatureGaps().find(f => f.feature === 'API Performance')?.us}/100) in marketing messaging`,
            `Maintain user retention parity while improving mobile experience to gain competitive edge`,
          ]);
        }
      } catch (error) {
        console.error('Error generating summary tips:', error);
        // Fallback tips
        setSummaryTips([
          'Focus on mobile experience optimization to close the gap with competitors',
          'Leverage your superior API performance in marketing messaging',
          'Maintain user retention while improving mobile experience',
        ]);
      } finally {
        setLoadingTips(false);
      }
    };

    generateSummaryTips();
  }, [competitorIntelligence, brandDNA, marketShare, userName]);

  const marketPositioning = calculateMarketPositioning();
  const featureGaps = calculateFeatureGaps();
  const totalMarketShare = marketPositioning.length > 0 
    ? marketPositioning.reduce((sum, c) => sum + c.share, 0) 
    : null;
  
  // Only use real data, show N/A if not available
  const brandSentiment = marketShare && typeof marketShare.sentiment === 'number' 
    ? marketShare.sentiment 
    : null;
  const competitorMentions = marketShare && typeof marketShare.mentions === 'number'
    ? marketShare.mentions
    : null;

  // Traffic growth data for chart - only use real data if available
  const hasTrafficData = marketShare && marketShare.trafficHistory && Array.isArray(marketShare.trafficHistory) && marketShare.trafficHistory.length > 0;
  const trafficData = hasTrafficData 
    ? marketShare.trafficHistory.map((point: any, idx: number) => ({
        date: point.date || `Week ${idx + 1}`,
        yourCompany: typeof point.yourCompany === 'number' ? point.yourCompany : 0,
        acme: typeof point.competitor1 === 'number' ? point.competitor1 : 0,
        globex: typeof point.competitor2 === 'number' ? point.competitor2 : 0,
      }))
    : [];

  const getStatusBadge = (status: CompetitorData['status']) => {
    const styles = {
      Leader: 'bg-green-500/20 text-green-400 border-green-500/30',
      Rising: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Stable: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      Declining: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getFeatureStatusColor = (status: FeatureGap['status']) => {
    const colors = {
      Superior: 'text-green-400',
      Parity: 'text-orange-400',
      Lagging: 'text-red-400',
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Market Overview</h2>
          <p className="text-sm text-white/40">Dashboards / Market Overview</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              // Update date range text based on selection
              const now = new Date();
              const daysAgo = e.target.value === 'Last 30 Days' ? 30 : 7;
              const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
              setDateRangeText(`${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
            }}
            className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
          </select>
          <span className="text-sm text-white/60">{dateRangeText}</span>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Total Market Share</p>
            {totalMarketShare !== null && (
              <span className="text-xs text-green-400 font-bold">
                {marketShare?.growth && typeof marketShare.growth === 'number' 
                  ? `${marketShare.growth > 0 ? '+' : ''}${marketShare.growth.toFixed(1)}%`
                  : ''}
              </span>
            )}
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {totalMarketShare !== null ? `${totalMarketShare.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-xs text-white/60 mb-3">
            {marketShare?.position && typeof marketShare.position === 'number'
              ? `Ranked #${marketShare.position} in Industry`
              : 'N/A'}
          </p>
          {totalMarketShare !== null && (
            <div className="w-full bg-white/5 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totalMarketShare / 100) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Brand Sentiment</p>
            {brandSentiment !== null && (
              <span className="text-xs text-green-400 font-bold">
                {marketShare?.sentimentChange && typeof marketShare.sentimentChange === 'number'
                  ? `${marketShare.sentimentChange > 0 ? '+' : ''}${marketShare.sentimentChange.toFixed(1)}%`
                  : ''}
              </span>
            )}
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {brandSentiment !== null ? brandSentiment.toFixed(1) : 'N/A'}
          </div>
          {brandSentiment !== null && (
            <div className="flex gap-1 mt-3">
              {[...Array(5)].map((_, i) => {
                const filled = Math.floor((brandSentiment / 100) * 5);
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${
                      i < filled ? 'bg-green-500' : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Competitor Mentions</p>
            {competitorMentions !== null && (
              <span className="text-xs text-red-400 font-bold">
                {marketShare?.mentionsChange && typeof marketShare.mentionsChange === 'number'
                  ? `${marketShare.mentionsChange > 0 ? '+' : ''}${marketShare.mentionsChange}%`
                  : ''}
              </span>
            )}
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {competitorMentions !== null 
              ? competitorMentions >= 1000 
                ? `${(competitorMentions / 1000).toFixed(1)}k`
                : competitorMentions.toString()
              : 'N/A'}
          </div>
          {competitorMentions !== null && competitorIntelligence && competitorIntelligence.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {competitorIntelligence.slice(0, 3).map((comp: any, i: number) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-[#0A0A0A] flex items-center justify-center text-xs font-bold text-blue-400"
                  >
                    {(comp.name || comp.companyName || '?')[0].toUpperCase()}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/60">Top competitors tracked</p>
            </div>
          )}
        </div>
      </div>

      {/* Competitor Insights Chart */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Competitor Insights</h3>
            <p className="text-sm text-white/60">Traffic growth comparison vs Top 3 Competitors</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Chart Area - Only show if we have real data */}
        {trafficData.length > 0 ? (
        <div className="h-64 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-white/40 pr-2">
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-white/5" />
              ))}
            </div>

            {/* Data lines - stacked area chart */}
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
              {trafficData.map((point, i) => {
                const totalHeight = point.yourCompany + point.acme + point.globex;
                const yourCompanyPercent = (point.yourCompany / 100) * 100;
                const acmePercent = (point.acme / 100) * 100;
                const globexPercent = (point.globex / 100) * 100;
                const acmeOffset = yourCompanyPercent;
                const globexOffset = yourCompanyPercent + acmePercent;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative">
                    <div className="w-full relative" style={{ height: '100%' }}>
                      {/* Your Company (bottom layer - vibrant blue) */}
                      <div
                        className="absolute bottom-0 w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${yourCompanyPercent}%`,
                          zIndex: 1
                        }}
                      />
                      {/* Acme Corp (middle layer - medium grey) */}
                      <div
                        className="absolute bottom-0 w-full bg-white/20 rounded-t"
                        style={{ 
                          height: `${acmePercent}%`,
                          bottom: `${yourCompanyPercent}%`,
                          zIndex: 2
                        }}
                      />
                      {/* Globex Inc (top layer - very dark grey) */}
                      <div
                        className="absolute bottom-0 w-full bg-white/10 rounded-t border-t border-dashed border-white/20"
                        style={{ 
                          height: `${globexPercent}%`,
                          bottom: `${acmeOffset}%`,
                          zIndex: 3
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/40 mt-2">{point.date}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute top-0 right-0 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-white/60">{userName}</span>
              </div>
              {marketPositioning.slice(1, 3).map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${
                    idx === 0 ? 'bg-white/20' : 'bg-white/10 border border-dashed border-white/20'
                  }`} />
                  <span className="text-white/60">{comp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-white/60">N/A - Traffic data not available</p>
          </div>
        )}
      </div>

      {/* Bottom Row: Market Positioning & Feature Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Positioning */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Market Positioning</h3>
          {marketPositioning.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider pb-3">Company</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider pb-3">Growth</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider pb-3">Share</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPositioning.map((company, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="py-3 text-white font-medium">{company.name}</td>
                      <td className="py-3">
                        <span className={`text-sm font-bold ${
                          company.growth > 0 ? 'text-green-400' : 
                          company.growth < 0 ? 'text-red-400' : 
                          'text-white/60'
                        }`}>
                          {company.growth > 0 ? '+' : ''}{company.growth}%
                        </span>
                      </td>
                      <td className="py-3 text-white">{company.share.toFixed(1)}%</td>
                      <td className="py-3">{getStatusBadge(company.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">N/A - Market positioning data not available</p>
          )}
        </div>

        {/* Feature Gap Analysis */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Feature Gap Analysis</h3>
            <span className="text-xs text-white/40">
              {new Date().getFullYear()} Q{Math.floor((new Date().getMonth() + 3) / 3)}
            </span>
          </div>
          {featureGaps.length > 0 ? (
            <div className="space-y-6">
              {featureGaps.map((feature, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{feature.feature}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/60">
                        Us: <span className="text-white font-bold">{feature.us}{feature.feature === 'User Retention' ? '%' : '/100'}</span>
                      </span>
                      <span className="text-xs text-white/60">
                        Avg: <span className="text-white font-bold">{feature.avg}{feature.feature === 'User Retention' ? '%' : '/100'}</span>
                      </span>
                      <span className={`text-xs font-bold ${getFeatureStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(feature.us, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">N/A - Feature gap analysis not available</p>
          )}
        </div>
      </div>

      {/* Summary Tips Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Strategic Summary & Recommendations
        </h3>
        {loadingTips ? (
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Generating strategic insights...</span>
          </div>
        ) : summaryTips.length > 0 ? (
          <div className="space-y-3">
            {summaryTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">{idx + 1}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed flex-1">{tip}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/60">No strategic tips available. Complete a brand scan to generate insights.</p>
        )}
      </div>
    </div>
  );
};

export default EnhancedCompetitorAnalysis;

