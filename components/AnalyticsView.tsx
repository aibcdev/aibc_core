import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Bell, Download, Filter } from 'lucide-react';

const AnalyticsView: React.FC = () => {
  const [dateRange] = useState('Last 30 Days');

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

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Market Share */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Total Market Share</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-white">32.8%</span>
            <span className="text-sm font-bold text-green-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +2.4%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '32.8%' }}></div>
          </div>
          <div className="text-xs text-white/60">Ranked #2 in Industry</div>
        </div>

        {/* Brand Sentiment */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Brand Sentiment</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-white">84.2</span>
            <span className="text-sm font-bold text-green-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +1.1%
            </span>
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i === 5 ? 'bg-green-500' : 'bg-white/10'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Competitor Mentions */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Competitor Mentions</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-white">12.4k</span>
            <span className="text-sm font-bold text-green-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((letter, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white border-2 border-[#0A0A0A]"
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/60">Spike detected in Region EU-West</div>
        </div>
      </div>

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
            {[
              { name: 'Your Company', growth: '+12%', share: '32.8%', status: 'Leader', statusColor: 'bg-green-500/20 text-green-400' },
              { name: 'Acme Corp', growth: '-2%', share: '28.4%', status: 'Stable', statusColor: 'bg-white/10 text-white/60' },
              { name: 'Globex Inc', growth: '+4%', share: '15.2%', status: 'Rising', statusColor: 'bg-orange-500/20 text-orange-400' },
              { name: 'Soylent Corp', growth: '0%', share: '10.1%', status: 'Stable', statusColor: 'bg-white/10 text-white/60' },
            ].map((company, i) => (
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
            ))}
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

