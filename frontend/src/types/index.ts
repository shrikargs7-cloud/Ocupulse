/**
 * OcuPulse TypeScript Type Definitions
 */

export interface QuantitativeMetrics {
  vessel_density: number;          // Vessel area as percentage of retinal ROI area (%)
  vessel_area: number;             // Total detected vascular pixel count
  vessel_length_pixels: number;    // Total centerline skeleton length in pixels
  branch_points: number;           // Number of vascular bifurcation/junction points
  endpoints: number;               // Number of vascular terminal endpoints
  skeleton_density: number;        // Skeleton pixels as percentage of ROI area (%)
  vessel_to_roi_ratio: number;     // Vessel area divided by ROI area
  average_vessel_width_px: number; // Estimated mean vessel caliber in pixels
  branching_index: number;         // Branch points per 1000 pixels of vessel length
  fractal_dimension: number;       // Vascular complexity fractal dimension (1.0-2.0)
  roi_pixels: number;              // Total retinal field of view pixel area
}

export interface QualityDetails {
  sharpness_laplacian: number;
  rms_contrast: number;
  illumination_uniformity: number;
  roi_coverage_percent: number;
  mean_intensity: number;
}

export interface ImageQuality {
  score: number;                   // 0.0 to 1.0
  label: 'Good' | 'Moderate' | 'Poor';
  description: string;
  metrics: QualityDetails;
}

export interface ScreeningSummary {
  headline: string;
  observations: string[];
  full_text: string;
  screening_status: string;
  recommendation: string;
  disclaimer: string;
}

export interface AnalysisImages {
  original: string;
  enhanced: string;
  roi_mask: string;
  vessel_mask: string;
  vessel_overlay: string;
  skeleton: string;
  skeleton_mask?: string;
}

export interface VideoInfo {
  is_video: boolean;
  total_frames: number;
  fps: number;
  duration_sec: number;
  selected_frame_index: number;
  selected_frame_timestamp_sec: number;
  sample_frames_evaluated: number;
}

export interface AnalysisResponse {
  success: boolean;
  analysis_id: string;
  timestamp: string;
  filename: string;
  metrics: QuantitativeMetrics;
  quality: ImageQuality;
  summary: ScreeningSummary;
  images: AnalysisImages;
  dimensions: {
    width: number;
    height: number;
  };
  timing: {
    preprocessing_sec?: number;
    segmentation_sec?: number;
    overlay_sec?: number;
    skeletonization_sec?: number;
    geometry_sec?: number;
    quality_sec?: number;
    total_execution_sec: number;
  };
  video_info?: VideoInfo;
}

export interface HistoryItem {
  analysis_id: string;
  timestamp: string;
  filename: string;
  quality_score: number;
  quality_label: string;
  vessel_density: number;
  vessel_area: number;
  vessel_length_pixels: number;
  branch_points: number;
  endpoints: number;
  skeleton_density: number;
  average_vessel_width_px: number;
  fractal_dimension: number;
  summary_headline: string;
  thumbnail_base64?: string;
}

export interface DemoSampleItem {
  id: string;
  name: string;
  description: string;
  sample_type: string;
  preview_url: string;
}

export type NavigationTab = 
  | 'landing' 
  | 'analyze' 
  | 'results' 
  | 'history' 
  | 'how-it-works' 
  | 'about';
