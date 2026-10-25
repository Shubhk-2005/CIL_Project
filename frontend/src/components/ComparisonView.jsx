import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';
import { Sparkles, Cpu, Layers, GitFork, RefreshCw, BarChart2, Check, ArrowRight } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'acute_pneumonia',
    title: 'Scenario A: Acute Respiratory Infection (Pneumonia)',
    tag: 'Tri-Modal Consensus Target',
    description: 'Patient presents with severe shortness of breath, productive cough, high fever, and sharp pleuritic chest pain.',
    data: {
      symptoms: ['cough', 'breathlessness', 'high_fever', 'chills', 'chest_pain', 'phlegm', 'fatigue'],
      dyspnea: 'yes',
      polyuria: 'no',
      RT_PCR: 'not_done',
      skin_lesion: 'no',
      sample_image_id: 'sample_pneumonia.jpg'
    }
  },
  {
    id: 'diabetic_patient',
    title: 'Scenario B: Osmotic Diuresis & Fatigue (Diabetes)',
    tag: 'Metabolic vs Pulmonary',
    description: 'Patient exhibits polyuria, excessive hunger, constant thirst, and blurred vision without dyspnea.',
    data: {
      symptoms: ['polyuria', 'excessive_hunger', 'increased_appetite', 'fatigue', 'blurred_and_distorted_vision', 'lethargy'],
      dyspnea: 'no',
      polyuria: 'yes',
      RT_PCR: 'not_done',
      skin_lesion: 'no',
      sample_image_id: 'sample_normal.jpg'
    }
  },
  {
    id: 'covid_screening',
    title: 'Scenario C: Viral Screening Protocol (COVID-19)',
    tag: 'Molecular RT-PCR Rule',
    description: 'Patient with mild fever, loss of smell, and a confirmed positive RT-PCR molecular diagnostic test.',
    data: {
      symptoms: ['mild_fever', 'loss_of_smell', 'headache', 'fatigue', 'cough'],
      dyspnea: 'no',
      polyuria: 'no',
      RT_PCR: 'positive',
      skin_lesion: 'no',
      sample_image_id: 'sample_normal.jpg'
    }
  },
  {
    id: 'hypertension_case',
    title: 'Scenario D: Hypertensive Discomfort',
    tag: 'Cardiovascular Baseline',
    description: 'Patient with occipital headache, palpitations, and chest tightness; clear lungs on radiography.',
    data: {
      symptoms: ['headache', 'chest_pain', 'palpitations', 'fast_heart_rate', 'visual_disturbances'],
      dyspnea: 'no',
      polyuria: 'no',
      RT_PCR: 'not_done',
      skin_lesion: 'no',
      sample_image_id: 'sample_normal.jpg'
    }
  }
];

