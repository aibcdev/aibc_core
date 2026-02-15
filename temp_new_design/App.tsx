
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AgentMarquee from './components/AgentMarquee';
import HowItWorks from './components/HowItWorks';
import OperatingSystem from './components/OperatingSystem';
import ExampleOutputs from './components/ExampleOutputs';
import VideoAgents from './components/VideoAgents';
import Pricing from './components/Pricing';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Deploy from './components/Deploy';

function App() {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Initialize
    setCurrentPath(window.location.hash);

    // Listen
    const onHashChange = () => {
      setCurrentPath(window.location.hash);
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isPricing = currentPath === '#pricing' || currentPath.startsWith('#pricing');
  const isDeploy = currentPath === '#deploy' || currentPath.startsWith('#deploy');

  useEffect(() => {
    if (isPricing || isDeploy) {
        window.scrollTo(0, 0);
    }
  }, [isPricing, isDeploy]);

  return (
    <div className="bg-zinc-950 min-h-screen">
      <Navigation />
      <main>
        {isDeploy ? (
            <Deploy />
        ) : isPricing ? (
            <Pricing />
        ) : (
            <>
                <Hero />
                <AgentMarquee />
                <HowItWorks />
                <OperatingSystem />
                <ExampleOutputs />
                <VideoAgents />
                <About />
                <Contact />
            </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
