/**
 * Centralized API configuration for ClinicalTriModal AI Platform.
 * Supports:
 * 1. Unified local/monolithic mode: VITE_API_URL is empty, uses relative '/api/...'
 * 2. Split Vercel + Render mode: VITE_API_URL points to 'https://<your-backend>.onrender.com'
 */

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(endpoint) {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${clean}`;
}
