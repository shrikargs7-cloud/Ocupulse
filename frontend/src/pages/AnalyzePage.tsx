import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Eye,
  FileImage,
  Video,
  Sparkles,
  Trash2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clipboard,
  FolderOpen,
} from 'lucide-react';
import { AnalysisResponse, DemoSampleItem, NavigationTab } from '../types';
import { analyzeImage, getDemoSamples } from '../services/api';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface Props {
  onAnalysisComplete: (result: AnalysisResponse) => void;
  setActiveTab: (tab: NavigationTab) => void;
  selectedDemoId: string | null;
  setSelectedDemoId: (id: string | null) => void;
}

export const AnalyzePage: React.FC<Props> = ({
  onAnalysisComplete,
  setActiveTab,
  selectedDemoId,
  setSelectedDemoId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoSamples, setDemoSamples] = useState<DemoSampleItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load demo samples list
  useEffect(() => {
    getDemoSamples()
      .then((samples) => setDemoSamples(samples))
      .catch((err) => console.log('Using default sample metadata', err));
  }, []);

  // Handle selectedDemoId change from other components (like navbar "Try Demo")
  useEffect(() => {
    if (selectedDemoId) {
      setFile(null);
      setIsVideo(false);
      setPreviewUrl(`/api/sample/${selectedDemoId}`);
      setError(null);
    }
  }, [selectedDemoId]);

  // Global clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFile = e.clipboardData.files[0];
        handleFileSelect(pastedFile);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    const validImageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'];
    const validVideoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
    
    const fileName = selectedFile.name.toLowerCase();
    const isImg = validImageExtensions.some((ext) => fileName.endsWith(ext)) || selectedFile.type.startsWith('image/');
    const isVid = validVideoExtensions.some((ext) => fileName.endsWith(ext)) || selectedFile.type.startsWith('video/');

    if (!isImg && !isVid) {
      setError('Please upload a supported retinal image (.PNG, .JPG, .JPEG, .WEBP) or video (.MP4, .WEBM, .MOV, .AVI).');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100 MB. Please select a smaller file.');
      return;
    }

    setError(null);
    setSelectedDemoId(null);
    setFile(selectedFile);
    setIsVideo(isVid);

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSelectDemo = (sampleId: string) => {
    setError(null);
    setFile(null);
    setIsVideo(false);
    setSelectedDemoId(sampleId);
    setPreviewUrl(`/api/sample/${sampleId}`);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsVideo(false);
    setSelectedDemoId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const fileFromBlob = new File([blob], 'pasted_retina.png', { type: imageType });
          handleFileSelect(fileFromBlob);
          return;
        }
      }
      setError('No image found in clipboard. Please copy an image first, or drag and drop a file.');
    } catch (err) {
      setError('Clipboard access denied. Please use the "Browse Files" button or drag and drop.');
    }
  };

  const handleStartAnalysis = async () => {
    if (!file && !selectedDemoId) {
      setError('Please upload a retinal image/video or select a demo sample first.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const response = await analyzeImage(file, selectedDemoId);
      onAnalysisComplete(response);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'An error occurred during retinal vessel analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-400">
          <Eye className="w-3.5 h-3.5" />
          <span>Retinal Analysis Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Upload Retinal Fundus Scan or Video
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Upload a color fundus photograph or angiography video to extract vessel masks, centerline skeletons, and quantitative geometric biomarkers.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Analysis Notice</span>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Main Upload / Processing Panel */}
      {isAnalyzing ? (
        <div className="py-12">
          <ProgressIndicator isAnalyzing={isAnalyzing} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Drag and Drop Upload Area (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.mp4,.webm,.mov,.avi,.mkv"
              className="hidden"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-all flex flex-col items-center justify-center text-center min-h-[380px] ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : previewUrl
                  ? 'border-emerald-500/40 bg-slate-900/60'
                  : 'border-slate-700 hover:border-emerald-500/40 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
            >
              {previewUrl ? (
                /* Preview State */
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="relative max-h-72 max-w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black flex items-center justify-center">
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        className="max-h-72 object-contain rounded-xl"
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Fundus scan preview"
                        className="max-h-72 object-contain rounded-xl"
                      />
                    )}

                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                        className="p-2 rounded-xl bg-slate-950/80 text-rose-400 hover:text-rose-300 hover:bg-slate-900 border border-slate-700 shadow-lg transition"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-200 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{file ? file.name : `Benchmark Demo (${selectedDemoId})`}</span>
                      {file && (
                        <span className="text-slate-500">
                          ({(file.size / (1024 * 1024) > 1 
                            ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' 
                            : (file.size / 1024).toFixed(1) + ' KB')})
                        </span>
                      )}
                    </div>
                    {isVideo && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Video scan detected — AI will select the sharpest keyframe</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty Upload State */
                <div className="space-y-5 max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-200">
                      Drag & Drop Retinal Image or Video
                    </h3>
                    <p className="text-xs text-slate-400">
                      Supports fundus photographs and angiography video clips
                    </p>
                  </div>

                  {/* Explicit Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Browse Files</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition-all"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Paste Image</span>
                    </button>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-slate-500">
                    Formats: JPG, JPEG, PNG, WEBP, MP4, WebM, MOV (Up to 100 MB)
                  </div>
                </div>
              )}
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={!previewUrl || isAnalyzing}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                previewUrl && !isAnalyzing
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-950/60 hover:shadow-emerald-500/20 active:scale-98 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>{isVideo ? 'Extract Keyframe & Analyze Retina' : 'Analyze Retina'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right: 1-Click Demo Samples Selector for SIH Judges (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between space-y-5">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Demo Mode (1-Click Test)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a preloaded benchmark fundus scan for instant SIH demonstration without uploading external files:
                </p>
              </div>

              {/* Sample Cards */}
              <div className="space-y-3">
                {[
                  {
                    id: 'demo_normal',
                    name: '1. Standard Screening Fundus',
                    type: 'Balanced Vasculature (~12% Density)',
                    desc: 'Balanced vessel density with crisp arcades.',
                  },
                  {
                    id: 'demo_dense',
                    name: '2. Dense Retinal Arborization',
                    type: 'High Vascular Branching (~15% Density)',
                    desc: 'Rich branching tree across all quadrants.',
                  },
                  {
                    id: 'demo_subtle',
                    name: '3. Fine Micro-Vasculature',
                    type: 'Subtle Capillaries (~9% Density)',
                    desc: 'Tests high sensitivity local CLAHE enhancement.',
                  },
                ].map((sample) => {
                  const isSelected = selectedDemoId === sample.id;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectDemo(sample.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold block">{sample.name}</span>
                        <span className="text-[11px] text-emerald-400 font-mono block">
                          {sample.type}
                        </span>
                        <p className="text-[10px] text-slate-400">{sample.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Privacy Protection
                </span>
                <p>
                  Images and video frames are processed in memory and never permanently stored without consent.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

    </div>
  );
};
