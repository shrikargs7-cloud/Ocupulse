import React, { useState, useEffect } from 'react';
import { NavigationTab, AnalysisResponse } from './types';
import { checkHealth } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [activeResult, setActiveResult] = useState<AnalysisResponse | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  // Check health on mount and periodically
  useEffect(() => {
    const testHealth = () => {
      checkHealth().then((isOnline) => setBackendOnline(isOnline));
    };
    testHealth();
    const interval = setInterval(testHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setActiveResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchDemo = () => {
    setSelectedDemoId('demo_normal');
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromHistory = (result: AnalysisResponse) => {
    setActiveResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedDemoId(null);
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] bg-grid-pattern text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveResult={!!activeResult}
        onLaunchDemo={handleLaunchDemo}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onLaunchDemo={handleLaunchDemo}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzePage
            onAnalysisComplete={handleAnalysisComplete}
            setActiveTab={setActiveTab}
            selectedDemoId={selectedDemoId}
            setSelectedDemoId={setSelectedDemoId}
          />
        )}

        {activeTab === 'results' && activeResult && (
          <ResultsPage
            analysis={activeResult}
            setActiveTab={setActiveTab}
            onReset={handleReset}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            onSelectAnalysis={handleSelectFromHistory}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'how-it-works' && <HowItWorksPage />}

        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default App;
