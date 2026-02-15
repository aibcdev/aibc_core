
import React from 'react';
import { ArrowDownRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <header className="relative w-full h-screen overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        poster="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/16b5c7c1-f196-4707-b5d8-9ba5ecac10bc_1600w.jpg"
      >
        <source src="https://spark-labs.org/video/reel.mp4" type="video/mp4" />
      </video>

      <div className="bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent absolute top-0 right-0 bottom-0 left-0"></div>

      <div className="absolute bottom-0 left-0 w-full px-6 py-12 md:px-12 md:py-20 flex flex-col md:flex-row justify-between items-end">
        <div className="max-w-[95rem] w-full fade-in-up">
          <h1 className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter font-instrument-serif mb-12 text-white">
            Deploy an AI Marketing Team <br />
            <span className="text-zinc-500">Trained on Your Brand</span>
          </h1>
          
          <div className="flex flex-col xl:flex-row gap-12 xl:items-end text-lg font-light text-zinc-300 w-full">
            <p className="max-w-2xl leading-relaxed text-zinc-400 text-lg md:text-xl lg:text-2xl">
              Strategy, content, competitor intelligence, and video — delivered by specialized AI agents trained specifically for your business.
            </p>
            
            <div className="flex flex-col gap-6 xl:ml-32 shrink-0 pb-3">
              <a 
                href="#deploy" 
                className="px-14 py-6 bg-white text-black rounded-full font-bold text-xl uppercase tracking-wider hover:bg-zinc-200 transition-all w-fit shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] hover:scale-105 duration-300"
              >
                Deploy Your First Agent
              </a>
              <a href="#process" className="group flex items-center gap-3 text-white border-b border-white/30 pb-1 hover:border-white transition-all w-fit text-lg ml-4 hover:ml-6 duration-300">
                <span>See How It Works</span>
                <ArrowDownRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
