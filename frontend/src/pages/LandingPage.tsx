import React from 'react';
import {
  Eye,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Cpu,
  GitFork,
  Ruler,
  FileCheck,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface Props {
  setActiveTab: (tab: NavigationTab) => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<Props> = ({ setActiveTab, onLaunchDemo }) => {
  const pipelineStages = [
    { num: '01', title: 'Upload & Validate', desc: 'Accepts high-res PNG/JPG fundus scans' },
    { num: '02', title: 'ROI Field Isolation', desc: 'Isolates circular retina from dark border' },
    { num: '03', title: 'CLAHE Enhancement', desc: 'Equalizes local green channel contrast' },
    { num: '04', title: 'Vessel Segmentation', desc: 'Multi-scale morphological ridge extraction' },
    { num: '05', title: 'Centerline Thinning', desc: '1-pixel wide Zhang-Suen skeletonization' },
    { num: '06', title: 'Geometric Topology', desc: 'Density, branch points & length calculation' },
    { num: '07', title: 'Screening Report', desc: 'Structured parametric screening insights' },
  ];

  const features = [
    {
      icon: Activity,
      title: 'Quantitative Vessel Density',
      desc: 'Calculates exact percentage of retinal area occupied by visible vasculature (e.g. 11.98%).',
      tag: 'Objective Metric',
    },
    {
      icon: GitFork,
      title: 'Branch & Endpoint Topology',
      desc: 'Identifies bifurcations, junctions, and terminal micro-vessel endpoints with component clustering.',
      tag: 'Network Graph',
    },
    {
      icon: Ruler,
      title: 'Total Centerline Length',
      desc: 'Extracts one-pixel-wide vessel skeleton to calculate total pixel-based centerline length.',
      tag: 'Geometry',
    },
    {
      icon: Layers,
      title: 'Multi-View Visualizer Matrix',
      desc: 'Inspect Original, Enhanced, ROI Mask, Binary Segmentation, Overlay, and Skeleton centerlines.',
      tag: 'Visualization',
    },
    {
      icon: ShieldCheck,
      title: 'Image Quality Assessment',
      desc: 'Evaluates sharpness (Laplacian variance), contrast, and quadrant illumination uniformity.',
      tag: 'Confidence',
    },
    {
      icon: FileCheck,
      title: 'Downloadable Clinical Report',
      desc: 'Generate printable PDF-ready screening reports complete with visual evidence and disclaimers.',
      tag: 'Reporting',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-6">
        
        {/* Glowing backdrop accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-500/10 blur-[120px] -z-10 pointer-events-none" />

        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-sm animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart India Hackathon (SIH) Demonstration Prototype</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          See the Vessels.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Understand the Risk.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transform retinal fundus images into measurable vascular insights using computer vision, multi-scale enhancement, centerline skeletonization, and AI-assisted screening analysis.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('analyze')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <Eye className="w-5 h-5 text-slate-950" />
            <span>Analyze Retinal Image</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={onLaunchDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 font-semibold text-sm sm:text-base active:scale-95 transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Try 1-Click Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How It Works</span>
          </button>
        </div>

        {/* Disclaimer Banner on Landing Page */}
        <div className="pt-6 max-w-3xl mx-auto">
          <MedicalDisclaimer compact />
        </div>

      </section>

      {/* 2. PIPELINE FLOW DIAGRAM */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
            Modular Processing Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How OcuPulse Analyzes the Retina
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            7-stage mathematical computer-vision pipeline running locally with millisecond execution speed.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {pipelineStages.map((stg, i) => (
            <div
              key={i}
              className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {stg.num}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 group-hover:bg-emerald-400 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                {stg.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                {stg.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. KEY FEATURES GRID */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider font-mono">
            Scientific Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Vascular Biomarkers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Rigorous mathematical extraction of structural and topological characteristics from retinal fundus photographs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-panel border border-slate-800/80 glass-card-hover flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {feat.tag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-slate-100">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WHY RETINAL ANALYSIS */}
      <section className="p-8 sm:p-12 rounded-3xl glass-panel-glow border border-emerald-500/30 text-left relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Vascular Window into Health</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Retinal Blood Vessel Analysis?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            The retina is the only anatomical site where human micro-vasculature can be directly, non-invasively visualized in vivo. Changes in vessel caliber, branching density, and tortuosity serve as quantitative screening biomarkers in ophthalmology and systemic health research.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            OcuPulse automates the labor-intensive manual delineation of blood vessels, providing instant quantitative metrics for clinical screening workflows and academic research.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('analyze')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-950/60"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Analysis Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. FULL MEDICAL DISCLAIMER NOTICE */}
      <section className="max-w-4xl mx-auto">
        <MedicalDisclaimer />
      </section>

    </div>
  );
};
