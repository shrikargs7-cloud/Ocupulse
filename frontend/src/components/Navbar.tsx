import React from 'react';
import { Activity, Eye, History, Sparkles, HelpCircle, Info, UploadCloud } from 'lucide-react';
import { NavigationTab } from '../types';

interface Props {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  hasActiveResult: boolean;
  onLaunchDemo: () => void;
  backendOnline: boolean;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  hasActiveResult,
  onLaunchDemo,
  backendOnline,
}) => {
  const navItems = [
    { id: 'landing' as NavigationTab, label: 'Overview', icon: Eye },
    { id: 'analyze' as NavigationTab, label: 'Analyze Retina', icon: UploadCloud },
    ...(hasActiveResult ? [{ id: 'results' as NavigationTab, label: 'Results Dashboard', icon: Activity }] : []),
    { id: 'history' as NavigationTab, label: 'History', icon: History },
    { id: 'how-it-works' as NavigationTab, label: 'How It Works', icon: HelpCircle },
    { id: 'about' as NavigationTab, label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080d1a]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:border-emerald-400/60 transition-all">
              <Eye className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  OcuPulse
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full">
                  SIH Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI Retinal Vessel Analysis
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Demo CTA + Backend Status */}
          <div className="flex items-center gap-3">
            {/* Backend connection pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              <span>{backendOnline ? 'API Active' : 'Connecting'}</span>
            </div>

            {/* Quick 1-Click Demo Button for SIH Demonstration */}
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-950/50 hover:shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Try Demo</span>
            </button>
          </div>

        </div>
        
        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-800/60 no-scrollbar gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
