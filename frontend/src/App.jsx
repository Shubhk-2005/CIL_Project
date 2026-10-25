import React, { useState, useEffect } from 'react';
import { apiUrl } from './api';
import Navbar from './components/Navbar';
import ComparisonView from './components/ComparisonView';
import MLPredictionView from './components/MLPredictionView';
import DLPredictionView from './components/DLPredictionView';
import RulesPredictionView from './components/RulesPredictionView';
import BenchmarkView from './components/BenchmarkView';

export default function App() {
  const [activeTab, setActiveTab] = useState('comparison');
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then(res => res.json())
      .then(data => setSystemHealth(data))
      .catch(err => console.error('Health check failed:', err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      <main className="app-container" style={{ flex: 1, marginTop: '8px' }}>
        {activeTab === 'comparison' && (
          <ComparisonView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'ml' && (
          <MLPredictionView />
        )}

        {activeTab === 'dl' && (
          <DLPredictionView />
        )}

        {activeTab === 'rules' && (
          <RulesPredictionView />
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
            <span>Unified Server: <strong>:8000</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
