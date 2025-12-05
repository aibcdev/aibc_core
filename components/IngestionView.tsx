import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ScanLine, Search, X } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { scanBrandFootprint } from '../services/footprintScanner';

interface IngestionProps extends NavProps {
  setUsername: (username: string) => void;
}

interface AutocompleteSuggestion {
  name: string;
  handle: string;
  type: 'person' | 'company' | 'website';
  verified?: boolean;
}

const IngestionView: React.FC<IngestionProps> = ({ onNavigate, setUsername }) => {
  const [inputVal, setInputVal] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleNext = async () => {
    if (!inputVal.trim()) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      // Start the digital footprint scan
      const username = inputVal.trim().replace('@', ''); // Remove @ if present
      setUsername(username);
      
      // Store in localStorage for persistence
      localStorage.setItem('lastScannedUsername', username);
      
      // Navigate to audit view - scan will start there
      onNavigate(ViewState.AUDIT);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
      setIsScanning(false);
    }
  };

  // Autocomplete suggestions
  useEffect(() => {
    if (inputVal.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Simulate autocomplete - in production, this would call an API
    const fetchSuggestions = async () => {
      try {
        // Call backend to get suggestions
        const response = await fetch(`http://localhost:3001/api/verify-handle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            handle: inputVal.trim().replace('@', ''), 
            platform: 'all',
            search: true 
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.suggestions) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }

      // Fallback: Generate suggestions based on input
      const mockSuggestions: AutocompleteSuggestion[] = [
        {
          name: inputVal.charAt(0).toUpperCase() + inputVal.slice(1),
          handle: inputVal.replace('@', ''),
          type: inputVal.includes('.') ? 'website' : 'person',
          verified: false
        }
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [inputVal]);

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    setInputVal(suggestion.handle);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleNext();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div id="ingestion-view" className="fixed inset-0 z-[70] overflow-y-auto animate-in fade-in duration-300 bg-black">
      {/* Subtle Orange Glow Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.15) 0%, rgba(234, 88, 12, 0.08) 40%, transparent 70%)'
        }}
      ></div>
      <div className="absolute inset-0 bg-[#050505] opacity-80"></div>
      
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Top Nav */}
        <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-6 z-20">
          <div className="px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[10px] font-mono text-white tracking-widest">
            STEP 02 / 04
          </div>
          
          <button 
            onClick={() => onNavigate(ViewState.LOGIN)} 
            className="group flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/80 hover:text-white transition-colors uppercase backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Return
          </button>
        </div>

        {/* Content Center */}
        <div className="w-full max-w-2xl flex flex-col items-center mt-12 relative z-10">
            
            {/* Headers */}
            <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-white mb-2 text-center uppercase leading-none">
                DIGITAL FOOTPRINT
            </h1>
            <h2 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-10 text-center uppercase leading-none" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                INGESTION
            </h2>

            {/* Description */}
            <p className="font-mono text-xs md:text-sm text-white/60 text-center max-w-lg leading-relaxed mb-16">
                Enter primary domain or handle. Our Agentic System will sweep 10 years of public data to reconstruct your brand DNA.
            </p>

            {/* Input Group */}
            <div className="w-full max-w-lg space-y-8">
                <div className="relative group">
                    {/* Subtle Orange Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-red-600/30 rounded-xl opacity-40 blur group-hover:opacity-70 transition duration-500"></div>
                    
                    <div className="relative bg-[#0A0A0A]/90 backdrop-blur-sm rounded-xl border border-white/10 flex items-center h-20 px-4 transition-colors focus-within:border-orange-500/30 shadow-2xl">
                         <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Type in an X username, or a website" 
                            className="w-full bg-transparent text-center font-mono text-lg text-white placeholder:text-white/30 focus:outline-none tracking-wider caret-orange-500 z-10"
                            value={inputVal}
                            onChange={(e) => {
                              setInputVal(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                              if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            onBlur={() => {
                              // Delay to allow click on suggestions
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                         />
                         
                         {/* Enter Badge */}
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                            <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 px-2 py-1 rounded pointer-events-none">ENTER</span>
                         </div>
                    </div>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                      >
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 ${
                              selectedIndex === index ? 'bg-white/10' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white flex items-center gap-2">
                                {suggestion.name}
                                {suggestion.verified && (
                                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">✓</span>
                                )}
                              </div>
                              <div className="text-xs text-white/50 mt-0.5">
                                @{suggestion.handle} • {suggestion.type === 'website' ? 'Website' : suggestion.type === 'company' ? 'Company' : 'Person'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-400 text-xs text-center font-mono">
                    {error}
                  </div>
                )}

                {/* Action Button */}
                <button 
                  onClick={handleNext} 
                  className="w-full h-14 bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-500 hover:to-red-600 disabled:from-white/10 disabled:to-white/5 disabled:cursor-not-allowed text-white font-bold tracking-[0.2em] text-xs uppercase rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-500/20 disabled:shadow-none border border-white/10"
                  disabled={!inputVal.trim() || isScanning}
                >
                    {isScanning ? (
                      <>
                        <span className="animate-spin">⏳</span> Scanning...
                      </>
                    ) : (
                      <>
                        Scan Digital Footprint <ScanLine className="w-4 h-4" />
                      </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IngestionView;