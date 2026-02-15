export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[60] px-6 py-6 pointer-events-none">
            <div className="mx-auto max-w-7xl flex items-center justify-between pointer-events-auto">

                {/* Logo Section */}
                <a href="/" className="flex items-center gap-3 group relative px-4 py-2 bg-[#0A0A0A]/50 backdrop-blur-md border border-white/5 shadow-neo transition-all hover:-translate-y-0.5">
                    <div className="h-6 w-6 flex items-center justify-center text-white">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="6" />
                            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="6" />
                            <circle cx="50" cy="50" r="8" fill="#FF5E1E" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase font-serif italic">AIBC</span>
                </a>

                {/* Floating Nav Items */}
                <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-[#0A0A0A]/50 backdrop-blur-md border border-white/5 shadow-neo rounded-full overflow-hidden">
                    {['Features', 'How it Works', 'Pricing'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                            className="px-4 py-1.5 text-[10px] font-mono font-bold text-white/40 hover:text-white uppercase tracking-widest transition-all hover:bg-white/5 rounded-full"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                    <button className="text-[10px] font-mono font-bold text-white/40 hover:text-white uppercase tracking-widest hidden lg:block px-4 py-2 pointer-events-auto">
                        Log In
                    </button>
                    <button className="bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-neo transition-all pointer-events-auto hover:bg-neutral-100">
                        Get Started
                    </button>
                </div>

            </div>
        </nav>
    );
}
