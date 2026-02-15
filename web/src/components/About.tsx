
import React from 'react';

const About: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-zinc-950 border-b border-zinc-900/50" id="about">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 border border-zinc-800 bg-zinc-900/50 rounded-full px-3 py-1 mb-10 tracking-wider uppercase">
            Mission
        </div>
        <h2 className="text-5xl md:text-7xl font-instrument-serif text-white tracking-tight mb-12 leading-[0.95]">
          Why AIBC Media Exists
        </h2>
        <div className="space-y-12 text-xl md:text-2xl font-light text-zinc-400 leading-relaxed max-w-4xl mx-auto">
          <p>
            Modern marketing is fragmented — too many tools, too little execution.
          </p>
          <p>
            AIBC Media was built to consolidate strategy, creativity, intelligence, and delivery into a single system powered by AI agents that work continuously and improve over time.
          </p>
          <div className="pt-8">
            <p className="text-white text-3xl md:text-5xl font-instrument-serif italic">
              The future of marketing isn’t automation. <br />
              <span className="text-emerald-500 not-italic font-normal font-sans tracking-tight text-2xl md:text-4xl mt-4 block">It’s delegation.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
