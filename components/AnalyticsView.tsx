import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Calendar, Tag, Users, RefreshCw, ChevronDown } from 'lucide-react';
import { getDashboardAnalytics } from '../services/analyticsClient';

interface VisibilityDataPoint {
  date: string;
  score: number;
}

interface CompetitorRanking {
  rank: number;
  brand: string;
  brandUrl?: string;
  mentions: number;
  position: number;
  change: number;
  visibility: number;
  logo?: string;
  isYou?: boolean;
}

const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [platform, setPlatform] = useState('All Platforms');
  const [topic, setTopic] = useState('All Topics');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [visibilityScore, setVisibilityScore] = useState(72.5);
  const [visibilityChange, setVisibilityChange] = useState(2.5);
  const [visibilityTrend, setVisibilityTrend] = useState<VisibilityDataPoint[]>([
    { date: 'Nov 30', score: 68.0 },
    { date: 'Dec 1', score: 69.2 },
    { date: 'Dec 2', score: 71.5 },
    { date: 'Dec 3', score: 70.8 },
    { date: 'Dec 4', score: 72.1 },
    { date: 'Dec 5', score: 71.9 },
    { date: 'Dec 6', score: 72.5 },
  ]);
  const [competitorRankings, setCompetitorRankings] = useState<CompetitorRanking[]>([
    { rank: 1, brand: 'Lottie.org', mentions: 156, position: 1.8, change: 2.5, visibility: 72.5, isYou: true },
    { rank: 2, brand: 'Birdie', mentions: 142, position: 2.1, change: -1.2, visibility: 68.3 },
    { rank: 3, brand: 'KareHero', mentions: 128, position: 2.4, change: 0.8, visibility: 62.1 },
    { rank: 4, brand: 'Mobilise', mentions: 115, position: 2.9, change: -2.3, visibility: 55.9 },
    { rank: 5, brand: 'Carehome.co.uk', mentions: 98, position: 3.2, change: 1.1, visibility: 48.7 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // Get competitors from scan results
        const scanResults = localStorage.getItem('lastScanResults');
        const scanData = scanResults ? JSON.parse(scanResults) : null;
        const competitors = (scanData?.competitorIntelligence || []).map((c: any) => c.name || c.domain).filter(Boolean);
        
        const result = await getDashboardAnalytics(competitors, scanData?.brandDNA);
        if (result.success && result.data) {
          setAnalyticsData(result.data);
          
          // Update visibility score if available
          if (result.data.visibilityScore) {
            setVisibilityScore(result.data.visibilityScore.value || 72.5);
            setVisibilityChange(result.data.visibilityScore.change || 2.5);
            if (result.data.visibilityScore.trend) {
              setVisibilityTrend(result.data.visibilityScore.trend);
            }
          }
          
          // Update competitor rankings if available
          if (result.data.competitorRankings) {
            setCompetitorRankings(result.data.competitorRankings);
          }
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Generate dates for last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  // Calculate graph points for visibility trend
  const calculateGraphPoints = (data: VisibilityDataPoint[]) => {
    const maxScore = 100;
    const minScore = 0;
    const height = 200;
    
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((point.score - minScore) / (maxScore - minScore)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getBrandInitials = (brand: string) => {
    return brand
      .split(/[.\s]+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full min-h-full bg-[#050505] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-black hover:bg-gray-100 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>{dateRange}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-black hover:bg-gray-100 transition-colors">
              <Eye className="w-4 h-4" />
              <span>{platform}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-black hover:bg-gray-100 transition-colors">
              <Tag className="w-4 h-4" />
              <span>{topic}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-black hover:bg-gray-100 transition-colors">
              <Users className="w-4 h-4" />
              <span>Competitors</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: AI Visibility Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black mb-1">AI Visibility Score</h2>
              <p className="text-sm text-gray-600">Trend over the last 7 days</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-black">
                  {loading ? '...' : visibilityScore.toFixed(1)}%
                </span>
                <span className={`text-sm font-medium ${visibilityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {visibilityChange >= 0 ? '+' : ''}{visibilityChange.toFixed(1)}% vs yesterday
                </span>
              </div>
            </div>

            {/* Trend Graph */}
            <div className="h-[200px] relative">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />
                
                {/* Trend line */}
                <path
                  d={calculateGraphPoints(visibilityTrend)}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Area fill */}
                <defs>
                  <linearGradient id="visibilityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d={`${calculateGraphPoints(visibilityTrend)} L 100 100 L 0 100 Z`}
                  fill="url(#visibilityGradient)"
                />
              </svg>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                {visibilityTrend.map((point, index) => (
                  <span key={index}>{point.date}</span>
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-2">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Industry Ranking */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black mb-1">Industry Ranking</h2>
              <p className="text-sm text-gray-600">Brands with highest visibility</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-black">
                  {loading ? '...' : visibilityScore.toFixed(1)}%
                </span>
                <span className={`text-sm font-medium ${visibilityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {visibilityChange >= 0 ? '+' : ''}{visibilityChange.toFixed(1)}% vs yesterday
                </span>
              </div>
            </div>

            {/* Rankings Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">#</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">BRAND</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600">MENTIONS</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600">POSITION</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600">CHANGE</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600">VISIBILITY</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorRankings.map((competitor) => (
                    <tr key={competitor.rank} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-sm text-gray-600">{competitor.rank}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                            competitor.isYou 
                              ? 'bg-pink-500' 
                              : 'bg-blue-500'
                          }`}>
                            {getBrandInitials(competitor.brand)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-black">
                              {competitor.brand}
                              {competitor.isYou && (
                                <span className="ml-2 text-xs text-gray-500">(YOU)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-sm text-gray-900">{competitor.mentions.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-sm text-gray-900">{competitor.position.toFixed(1)}</td>
                      <td className={`py-3 px-2 text-right text-sm font-medium ${
                        competitor.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {competitor.change >= 0 ? '+' : ''}{competitor.change.toFixed(1)}%
                      </td>
                      <td className="py-3 px-2 text-right text-sm font-semibold text-gray-900">
                        {competitor.visibility.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