export default function ComparisonView({ onNavigateTab }) {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0].id);
  const [ensembleData, setEnsembleData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runEnsemble(SCENARIOS[0].data);
  }, []);

  const runEnsemble = (scenarioData) => {
    setLoading(true);
    fetch(apiUrl('/api/ensemble/predict'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData)
    })
      .then(res => res.json())
      .then(data => {
        setEnsembleData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ensemble evaluation failed:', err);
        setLoading(false);
      });
  };

  const handleScenarioChange = (scenarioId) => {
    setSelectedScenario(scenarioId);
    const scen = SCENARIOS.find(s => s.id === scenarioId);
    if (scen) {
      runEnsemble(scen.data);
    }
  };

  const currentScenario = SCENARIOS.find(s => s.id === selectedScenario);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-indigo">Unified Cross-Evaluation</span>
              <span className="badge badge-cyan">Tri-Modal Diagnostic Platform</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#ffffff' }}>
              Tri-Modal Comparator: ML vs DL vs Simple Rules
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px' }}>
              Compare how three distinct computational paradigms evaluate the exact same clinical patient case: <strong>Machine Learning</strong> (statistical symptom pattern recognition), <strong>Deep Learning</strong> (spatial convolutional computer vision), and <strong>Simple Rules</strong> (deterministic J48 decision tree).
            </p>
          </div>

          <button
            onClick={() => currentScenario && runEnsemble(currentScenario.data)}
            className="btn btn-primary"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "pulse-animation" : ""} />
            <span>{loading ? 'Evaluating...' : 'Re-Evaluate Patient'}</span>
          </button>
        </div>

        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            📋 Load Clinical Patient Case Study:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {SCENARIOS.map(sc => (
              <div
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                style={{
                  background: selectedScenario === sc.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedScenario === sc.id ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: selectedScenario === sc.id ? '#ffffff' : 'var(--text-secondary)' }}>
                    {sc.title}
                  </span>
                  {selectedScenario === sc.id && <Check size={15} color="var(--cyan-400)" />}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  {sc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ensembleData && ensembleData.consensus && (
        <div className="glass-panel" style={{
          padding: '16px 20px',
          borderLeft: ensembleData.consensus.score >= 80 ? '5px solid #10b981' : '5px solid #f59e0b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge ${ensembleData.consensus.score >= 80 ? 'badge-emerald' : 'badge-amber'}`}>
                {ensembleData.consensus.level}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Agreement Score: <strong style={{ color: '#ffffff' }}>{ensembleData.consensus.score}%</strong>
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#ffffff', marginTop: '4px', fontWeight: '600' }}>
              {ensembleData.consensus.matches.length > 0
                ? ensembleData.consensus.matches.join(' • ')
                : 'Paradigms identified complementary clinical dimensions.'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tri-Modal Latency</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--cyan-400)' }}>
              {ensembleData.total_latency_ms} ms
            </div>
          </div>
        </div>
      )}

      {/* 3 CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        
        {/* ML */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #6366f1' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-indigo">Method 1</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
                  Machine Learning
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Random Forest (59 Symptoms)</span>
              </div>
              <Cpu size={20} color="#818cf8" />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Predicted Condition</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                {ensembleData && ensembleData.ml ? ensembleData.ml.top_prediction : '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Probability:</span>
                <span style={{ color: 'var(--cyan-400)', fontWeight: '700' }}>
                  {ensembleData && ensembleData.ml ? `${ensembleData.ml.confidence}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Latency: <strong style={{ color: '#ffffff' }}>{ensembleData && ensembleData.ml ? `${ensembleData.ml.latency_ms} ms` : '—'}</strong></span>
              <span>Model: <strong style={{ color: '#38bdf8' }}>Random Forest</strong></span>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('ml')}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px', fontSize: '0.78rem' }}
              >
                Deep-Dive ML View <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* DL */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #06b6d4' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-cyan">Method 2</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
                  Deep Learning
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>31-Layer CNN (Chest X-Ray)</span>
              </div>
              <Layers size={20} color="var(--cyan-400)" />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Radiological Diagnosis</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                {ensembleData && ensembleData.dl ? ensembleData.dl.diagnosis : 'No Scan Analyzed'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Infiltrate Prob:</span>
                <span style={{ color: '#fb7185', fontWeight: '700' }}>
                  {ensembleData && ensembleData.dl ? `${(ensembleData.dl.pneumonia_probability * 100).toFixed(1)}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Latency: <strong style={{ color: '#ffffff' }}>{ensembleData && ensembleData.dl ? `${ensembleData.dl.latency_ms} ms` : '—'}</strong></span>
              <span>Explainability: <strong style={{ color: 'var(--cyan-400)' }}>Grad-CAM</strong></span>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('dl')}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px', fontSize: '0.78rem' }}
              >
                Deep-Dive DL View <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #10b981' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-emerald">Method 3</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
                  Simple Rules
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>J48 Logic Tree (j48.png)</span>
              </div>
              <GitFork size={20} color="#34d399" />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Triage Leaf Output</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                {ensembleData && ensembleData.rules ? ensembleData.rules.diagnosis : '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rule Support:</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>
                  {ensembleData && ensembleData.rules ? `${ensembleData.rules.support} (100%)` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Latency: <strong style={{ color: '#34d399' }}>{ensembleData && ensembleData.rules ? `${ensembleData.rules.latency_ms} ms` : '—'}</strong></span>
              <span>Determinism: <strong style={{ color: '#34d399' }}>100%</strong></span>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('rules')}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px', fontSize: '0.78rem' }}
              >
                Deep-Dive Rules View <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
