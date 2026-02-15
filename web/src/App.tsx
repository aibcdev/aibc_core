import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import Deploy from './components/Deploy';
import Pricing from './components/Pricing';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AgentMarquee from './components/AgentMarquee';
import HowItWorks from './components/HowItWorks';
import ExampleOutputs from './components/ExampleOutputs';
import VideoAgents from './components/VideoAgents';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import OnboardingFlow from './components/OnboardingFlow';

function App() {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.hash);
    const onHashChange = () => {
      setCurrentPath(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isDeploy = currentPath === '#deploy';
  const isPricing = currentPath === '#pricing';
  const isDashboard = currentPath === '#dashboard';
  const isOnboarding = currentPath === '#onboarding';

  // Full-screen views (no nav/footer)
  if (isOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(state) => {
          console.log('Onboarding complete:', state);
          window.location.hash = '#dashboard';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      {!isDashboard && <Navigation />}

      <main>
        {isDashboard ? (
          <Dashboard />
        ) : isDeploy ? (
          <Deploy />
        ) : isPricing ? (
          <Pricing />
        ) : (
          <>
            <Hero />
            <AgentMarquee />
            <HowItWorks />
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
