
import React from 'react';
import { Mail, MapPin, ArrowRight } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-black relative overflow-hidden">
       {/* Decorative gradient */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none"></div>

       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative z-10">
          <div className="">
             <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 border border-zinc-800 bg-zinc-900/50 rounded-full px-3 py-1 mb-8 tracking-wider uppercase">
                Contact
             </div>
             <h2 className="text-5xl md:text-7xl font-instrument-serif text-white tracking-tight mb-6">
                Deploy Your First <br /> AI Marketing Agent
             </h2>
             <p className="text-xl text-zinc-400 font-light mb-12 max-w-md">
                Whether you’re scaling a brand, an agency, or a team — AIBC lets you deploy marketing intelligence built around your business.
             </p>
             
             <div className="space-y-6">
                <a href="mailto:hello@aibcmedia.com" className="flex items-center gap-4 text-zinc-300 hover:text-white transition-colors group">
                   <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Mail className="w-5 h-5" />
                   </div>
                   <span className="text-lg">hello@aibcmedia.com</span>
                </a>
                <div className="flex items-center gap-4 text-zinc-300">
                   <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <span className="text-lg">New York / Remote</span>
                </div>
             </div>
          </div>

          {/* Form */}
          <form className="glass-panel p-8 md:p-10 rounded-3xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs uppercase font-semibold tracking-wider text-zinc-500 ml-1">Name</label>
                   <input type="text" placeholder="John Doe" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs uppercase font-semibold tracking-wider text-zinc-500 ml-1">Email</label>
                   <input type="email" placeholder="john@company.com" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-xs uppercase font-semibold tracking-wider text-zinc-500 ml-1">Agent Interest</label>
                <select className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all appearance-none cursor-pointer">
                   <option>Competitor Intelligence Agent</option>
                   <option>Content Director Agent</option>
                   <option>Brand Architect Agent</option>
                   <option>Growth Strategy Agent</option>
                   <option>Executive Briefing Agent</option>
                   <option>Full Team Deployment</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs uppercase font-semibold tracking-wider text-zinc-500 ml-1">Message</label>
                <textarea rows={4} placeholder="Tell us about your goals..." className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none"></textarea>
             </div>

             <button type="submit" className="hover:bg-zinc-200 transition-colors flex gap-2 group font-semibold text-black bg-white w-full rounded-xl pt-4 pb-4 gap-x-2 gap-y-2 items-center justify-center">
                Send Request
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </form>
       </div>
    </section>
  );
};

export default Contact;
