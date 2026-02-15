
import React, { useEffect, useState } from 'react';
import { PROCESS_STEPS } from '../constants';

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute('data-step') || '1', 10);
            setActiveStep(step);
          }
        });
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    );

    const steps = document.querySelectorAll('.process-step');
    steps.forEach((step) => observer.observe(step));

    return () => {
      steps.forEach((step) => observer.unobserve(step));
    };
  }, []);

  return (
    <section className="relative bg-zinc-950 border-b border-zinc-900/50" id="process">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Sticky Image Wrapper */}
          <div className="hidden lg:block relative h-full min-h-screen border-r border-zinc-900/50">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center p-12 lg:p-16">
              <div className="relative w-full h-[85vh] max-h-[800px] flex items-start">
                
                {/* Dynamic Image Container */}
                <div className="relative w-3/4 h-full overflow-hidden rounded-2xl">
                  {PROCESS_STEPS.map((step) => (
                    <img
                      key={step.id}
                      src={step.image}
                      className={`process-img w-full h-full object-cover grayscale opacity-90 ${activeStep === step.id ? 'active' : 'inactive'}`}
                      alt={step.title}
                    />
                  ))}
                </div>

                {/* Large Sticky Number */}
                <div className="absolute -right-4 top-8 z-20">
                  <span className="font-instrument-serif text-7xl lg:text-8xl text-zinc-100/90 tracking-tight transition-all duration-500">
                    {String(activeStep).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scrolling Text */}
          <div className="md:px-12 md:py-32 flex flex-col lg:gap-64 pt-24 pr-6 pb-24 pl-6 relative gap-x-32 gap-y-32">
            
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm rounded-full px-3 py-1 mb-6 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Process
              </div>
              <h2 className="text-4xl md:text-5xl font-instrument-serif text-white tracking-tight">How It Works</h2>
            </div>

            {PROCESS_STEPS.map((step) => (
              <div key={step.id} className="process-step group flex flex-col justify-center min-h-[40vh]" data-step={step.id}>
                <span className="lg:hidden text-6xl font-instrument-serif text-zinc-700 mb-6 block">
                  {String(step.id).padStart(2, '0')}
                </span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-instrument-serif text-zinc-100 tracking-tight mb-8 group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-lg mb-10">
                  {step.description}
                </p>
                <a href="#contact" className="text-sm uppercase tracking-widest font-medium text-white border-b border-zinc-600 pb-1 w-fit hover:border-white hover:text-emerald-400 transition-all">
                  {step.action}
                </a>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
