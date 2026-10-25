import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl, IS_VERCEL_WITHOUT_API } from './api';
import Navbar from './components/Navbar';
import ComparisonView from './components/ComparisonView';
import MLPredictionView from './components/MLPredictionView';
import DLPredictionView from './components/DLPredictionView';
import RulesPredictionView from './components/RulesPredictionView';
import BenchmarkView from './components/BenchmarkView';
import { AlertTriangle, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('comparison');
  const [systemHealth, setSystemHealth] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'waking_up' | 'error'
  const [retryAttempt, setRetryAttempt] = useState(0);

  const checkHealth = useCallback(() => {
    fetch(apiUrl('/api/health'))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSystemHealth(data);
        setConnectionStatus('connected');
      })
      .catch(err => {
        console.warn('Backend health check attempt failed (likely cold start or booting):', err);
        setConnectionStatus(prev => (prev === 'connected' ? 'error' : 'waking_up'));
        setRetryAttempt(c => c + 1);
      });
  }, []);

  useEffect(() => {
    checkHealth();
    // Poll health periodically or retry if waking up
    const interval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        checkHealth();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [checkHealth, connectionStatus]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
        connectionStatus={connectionStatus}
        onRetry={checkHealth}
      />

      {/* Vercel missing API URL Banner */}
      {IS_VERCEL_WITHOUT_API && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#fbbf24',
          padding: '12px 24px',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Vercel Deployment Notice:</strong> <code>VITE_API_URL</code> environment variable is not configured.
            In your Vercel Dashboard, add <code>VITE_API_URL</code> = <code>https://your-render-backend.onrender.com</code> and redeploy.
          </div>
        </div>
      )}

      {/* Render Cold-Start Standby Banner */}
      {connectionStatus === 'waking_up' && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.12)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#38bdf8',
          padding: '10px 24px',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <RefreshCw size={16} className="pulse-animation" />
          <span>
            <strong>Render Backend Waking Up:</strong> Free-tier services take 30–50s to boot on initial visit. Connecting (attempt #{retryAttempt})...
          </span>
          <button
            onClick={checkHealth}
            style={{
              background: 'rgba(6, 182, 212, 0.25)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}
          >
            Retry Now
          </button>
        </div>
      )}

      <main className="app-container" style={{ flex: 1, marginTop: '8px' }}>
        {activeTab === 'comparison' && (
          <ComparisonView onNavigateTab={(tab) => setActiveTab(tab)} connectionStatus={connectionStatus} />
        )}

        {activeTab === 'ml' && (
          <MLPredictionView connectionStatus={connectionStatus} />
        )}

        {activeTab === 'dl' && (
          <DLPredictionView connectionStatus={connectionStatus} />
        )}

        {activeTab === 'rules' && (
          <RulesPredictionView connectionStatus={connectionStatus} />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkView />
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 29, 0.95)',
        padding: '20px 28px',
        marginTop: '36px'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <strong style={{ color: '#ffffff' }}>ClinicalTriModal AI Platform</strong> — Multi-Paradigm Healthcare Intelligence
            <div style={{ marginTop: '2px' }}>
              Models: <code>disease_prediction_model.pkl</code> (ML) • <code>pneumonia_cnn_final.keras</code> (DL) • <code>j48.png</code> (Rules)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Backend: <strong>FastAPI (Python 3.12)</strong></span>
            <span>Frontend: <strong>React 18 + Vite</strong></span>
            <span>Unified Server: <strong>:8001</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
