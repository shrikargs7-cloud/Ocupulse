"""
OcuPulse Pydantic Data Models and Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class QuantitativeMetrics(BaseModel):
    vessel_density: float = Field(..., description="Vessel area as percentage of retinal ROI area (%)")
    vessel_area: int = Field(..., description="Total detected vascular pixel count")
    vessel_length_pixels: float = Field(..., description="Total centerline skeleton length in pixels")
    branch_points: int = Field(..., description="Number of vascular bifurcation/junction points")
    endpoints: int = Field(..., description="Number of vascular terminal endpoints")
    skeleton_density: float = Field(..., description="Skeleton pixels as percentage of ROI area (%)")
    vessel_to_roi_ratio: float = Field(..., description="Vessel area divided by ROI area")
    average_vessel_width_px: float = Field(..., description="Estimated mean vessel caliber in pixels")
    branching_index: float = Field(..., description="Branch points per 1000 pixels of vessel length")
    fractal_dimension: float = Field(..., description="Vascular complexity fractal dimension (1.0-2.0)")
    roi_pixels: int = Field(..., description="Total retinal field of view pixel area")


class QualityDetails(BaseModel):
    sharpness_laplacian: float
    rms_contrast: float
    illumination_uniformity: float
    roi_coverage_percent: float
    mean_intensity: float


class ImageQuality(BaseModel):
    score: float = Field(..., description="Normalized overall quality score (0.0 to 1.0)")
    label: str = Field(..., description="Quality tier: Good, Moderate, or Poor")
    description: str = Field(..., description="Technical quality evaluation description")
    metrics: QualityDetails


class ScreeningSummary(BaseModel):
    headline: str
    observations: List[str]
    full_text: str
    screening_status: str
    recommendation: str
    disclaimer: str


class AnalysisImages(BaseModel):
    original: str
    enhanced: str
    roi_mask: str
    vessel_mask: str
    vessel_overlay: str
    skeleton: str
    skeleton_mask: Optional[str] = None


class VideoInfo(BaseModel):
    is_video: bool = True
    total_frames: int
    fps: float
    duration_sec: float
    selected_frame_index: int
    selected_frame_timestamp_sec: float
    sample_frames_evaluated: int


class AnalysisResponse(BaseModel):
    success: bool = True
    analysis_id: str
    timestamp: str
    filename: str
    metrics: QuantitativeMetrics
    quality: ImageQuality
    summary: ScreeningSummary
    images: AnalysisImages
    dimensions: Dict[str, int]
    timing: Dict[str, float]
    video_info: Optional[VideoInfo] = None


class HistoryItem(BaseModel):
    analysis_id: str
    timestamp: str
    filename: str
    quality_score: float
    quality_label: str
    vessel_density: float
    vessel_area: int
    vessel_length_pixels: float
    branch_points: int
    endpoints: int
    skeleton_density: float
    average_vessel_width_px: float
    fractal_dimension: float
    summary_headline: str
    thumbnail_base64: Optional[str] = None


class DemoSampleItem(BaseModel):
    id: str
    name: str
    description: str
    sample_type: str
    preview_url: str
