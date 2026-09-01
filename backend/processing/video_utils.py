"""
OcuPulse Retinal Video Processing Module

Extracts optimal, sharpest keyframes from retinal video recordings
(e.g., Fluorescein Angiography, Retinal Fundus Video Scans, OCT sweeps)
for quantitative vessel segmentation and analysis.
"""

import os
import tempfile
import cv2
import numpy as np
from typing import Tuple, Dict, Any, Optional


def extract_best_keyframe_from_video(
    video_bytes: bytes,
    filename: str = "retinal_video.mp4",
    max_sample_frames: int = 60
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Ingest a retinal video, sample candidate frames across duration,
    evaluate image quality / sharpness on each frame, and extract the best keyframe.
    
    Args:
        video_bytes: Raw binary bytes of the video
        filename: Original file name for extension inference
        max_sample_frames: Max number of frames to evaluate across duration
        
    Returns:
        Tuple of (best_frame_bgr, video_metadata)
    """
    ext = os.path.splitext(filename)[1].lower() or ".mp4"
    
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name
        
    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file. Ensure the format is supported (MP4, WebM, MOV, AVI).")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(cap.get(cv2.CAP_PROP_FPS))
        fps = fps if fps > 0 else 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration_sec = round(total_frames / fps, 2) if total_frames > 0 else 0.0
        
        if total_frames <= 0:
            # Attempt sequential reading if frame count metadata is unavailable
            frames = []
            while len(frames) < 100:
                ret, frame = cap.read()
                if not ret:
                    break
                frames.append(frame)
            if not frames:
                raise ValueError("Video file contains no readable frames.")
            total_frames = len(frames)
            step = max(1, len(frames) // max_sample_frames)
            candidate_indices = list(range(0, len(frames), step))
            candidate_frames = [(i, frames[i]) for i in candidate_indices]
        else:
            step = max(1, total_frames // max_sample_frames)
            candidate_indices = list(range(0, total_frames, step))[:max_sample_frames]
            candidate_frames = []
            
            for idx in candidate_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret and frame is not None:
                    candidate_frames.append((idx, frame))
                    
        if not candidate_frames:
            raise ValueError("Failed to extract any readable frames from the video.")
            
        # Score each candidate frame based on focus (Laplacian variance) & Green channel contrast
        best_score = -1.0
        best_frame = candidate_frames[0][1]
        best_idx = candidate_frames[0][0]
        
        for idx, frame in candidate_frames:
            # Extract green channel
            green = frame[:, :, 1] if len(frame.shape) == 3 else frame
            laplacian = cv2.Laplacian(green, cv2.CV_64F)
            sharpness = float(np.var(laplacian))
            std_contrast = float(np.std(green))
            
            score = sharpness * 0.7 + std_contrast * 2.5
            if score > best_score:
                best_score = score
                best_frame = frame
                best_idx = idx
                
        timestamp_sec = round(best_idx / fps, 2) if fps > 0 else 0.0
        
        metadata = {
            "is_video": True,
            "total_frames": total_frames,
            "fps": round(fps, 1),
            "duration_sec": duration_sec,
            "width": width,
            "height": height,
            "selected_frame_index": best_idx,
            "selected_frame_timestamp_sec": timestamp_sec,
            "sample_frames_evaluated": len(candidate_frames)
        }
        
        return best_frame, metadata
        
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
