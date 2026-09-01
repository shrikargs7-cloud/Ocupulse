"""
OcuPulse SQLite Database Persistence Module

Stores anonymized analysis session history and quantitative metrics
without retaining permanent identifying patient records.
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "oculpulse.db")


def get_db_connection() -> sqlite3.Connection:
    """Create and return a SQLite database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize SQLite database tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        analysis_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        filename TEXT NOT NULL,
        quality_score REAL NOT NULL,
        quality_label TEXT NOT NULL,
        vessel_density REAL NOT NULL,
        vessel_area INTEGER NOT NULL,
        vessel_length_pixels REAL NOT NULL,
        branch_points INTEGER NOT NULL,
        endpoints INTEGER NOT NULL,
        skeleton_density REAL NOT NULL,
        average_vessel_width_px REAL NOT NULL,
        fractal_dimension REAL NOT NULL,
        summary_headline TEXT NOT NULL,
        full_summary TEXT NOT NULL,
        thumbnail_base64 TEXT,
        details_json TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()


def save_analysis(analysis_data: Dict[str, Any]) -> str:
    """
    Save an analysis session record into SQLite.
    
    Args:
        analysis_data: Complete dictionary containing analysis_id, metrics, images, quality, summary
        
    Returns:
        The analysis_id
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    analysis_id = analysis_data["analysis_id"]
    timestamp = analysis_data.get("timestamp", datetime.utcnow().isoformat())
    filename = analysis_data.get("filename", "retinal_image.png")
    
    metrics = analysis_data["metrics"]
    quality = analysis_data["quality"]
    summary = analysis_data["summary"]
    images = analysis_data.get("images", {})
    
    # Use original or enhanced image as thumbnail (or store full data)
    thumbnail = images.get("original", "")[:4000] if images.get("original") else ""
    
    # Store complete analysis result as JSON for 1-click restore in history
    details_json = json.dumps(analysis_data)
    
    cursor.execute("""
    INSERT OR REPLACE INTO analyses (
        analysis_id, timestamp, filename, quality_score, quality_label,
        vessel_density, vessel_area, vessel_length_pixels, branch_points,
        endpoints, skeleton_density, average_vessel_width_px, fractal_dimension,
        summary_headline, full_summary, thumbnail_base64, details_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        analysis_id,
        timestamp,
        filename,
        quality["score"],
        quality["label"],
        metrics["vessel_density"],
        metrics["vessel_area"],
        metrics["vessel_length_pixels"],
        metrics["branch_points"],
        metrics["endpoints"],
        metrics["skeleton_density"],
        metrics.get("average_vessel_width_px", 0.0),
        metrics.get("fractal_dimension", 1.45),
        summary.get("headline", "Retinal Analysis Complete"),
        summary.get("full_text", ""),
        thumbnail,
        details_json
    ))
    
    conn.commit()
    conn.close()
    return analysis_id


def list_analyses(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve list of recent analyses for the history dashboard."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT analysis_id, timestamp, filename, quality_score, quality_label,
           vessel_density, vessel_area, vessel_length_pixels, branch_points,
           endpoints, skeleton_density, average_vessel_width_px, fractal_dimension,
           summary_headline, thumbnail_base64
    FROM analyses
    ORDER BY timestamp DESC
    LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results


def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve full analysis result by analysis_id."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT details_json FROM analyses WHERE analysis_id = ?
    """, (analysis_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row and row["details_json"]:
        return json.loads(row["details_json"])
    return None


def delete_analysis(analysis_id: str) -> bool:
    """Delete an analysis record from SQLite."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM analyses WHERE analysis_id = ?", (analysis_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
