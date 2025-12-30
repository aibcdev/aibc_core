import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Target, CheckCircle, AlertCircle, BarChart3, Filter, RefreshCw } from 'lucide-react';

interface Keyword {
  keyword: string;
  search_volume?: number;
  competition_score?: number;
  current_ranking?: number;
  target_url?: string;
  status: 'targeting' | 'ranking' | 'tracked';
  category?: string;
  location?: string;
}

interface KeywordStats {
  total: number;
  targeting: number;
  ranking: number;
  tracked: number;
  posts: number;
  keywordsWithPosts: number;
}

const KeywordsView: React.FC = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [stats, setStats] = useState<KeywordStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'targeting' | 'ranking' | 'tracked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeywords();
    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadKeywords();
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const loadKeywords = async () => {
    try {
      // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
      const endpoint = filter === 'all' 
        ? '/api/keywords'
        : filter === 'targeting'
        ? '/api/keywords/targeting'
        : filter === 'ranking'
        ? '/api/keywords/ranking'
        : '/api/keywords';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}?status=${filter === 'all' ? '' : filter}`);
      if (response.ok) {
        const data = await response.json();
        // Validate keywords array
        if (Array.isArray(data.keywords)) {
          setKeywords(data.keywords);
        } else {
          setKeywords([]);
        }
      } else {
        setKeywords([]);
      }
    } catch (error) {
      console.error('Error loading keywords:', error);
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
      const response = await fetch(`${API_BASE_URL}/api/keywords/stats`);
      if (response.ok) {
        const data = await response.json();
        // Validate stats object
        if (data && typeof data === 'object') {
          setStats({
            total: typeof data.total === 'number' ? data.total : 0,
            targeting: typeof data.targeting === 'number' ? data.targeting : 0,
            ranking: typeof data.ranking === 'number' ? data.ranking : 0,
            tracked: typeof data.tracked === 'number' ? data.tracked : 0,
            posts: typeof data.posts === 'number' ? data.posts : 0,
            keywordsWithPosts: typeof data.keywordsWithPosts === 'number' ? data.keywordsWithPosts : 0,
          });
        } else {
          setStats(null);
        }
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(null);
    }
  };

  const filteredKeywords = keywords.filter(k => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return k.keyword.toLowerCase().includes(query) ||
           k.category?.toLowerCase().includes(query) ||
           k.location?.toLowerCase().includes(query);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ranking':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'targeting':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'tracked':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ranking':
        return <CheckCircle className="w-4 h-4" />;
      case 'targeting':
        return <Target className="w-4 h-4" />;
      case 'tracked':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCompetitionColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Keywords We're Ranking For</h1>
          <p className="text-white/60">Track and monitor SEO keywords</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { loadKeywords(); loadStats(); }}
            className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Keywords</div>
          <div className="text-2xl font-bold text-white">
            {stats && typeof stats.total === 'number' ? stats.total : 'N/A'}
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Targeting</div>
          <div className="text-2xl font-bold text-blue-400">
            {stats && typeof stats.targeting === 'number' ? stats.targeting : 'N/A'}
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Ranking</div>
          <div className="text-2xl font-bold text-green-400">
            {stats && typeof stats.ranking === 'number' ? stats.ranking : 'N/A'}
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Tracked</div>
          <div className="text-2xl font-bold text-purple-400">
            {stats && typeof stats.tracked === 'number' ? stats.tracked : 'N/A'}
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Posts</div>
          <div className="text-2xl font-bold text-white">
            {stats && typeof stats.posts === 'number' ? stats.posts : 'N/A'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-lg p-2">
          <Filter className="w-4 h-4 text-white/60" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('targeting')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'targeting' 
                ? 'bg-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Targeting
          </button>
          <button
            onClick={() => setFilter('ranking')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'ranking' 
                ? 'bg-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Ranking
          </button>
          <button
            onClick={() => setFilter('tracked')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'tracked' 
                ? 'bg-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Tracked
          </button>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Keywords List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-white/60 mt-4">Loading keywords...</p>
        </div>
      ) : filteredKeywords.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-white/60 mx-auto mb-4" />
          <p className="text-white/60">No keywords found</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Search Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Competition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Ranking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredKeywords.map((keyword, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{keyword.keyword}</div>
                      {keyword.target_url && (
                        <a
                          href={keyword.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Post →
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(keyword.status)}`}>
                        {getStatusIcon(keyword.status)}
                        {keyword.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {keyword.search_volume && typeof keyword.search_volume === 'number' && keyword.search_volume > 0 ? (
                        <div className="flex items-center gap-1 text-white">
                          <TrendingUp className="w-4 h-4 text-white/60" />
                          ~{keyword.search_volume.toLocaleString()}/mo
                        </div>
                      ) : (
                        <span className="text-white/40">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {keyword.competition_score !== undefined && typeof keyword.competition_score === 'number' && keyword.competition_score >= 0 && keyword.competition_score <= 100 ? (
                        <span className={getCompetitionColor(keyword.competition_score)}>
                          {keyword.competition_score}/100
                        </span>
                      ) : (
                        <span className="text-white/40">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {keyword.current_ranking && typeof keyword.current_ranking === 'number' && keyword.current_ranking > 0 ? (
                        <span className="text-green-400 font-medium">#{keyword.current_ranking}</span>
                      ) : (
                        <span className="text-white/40">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {keyword.category ? (
                        <span className="text-white/80">{keyword.category}</span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-white/60 text-sm">
        Showing {filteredKeywords.length} of {keywords.length} keywords
        {filter !== 'all' && ` (filtered by ${filter})`}
      </div>
    </div>
  );
};

export default KeywordsView;



