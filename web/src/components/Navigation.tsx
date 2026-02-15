
import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
      <a href="#" className="group flex items-center gap-1 text-2xl md:text-3xl tracking-tight font-normal pointer-events-auto font-instrument-serif">
        <span className="border-b border-white pb-0.5 group-hover:border-transparent transition-colors duration-300">aibc</span>
        <span>media</span>
      </a>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 lg:gap-12 pointer-events-auto">
        <a href="#platform" className="text-sm font-medium uppercase tracking-wide hover:text-zinc-300 transition-colors">Platform</a>
        <a href="#solutions" className="text-sm font-medium uppercase tracking-wide hover:text-zinc-300 transition-colors">Solutions</a>
        <a href="#pricing" className="text-sm font-medium uppercase tracking-wide hover:text-zinc-300 transition-colors">Pricing</a>
        <a href="#blog" className="text-sm font-medium uppercase tracking-wide hover:text-zinc-300 transition-colors">Blog</a>
        <a href="#deploy" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-300 text-sm font-medium uppercase tracking-wide backdrop-blur-sm">
          Get Started
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
