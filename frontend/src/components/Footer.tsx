import React from 'react';
import { Eye, ShieldAlert, Cpu, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#060913] text-slate-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-slate-100">OcuPulse</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                Hackathon Prototype
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Automated computer-vision pipeline for quantitative retinal vascular geometry, vessel segmentation, centerline skeletonization, and objective screening indicators.
            </p>
            <p className="text-xs text-slate-500 italic">
              "See the Vessels. Understand the Risk."
            </p>
          </div>

          {/* Tech Architecture Badges */}
          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Technology Stack
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li>• FastAPI (Python 3)</li>
              <li>• OpenCV & scikit-image</li>
              <li>• CLAHE & Multiscale Filtering</li>
              <li>• React 18 & TypeScript</li>
              <li>• Tailwind CSS & Recharts</li>
              <li>• SQLite Local Persistence</li>
            </ul>
          </div>

          {/* Hackathon Attribution & Disclaimer Note */}
          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Compliance
            </h5>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-normal space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Ethical AI Standard</span>
              </div>
              <p>
                Patient privacy protected: Zero permanent image storage without explicit consent. Strictly non-diagnostic assistive screening.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} OcuPulse — AI Retinal Image Analysis System.</p>
          <p className="text-center sm:text-right">
            Designed for Smart India Hackathon (SIH) Demonstration
          </p>
        </div>

      </div>
    </footer>
  );
};
