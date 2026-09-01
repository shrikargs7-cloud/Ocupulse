"""
OcuPulse FastAPI Endpoints Router
"""

import os
import uuid
from datetime import datetime
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional, List, Dict, Any

from ..schemas import AnalysisResponse, HistoryItem, DemoSampleItem, VideoInfo
from ..database import save_analysis, list_analyses, get_analysis_by_id, delete_analysis
from ...processing.pipeline import analyze_retinal_fundus, mat_to_base64_png
from ...processing.preprocessing import validate_image
from ...processing.video_utils import extract_best_keyframe_from_video

router = APIRouter()

SAMPLE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "sample_data"
)

DEMO_SAMPLES = [
    {
        "id": "demo_normal",
        "name": "Standard Screening Fundus",
        "filename": "demo_normal.png",
        "description": "Standard adult retinal fundus photography with balanced vascular branching and clear optic disc margins.",
        "sample_type": "Balanced Vasculature"
    },
    {
        "id": "demo_dense",
        "name": "Dense Retinal Arborization",
        "filename": "demo_dense.png",
        "description": "High-density retinal vascular arborization with multiple prominent bifurcation levels across arcades.",
        "sample_type": "Dense Vasculature"
    },
    {
        "id": "demo_subtle",
        "name": "Fine Micro-Vasculature",
        "filename": "demo_subtle.png",
        "description": "Narrow caliber micro-vessels requiring sensitive local CLAHE contrast and morphological ridge extraction.",
        "sample_type": "Micro-Vasculature"
    }
]


@router.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "ok",
        "app": "OcuPulse",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/demo-samples", response_model=List[DemoSampleItem], tags=["Samples"])
async def get_demo_samples():
    """Retrieve preloaded demo retinal fundus images for 1-click evaluation."""
    results = []
    for s in DEMO_SAMPLES:
        filepath = os.path.join(SAMPLE_DIR, s["filename"])
        preview_url = f"/api/sample/{s['id']}"
        results.append(
            DemoSampleItem(
                id=s["id"],
                name=s["name"],
                description=s["description"],
                sample_type=s["sample_type"],
                preview_url=preview_url
            )
        )
    return results


@router.get("/sample/{sample_id}", tags=["Samples"])
async def get_sample_image(sample_id: str):
    """Serve a sample retinal fundus image file directly."""
    sample = next((s for s in DEMO_SAMPLES if s["id"] == sample_id), None)
    if not sample:
        raise HTTPException(status_code=404, detail="Sample image not found")
        
    filepath = os.path.join(SAMPLE_DIR, sample["filename"])
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Sample file missing on disk")
        
    return FileResponse(filepath, media_type="image/png")


@router.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    demo_id: Optional[str] = Form(None)
):
    """
    Execute end-to-end retinal fundus image analysis pipeline.
    Accepts either an uploaded image file (multipart/form-data) OR a demo_id parameter.
    """
    image_bytes = None
    original_filename = "fundus_scan.png"
    video_info = None
    image = None
    
    # 1. Check if demo_id was requested
    if demo_id:
        sample = next((s for s in DEMO_SAMPLES if s["id"] == demo_id), None)
        if not sample:
            raise HTTPException(status_code=400, detail=f"Invalid demo sample ID '{demo_id}'")
        filepath = os.path.join(SAMPLE_DIR, sample["filename"])
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Requested demo sample file not found on server")
        with open(filepath, "rb") as f:
            image_bytes = f.read()
        original_filename = sample["filename"]
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    # 2. Check if file was uploaded
    elif file:
        original_filename = file.filename or "uploaded_retina.png"
        
        # Supported extensions
        allowed_image_exts = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff")
        allowed_video_exts = (".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v")
        
        lower_name = original_filename.lower()
        is_image = any(lower_name.endswith(ext) for ext in allowed_image_exts)
        is_video = any(lower_name.endswith(ext) for ext in allowed_video_exts)
        
        if not is_image and not is_video:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{original_filename}'. Supported: PNG, JPG, JPEG, WEBP, BMP, MP4, WebM, MOV, AVI."
            )
            
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")
        if len(image_bytes) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File exceeds maximum allowable size (100 MB).")
            
        if is_video:
            try:
                best_frame, v_meta = extract_best_keyframe_from_video(
                    image_bytes, filename=original_filename, max_sample_frames=60
                )
                image = best_frame
                video_info = VideoInfo(**v_meta)
            except Exception as v_err:
                raise HTTPException(
                    status_code=422,
                    detail=f"Failed to process retinal video: {str(v_err)}"
                )
        else:
            np_arr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    else:
        raise HTTPException(
            status_code=400,
            detail="No image or video provided. Please upload a retinal fundus scan or select a demo sample."
        )
        
    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Failed to decode image or video frame. Ensure the file is valid and uncorrupted."
        )
        
    # Validate image properties
    is_valid, validation_err = validate_image(image)
    if not is_valid:
        raise HTTPException(
            status_code=422,
            detail=f"Image validation failed: {validation_err}"
        )
        
    # Run full computer vision pipeline
    try:
        pipeline_result = analyze_retinal_fundus(image)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Retinal analysis pipeline encountered an error: {str(e)}"
        )
        
    # Generate unique analysis ID
    timestamp_str = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    short_uuid = uuid.uuid4().hex[:6].upper()
    analysis_id = f"OCU-{timestamp_str}-{short_uuid}"
    
    analysis_record = {
        "success": True,
        "analysis_id": analysis_id,
        "timestamp": datetime.utcnow().isoformat(),
        "filename": original_filename,
        "metrics": pipeline_result["metrics"],
        "quality": pipeline_result["quality"],
        "summary": pipeline_result["summary"],
        "images": pipeline_result["images"],
        "dimensions": pipeline_result["dimensions"],
        "timing": pipeline_result["timing"],
        "video_info": video_info.model_dump() if video_info else None
    }
    
    # Save record to SQLite history
    try:
        save_analysis(analysis_record)
    except Exception as db_err:
        print(f"[DB Warning] Could not persist session history: {db_err}")
        
    return analysis_record


@router.get("/history", response_model=List[HistoryItem], tags=["History"])
async def get_analysis_history():
    """Retrieve list of previous retinal analysis sessions."""
    try:
        return list_analyses(limit=50)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis history: {str(e)}")


@router.get("/history/{analysis_id}", response_model=AnalysisResponse, tags=["History"])
async def get_history_detail(analysis_id: str):
    """Retrieve complete analysis details and visualizer images for a past session."""
    data = get_analysis_by_id(analysis_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Analysis session '{analysis_id}' not found")
    return data


@router.delete("/history/{analysis_id}", tags=["History"])
async def delete_history_item(analysis_id: str):
    """Delete a past analysis session."""
    success = delete_analysis(analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Analysis session '{analysis_id}' not found")
    return {"success": True, "message": f"Analysis session {analysis_id} deleted"}
