import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  Sliders,
} from 'lucide-react';
import { AnalysisResponse, NavigationTab } from '../types';
import { MetricsCards } from '../components/MetricsCards';
import { VisualizerGrid } from '../components/VisualizerGrid';
import { ImageSlider } from '../components/ImageSlider';
import { AnalysisCharts } from '../components/AnalysisCharts';
import { ReportModal } from '../components/ReportModal';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface Props {
  analysis: AnalysisResponse;
  setActiveTab: (tab: NavigationTab) => void;
  onReset: () => void;
}

export const ResultsPage: React.FC<Props> = ({ analysis, setActiveTab, onReset }) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { metrics, quality, summary, images, analysis_id, timing, filename } = analysis;

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      
      {/* 1. TOP STATUS BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Retinal Analysis Complete
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Session ID: <span className="text-emerald-400 font-semibold">{analysis_id}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Quality: {quality.label} ({Math.round(quality.score * 100)}%)
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              CV Time: {timing.total_execution_sec}s
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 text-xs font-mono">
              File: {filename}
            </span>
            {analysis.video_info && (
              <span className="px-3 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono flex items-center gap-1.5">
                <span>Video: {analysis.video_info.duration_sec}s @ {analysis.video_info.fps}fps (Keyframe #{analysis.video_info.selected_frame_index} @ {analysis.video_info.selected_frame_timestamp_sec}s)</span>
              </span>
            )}
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/60 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>Download Report</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Scan</span>
          </button>
        </div>

      </div>

      {/* 2. OBJECTIVE SCREENING SUMMARY */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Screening Summary & Observations
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {summary.screening_status}
          </span>
        </div>

        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
          {summary.observations.map((obs, idx) => (
            <li key={idx} className="leading-relaxed">
              {obs}
            </li>
          ))}
        </ul>

        <div className="pt-2 text-xs text-slate-400 border-t border-slate-800/80">
          <strong className="text-slate-300">Clinical Recommendation:</strong> {summary.recommendation}
        </div>
      </div>

      {/* 3. QUANTITATIVE METRICS CARDS */}
      <MetricsCards metrics={metrics} />

      {/* 4. BEFORE & AFTER SPLIT COMPARISON SLIDER */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <ImageSlider
          beforeImage={images.original}
          afterImage={images.vessel_overlay}
          beforeLabel="1. Original Fundus Photograph"
          afterLabel="5. Segmented Vessel Overlay"
        />
      </div>

      {/* 5. 6-STAGE VISUALIZER MATRIX */}
      <VisualizerGrid images={images} />

      {/* 6. ANALYTICS & GEOMETRY CHARTS */}
      <AnalysisCharts metrics={metrics} quality={quality} />

      {/* 7. MEDICAL DISCLAIMER */}
      <MedicalDisclaimer />

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysis={analysis}
      />

    </div>
  );
};
