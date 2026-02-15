
import React, { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AGENTS } from '../constants';

const AgentMarquee: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Clone items for infinite effect
  const displayAgents = [...AGENTS, ...AGENTS, ...AGENTS];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll-fast
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <section id="agents" className="overflow-hidden z-10 bg-zinc-950 border-zinc-900/50 border-b pt-24 pb-24 relative">
      <div className="px-6 md:px-12 mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <h2 className="text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight font-instrument-serif text-white">
            Marketing Is No Longer About Tools. <br />
            <span className="text-zinc-600">It’s About Agents.</span>
          </h2>
          <div className="lg:pl-12">
            <p className="text-lg md:text-xl font-light text-zinc-400 leading-relaxed">
              Most marketing platforms give you dashboards, prompts, or isolated features.
              AIBC Media gives you deployable AI agents — each trained on your brand, your competitors, and your market.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-zinc-500 font-mono text-sm">
              <span>// Defined Role</span>
              <span>// Distinct Personality</span>
              <span>// Improving Knowledge</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`flex w-full overflow-x-auto no-scrollbar select-none touch-pan-y ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
      >
        <div className="flex gap-6 md:gap-8 px-4 md:px-8 items-stretch min-w-max">
          {displayAgents.map((agent, index) => (
            <div
              key={`${agent.id}-${index}`}
              className="group relative w-[85vw] md:w-[500px] h-[600px] rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 transition-colors duration-500 shrink-0"
            >
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={agent.image}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
                  draggable="false"
                  alt={agent.title}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950"></div>
              </div>
              <div className="md:p-10 flex flex-col pt-8 pr-8 pb-8 pl-8 absolute top-0 right-0 bottom-0 left-0 justify-between">
                <div className="flex justify-between items-start">
                  <span className="font-instrument-serif text-5xl md:text-6xl text-white/90">
                    {String(agent.id).padStart(2, '0')}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/20">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="md:text-4xl group-hover:translate-y-0 transition-transform duration-500 text-3xl text-white tracking-tight font-instrument-serif mb-3 translate-y-2">
                    {agent.title} Agent
                  </h3>
                  <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
                    <p className="text-zinc-300 text-sm leading-relaxed max-w-[90%] pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentMarquee;
