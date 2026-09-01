"""
OcuPulse FastAPI Backend Application
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.endpoints import router as api_router
from .database import init_db
from ..sample_data.sample_generator import ensure_sample_images

SAMPLE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "sample_data"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    print("[OcuPulse] Initializing database...")
    init_db()
    print("[OcuPulse] Ensuring benchmark sample images...")
    ensure_sample_images(SAMPLE_DIR)
    print("[OcuPulse] Backend ready!")
    yield
    # Shutdown tasks (if any)
    print("[OcuPulse] Shutting down...")


app = FastAPI(
    title="OcuPulse API",
    description="AI-Assisted Retinal Vessel Analysis, Centerline Skeletonization, and Quantitative Screening Engine",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev across any Vite/React port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global API Router
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": "OcuPulse AI Retinal Analysis Engine",
        "status": "operational",
        "docs": "/docs",
        "disclaimer": "OcuPulse is an AI-assisted screening tool, not a replacement for clinical ophthalmologist diagnosis."
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[OcuPulse Error] Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during retinal image processing. Please verify the image file and retry."
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
