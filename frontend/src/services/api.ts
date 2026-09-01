/**
 * OcuPulse API Client Service
 */

import { AnalysisResponse, HistoryItem, DemoSampleItem } from '../types';

const API_BASE_URL = '/api';

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (err) {
    console.error('Health check failed:', err);
    return false;
  }
}

export async function getDemoSamples(): Promise<DemoSampleItem[]> {
  const res = await fetch(`${API_BASE_URL}/demo-samples`);
  if (!res.ok) {
    throw new Error('Failed to load demo retinal fundus samples');
  }
  return res.json();
}

export async function analyzeImage(
  file?: File | null,
  demoId?: string | null
): Promise<AnalysisResponse> {
  const formData = new FormData();
  
  if (demoId) {
    formData.append('demo_id', demoId);
  } else if (file) {
    formData.append('file', file);
  } else {
    throw new Error('Please select an image file or demo sample to analyze.');
  }

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = 'Analysis request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `Server responded with status ${res.status}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/history`);
  if (!res.ok) {
    throw new Error('Failed to retrieve analysis history');
  }
  return res.json();
}

export async function getHistoryDetail(analysisId: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(analysisId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load analysis record ${analysisId}`);
  }
  return res.json();
}

export async function deleteHistoryItem(analysisId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(analysisId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete record ${analysisId}`);
  }
}
