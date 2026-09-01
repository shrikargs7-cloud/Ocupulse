"""
OcuPulse Retinal Image Quality Assessment and Screening Interpretation Module

Provides functions for:
- Quantitative image quality scoring (sharpness, contrast, illumination uniformity, ROI coverage)
- Quality classification (Good, Moderate, Poor)
- AI-assisted objective screening observation synthesis
- Strict compliance with medical non-diagnostic terminology guidelines
"""

import cv2
import numpy as np
from typing import Dict, Any, Tuple


def assess_image_quality(
    image: np.ndarray,
    green_channel: np.ndarray,
    roi_mask: np.ndarray,
    vessel_mask: np.ndarray
) -> Dict[str, Any]:
    """
    Assess fundus image technical quality across focus, contrast,
    quadrant illumination uniformity, and retinal field coverage.
    
    Args:
        image: Original BGR color image
        green_channel: Grayscale green channel
        roi_mask: Retinal field of view mask
        vessel_mask: Segmented binary vessel mask
        
    Returns:
        Dictionary containing quality score, label, metrics, and quality feedback
    """
    h, w = green_channel.shape
    total_image_pixels = h * w
    roi_pixels = np.count_nonzero(roi_mask)
    
    # 1. Retinal Field of View Coverage
    roi_coverage = round((roi_pixels / total_image_pixels) * 100.0, 2)
    
    # 2. Sharpness / Focus (Laplacian Variance within ROI)
    laplacian = cv2.Laplacian(green_channel, cv2.CV_64F)
    roi_laplacian = laplacian[roi_mask > 0]
    sharpness_score = float(np.var(roi_laplacian)) if len(roi_laplacian) > 0 else 0.0
    sharpness_score = round(sharpness_score, 2)
    
    # 3. Contrast (RMS Contrast within ROI)
    roi_green = green_channel[roi_mask > 0]
    if len(roi_green) > 0:
        mean_intensity = float(np.mean(roi_green))
        std_intensity = float(np.std(roi_green))
        rms_contrast = round(std_intensity / max(1.0, mean_intensity), 3)
    else:
        mean_intensity = 0.0
        std_intensity = 0.0
        rms_contrast = 0.0
        
    # 4. Illumination Uniformity across Retinal Quadrants
    mid_y, mid_x = h // 2, w // 2
    quadrants = [
        green_channel[:mid_y, :mid_x][roi_mask[:mid_y, :mid_x] > 0],
        green_channel[:mid_y, mid_x:][roi_mask[:mid_y, mid_x:] > 0],
        green_channel[mid_y:, :mid_x][roi_mask[mid_y:, :mid_x] > 0],
        green_channel[mid_y:, mid_x:][roi_mask[mid_y:, mid_x:] > 0]
    ]
    quad_means = []
    for q in quadrants:
        if len(q) > 50:
            quad_means.append(float(np.mean(q)))
            
    if len(quad_means) >= 2:
        quad_cv = float(np.std(quad_means) / max(1.0, np.mean(quad_means)))
        illumination_uniformity = round(max(0.0, 1.0 - quad_cv), 3)
    else:
        illumination_uniformity = 0.75
        
    # 5. Composite Normalized Quality Score (0.0 to 1.0)
    # Normalized components:
    norm_sharpness = min(1.0, sharpness_score / 450.0)
    norm_contrast = min(1.0, rms_contrast / 0.45)
    norm_coverage = min(1.0, roi_coverage / 45.0)
    norm_uniformity = min(1.0, illumination_uniformity)
    
    composite_score = round(
        0.35 * norm_sharpness +
        0.25 * norm_contrast +
        0.20 * norm_uniformity +
        0.20 * norm_coverage,
        2
    )
    
    # 6. Quality Categorization
    if composite_score >= 0.70:
        label = "Good"
        description = "High technical clarity with crisp retinal vasculature and optimal contrast."
    elif composite_score >= 0.45:
        label = "Moderate"
        description = "Acceptable clarity for screening; minor illumination variance or slight soft focus observed."
    else:
        label = "Poor"
        description = "Low contrast or motion blur detected. Vascular segmentation may have limited reliability."
        
    return {
        "score": composite_score,
        "label": label,
        "description": description,
        "metrics": {
            "sharpness_laplacian": sharpness_score,
            "rms_contrast": rms_contrast,
            "illumination_uniformity": illumination_uniformity,
            "roi_coverage_percent": roi_coverage,
            "mean_intensity": round(mean_intensity, 1)
        }
    }


def generate_screening_summary(
    geometry: Dict[str, Any],
    quality: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate an objective, non-diagnostic screening summary based on
    calculated computer vision metrics. Adheres strictly to AI-assisted
    screening guidelines without making unsupported clinical claims.
    
    Args:
        geometry: Geometric and topological metrics dictionary
        quality: Quality assessment dictionary
        
    Returns:
        Structured screening interpretation dictionary
    """
    vessel_density = geometry["vessel_density"]
    branch_points = geometry["branch_points"]
    endpoints = geometry["endpoints"]
    vessel_length = geometry["vessel_length_pixels"]
    avg_width = geometry.get("average_vessel_width_px", 0.0)
    fractal_dim = geometry.get("fractal_dimension", 1.45)
    quality_label = quality["label"]
    
    observations = []
    
    # Vessel density screening observation
    if vessel_density < 7.0:
        observations.append(
            f"Observed vascular density is {vessel_density}%, which is in the lower range for typical fundus photographs."
        )
    elif vessel_density > 18.0:
        observations.append(
            f"Observed vascular density is {vessel_density}%, indicating dense visible vessel arborization."
        )
    else:
        observations.append(
            f"Observed vascular density is {vessel_density}%, within typical quantitative image-analysis expectations (8%–16%)."
        )
        
    # Branching structure observation
    observations.append(
        f"Detected {branch_points} vascular bifurcation points and {endpoints} visible terminal endpoints across {vessel_length:,.0f} pixels of vessel centerline length."
    )
    
    # Morphological complexity observation
    observations.append(
        f"Vascular network fractal dimension is estimated at {fractal_dim} with mean caliber index of {avg_width} px."
    )
    
    # Quality note if moderate or poor
    if quality_label == "Poor":
        observations.append(
            "Note: Image quality score indicates reduced sharpness or illumination variance, which may affect micro-vessel segmentation."
        )
        
    concise_text = " ".join(observations)
    
    return {
        "headline": f"Retinal Vessel Analysis Completed (Quality: {quality_label})",
        "observations": observations,
        "full_text": concise_text,
        "screening_status": "Completed - Review Required",
        "recommendation": "Quantitative vascular measurements extracted successfully. Results should be reviewed by a qualified eye-care professional or ophthalmologist alongside clinical history.",
        "disclaimer": "OcuPulse is an AI-assisted retinal image analysis and screening tool. It is not intended to provide a definitive medical diagnosis. Results must be interpreted in conjunction with comprehensive clinical examination."
    }
