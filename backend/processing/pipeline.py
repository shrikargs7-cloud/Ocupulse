"""
OcuPulse Retinal Image Analysis Pipeline Orchestrator

Integrates:
1. Input validation and resizing
2. Retinal Field of View (ROI) detection
3. Green channel extraction
4. CLAHE contrast enhancement
5. Edge-preserving noise reduction
6. Multi-scale vessel segmentation
7. Vessel detection overlay generation
8. Centerline skeletonization
9. Geometric & topological feature extraction
10. Image quality assessment
11. Screening summary synthesis
"""

import time
import base64
import cv2
import numpy as np
from typing import Dict, Any, Optional

from .preprocessing import preprocess_fundus_image
from .segmentation import segment_vessels, create_vessel_overlay
from .skeletonization import extract_vessel_skeleton, generate_skeleton_visualizer
from .geometry import analyze_vessel_geometry
from .quality import assess_image_quality, generate_screening_summary


def mat_to_base64_png(img: np.ndarray) -> str:
    """Convert an OpenCV image matrix to a base64 encoded PNG data URI."""
    success, buffer = cv2.imencode('.png', img)
    if not success:
        raise ValueError("Failed to encode image to PNG format")
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{b64_str}"


def analyze_retinal_fundus(
    image: np.ndarray,
    target_max_dim: int = 900
) -> Dict[str, Any]:
    """
    Run complete end-to-end OcuPulse computer vision analysis pipeline on a retinal image.
    
    Args:
        image: Input fundus photograph (BGR uint8)
        target_max_dim: Max processing dimension
        
    Returns:
        Structured dictionary containing metrics, quality, images (base64 PNGs),
        and screening summary.
    """
    start_time = time.time()
    stage_timings = {}
    
    # --- STAGE 1: Preprocessing & Retinal ROI Detection ---
    t0 = time.time()
    preprocessed = preprocess_fundus_image(image, target_max_dim=target_max_dim)
    proc_img = preprocessed["processed_image"]
    roi_mask = preprocessed["roi_mask"]
    green_ch = preprocessed["green_channel"]
    enhanced_img = preprocessed["enhanced_image"]
    denoised_img = preprocessed["denoised_image"]
    stage_timings["preprocessing_sec"] = round(time.time() - t0, 3)
    
    # --- STAGE 2: Vessel Segmentation ---
    t0 = time.time()
    vessel_mask = segment_vessels(denoised_img, roi_mask)
    stage_timings["segmentation_sec"] = round(time.time() - t0, 3)
    
    # --- STAGE 3: Vessel Overlay Generation ---
    t0 = time.time()
    vessel_overlay = create_vessel_overlay(proc_img, vessel_mask, overlay_color=(0, 255, 230), alpha=0.65)
    stage_timings["overlay_sec"] = round(time.time() - t0, 3)
    
    # --- STAGE 4: Skeletonization ---
    t0 = time.time()
    skeleton_mask = extract_vessel_skeleton(vessel_mask)
    stage_timings["skeletonization_sec"] = round(time.time() - t0, 3)
    
    # --- STAGE 5: Geometric & Topological Analysis ---
    t0 = time.time()
    geometry = analyze_vessel_geometry(vessel_mask, skeleton_mask, roi_mask)
    stage_timings["geometry_sec"] = round(time.time() - t0, 3)
    
    # --- STAGE 6: Skeleton Visualizer with Branch & End Markers ---
    skeleton_visualizer = generate_skeleton_visualizer(
        skeleton=skeleton_mask,
        branch_coords=np.array(geometry["branch_coordinates"]),
        endpoint_coords=np.array(geometry["endpoint_coordinates"]),
        base_image=proc_img
    )
    
    # --- STAGE 7: Image Quality Assessment & Summary ---
    t0 = time.time()
    quality = assess_image_quality(proc_img, green_ch, roi_mask, vessel_mask)
    summary = generate_screening_summary(geometry, quality)
    stage_timings["quality_sec"] = round(time.time() - t0, 3)
    
    total_time = round(time.time() - start_time, 3)
    stage_timings["total_execution_sec"] = total_time
    
    # Encode output visualizers as base64 PNG data URLs
    images_dict = {
        "original": mat_to_base64_png(proc_img),
        "enhanced": mat_to_base64_png(enhanced_img),
        "roi_mask": mat_to_base64_png(roi_mask),
        "vessel_mask": mat_to_base64_png(vessel_mask),
        "vessel_overlay": mat_to_base64_png(vessel_overlay),
        "skeleton": mat_to_base64_png(skeleton_visualizer),
        "skeleton_mask": mat_to_base64_png(skeleton_mask)
    }
    
    return {
        "metrics": {
            "vessel_density": geometry["vessel_density"],
            "vessel_area": geometry["vessel_area"],
            "vessel_length_pixels": geometry["vessel_length_pixels"],
            "branch_points": geometry["branch_points"],
            "endpoints": geometry["endpoints"],
            "skeleton_density": geometry["skeleton_density"],
            "vessel_to_roi_ratio": geometry["vessel_to_roi_ratio"],
            "average_vessel_width_px": geometry["average_vessel_width_px"],
            "branching_index": geometry["branching_index"],
            "fractal_dimension": geometry["fractal_dimension"],
            "roi_pixels": geometry["roi_pixels"]
        },
        "quality": quality,
        "summary": summary,
        "images": images_dict,
        "dimensions": preprocessed["dimensions"],
        "timing": stage_timings
    }
