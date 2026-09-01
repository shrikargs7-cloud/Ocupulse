"""
Integration tests for OcuPulse FastAPI Web Service
"""

import io
import os
import cv2
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.sample_data.sample_generator import generate_synthetic_fundus, ensure_sample_images

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_samples():
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data")
    ensure_sample_images(sample_dir)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "OcuPulse"


def test_demo_samples_list():
    response = client.get("/api/demo-samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 3
    assert any(s["id"] == "demo_normal" for s in samples)


def test_analyze_demo_id():
    response = client.post("/api/analyze", data={"demo_id": "demo_normal"})
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] is True
    assert "analysis_id" in data
    assert "metrics" in data
    assert "vessel_density" in data["metrics"]
    assert "branch_points" in data["metrics"]
    assert "quality" in data["quality"] if "quality" in data["quality"] else "score" in data["quality"]
    assert "images" in data
    assert "original" in data["images"]
    assert "vessel_mask" in data["images"]


def test_analyze_uploaded_file():
    img = generate_synthetic_fundus(width=350, height=350, sample_type="normal", seed=99)
    _, buffer = cv2.imencode('.png', img)
    file_bytes = io.BytesIO(buffer.tobytes())
    
    response = client.post(
        "/api/analyze",
        files={"file": ("test_retina.png", file_bytes, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["filename"] == "test_retina.png"


def test_invalid_file_handling():
    # Text file masquerading as image
    fake_file = io.BytesIO(b"Not an image at all!")
    response = client.post(
        "/api/analyze",
        files={"file": ("fake.txt", fake_file, "text/plain")}
    )
    assert response.status_code == 400
    
    # Empty request
    response_empty = client.post("/api/analyze")
    assert response_empty.status_code == 400


def test_history_endpoints():
    # First analyze something
    client.post("/api/analyze", data={"demo_id": "demo_normal"})
    
    # Check history list
    response = client.get("/api/history")
    assert response.status_code == 200
    history = response.json()
    assert len(history) > 0
    
    first_id = history[0]["analysis_id"]
    
    # Retrieve detail
    detail_res = client.get(f"/api/history/{first_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["analysis_id"] == first_id


def test_analyze_uploaded_video():
    import tempfile
    
    # Create a 1-second synthetic video in tempfile
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name
        
    try:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(tmp_path, fourcc, 10.0, (300, 300))
        fundus_frame = generate_synthetic_fundus(width=300, height=300, sample_type="normal", seed=77)
        for _ in range(10):
            out.write(fundus_frame)
        out.release()
        
        with open(tmp_path, "rb") as vf:
            video_bytes = vf.read()
            
        response = client.post(
            "/api/analyze",
            files={"file": ("retinal_angiography_scan.mp4", io.BytesIO(video_bytes), "video/mp4")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["video_info"] is not None
        assert data["video_info"]["is_video"] is True
        assert data["video_info"]["total_frames"] >= 10
        assert data["metrics"]["vessel_density"] > 0
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
