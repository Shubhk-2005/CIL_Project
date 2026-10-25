import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';
import { Cpu, Search, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Filter, ChevronRight, Info, X, Zap } from 'lucide-react';

export default function MLPredictionView({ initialSymptoms = [], onSelectSymptoms }) {
  const [metadata, setMetadata] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState(initialSymptoms);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/ml/features'))
      .then(res => res.json())
      .then(data => {
        setMetadata(data);
        if (initialSymptoms.length > 0) {
          triggerPrediction(initialSymptoms);
        } else if (data.presets && data.presets.pneumonia_case) {
          const defaultSymp = data.presets.pneumonia_case.symptoms;
          setSelectedSymptoms(defaultSymp);
          triggerPrediction(defaultSymp);
        }
      })
      .catch(err => console.error('Failed to load ML metadata:', err));
  }, []);

  const triggerPrediction = (symptoms) => {
    setLoading(true);
    fetch(apiUrl('/api/ml/predict'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, top_k: 5 })
    })
      .then(res => res.json())
      .then(data => {
        setPrediction(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('ML Prediction failed:', err);
        setLoading(false);
      });
  };

  const toggleSymptom = (symp) => {
    const updated = selectedSymptoms.includes(symp)
      ? selectedSymptoms.filter(s => s !== symp)
      : [...selectedSymptoms, symp];
    setSelectedSymptoms(updated);
    if (onSelectSymptoms) onSelectSymptoms(updated);
    triggerPrediction(updated);
  };

  const applyPreset = (presetKey) => {
    if (!metadata || !metadata.presets || !metadata.presets[presetKey]) return;
    const symps = metadata.presets[presetKey].symptoms;
    setSelectedSymptoms(symps);
    if (onSelectSymptoms) onSelectSymptoms(symps);
    triggerPrediction(symps);
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
    if (onSelectSymptoms) onSelectSymptoms([]);
    triggerPrediction([]);
  };

  if (!metadata) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="pulse-animation" />
        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Loading Random Forest Diagnostic Engine...</p>
      </div>
    );
  }

  const allFeatures = metadata.features || [];
  const labels = metadata.feature_labels || {};
  const categories = metadata.categories || {};

  const filteredFeatures = allFeatures.filter(f => {
    const label = labels[f] || f;
    const matchesSearch = label.toLowerCase().includes(searchQuery.toLowerCase()) || f.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'All') return matchesSearch;
    const catList = categories[activeCategory] || [];
    return matchesSearch && catList.includes(f);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* 1. TOP TOOLBAR WITH PRESETS */}
      <div className="glass-panel" style={{ padding: '14px 20px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
            }}>
              <Cpu size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Method 1: ML Symptom Classifier
                </h2>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                  Random Forest (200 Trees)
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  59 Symptoms • 41 Diseases
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginRight: '2px' }}>
              ⚡ Presets:
            </span>
            {metadata.presets && Object.entries(metadata.presets).map(([key, p]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan-400)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                {p.name.split(':')[1]?.trim() || p.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.76rem',
              color: selectedSymptoms.length > 0 ? 'var(--cyan-400)' : 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '5px 12px',
              borderRadius: '6px',
              fontWeight: '600'
            }}>
              {selectedSymptoms.length} / 59 Active
            </span>
            {selectedSymptoms.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fb7185',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => triggerPrediction(selectedSymptoms)}
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <RefreshCw size={13} className={loading ? "pulse-animation" : ""} />
              <span>{loading ? 'Evaluating...' : 'Predict'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. TOP SECTION: SELECT SYMPTOMS */}
      <div className="glass-panel" style={{ padding: '18px 20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            flex: 1
          }}>
            {['All', ...Object.keys(categories)].map(cat => {
              const count = cat === 'All' ? allFeatures.length : (categories[cat] ? categories[cat].length : 0);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? '700' : '500',
                    border: isActive ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                    background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? 'var(--cyan-400)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: '0.64rem',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(6, 182, 212, 0.35)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: '220px', flexShrink: 0 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Search symptom..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <X
                size={13}
                color="var(--text-muted)"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '10px', cursor: 'pointer' }}
              />
            )}
          </div>
        </div>

        {selectedSymptoms.length > 0 && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--cyan-400)', fontWeight: '700', whiteSpace: 'nowrap' }}>
              SELECTED ({selectedSymptoms.length}):
            </span>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'nowrap' }}>
              {selectedSymptoms.map(s => (
                <span
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    background: 'rgba(6, 182, 212, 0.22)',
                    color: '#e0f2fe',
                    cursor: 'pointer',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    whiteSpace: 'nowrap'
                  }}
                  title="Click to remove"
                >
                  {labels[s] || s}
                  <span style={{ fontWeight: '800', marginLeft: '1px', fontSize: '11px' }}>×</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '8px',
          maxHeight: '250px',
          overflowY: 'auto',
          paddingRight: '6px',
          width: '100%'
        }}>
          {filteredFeatures.map(f => {
            const isSelected = selectedSymptoms.includes(f);
            const label = labels[f] || f;
            return (
              <div
                key={f}
                onClick={() => toggleSymptom(f)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: isSelected ? '2px solid var(--cyan-400)' : '2px solid #475569',
                  background: isSelected ? 'var(--cyan-400)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isSelected && <span style={{ color: '#090d16', fontSize: '11px', fontWeight: '900' }}>✓</span>}
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isSelected ? '600' : '400',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }} title={label}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* 3. BOTTOM SECTION: THE ML PREDICTION OUTPUT (LOCATED DIRECTLY BELOW SELECT SYMPTOMS) */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        width: '100%',
        borderTop: '3px solid #6366f1',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--cyan-400)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
              ML Diagnostic Prediction Results
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div>Inference Time: <strong style={{ color: 'var(--cyan-400)' }}>{prediction ? `${prediction.latency_ms} ms` : '—'}</strong></div>
            <div>Active Symptoms Evaluated: <strong style={{ color: '#ffffff' }}>{prediction ? prediction.total_active : 0}</strong></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px' }}>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                    Primary Condition Predicted
                  </span>
                  <h4 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginTop: '4px', letterSpacing: '-0.02em' }}>
                    {prediction ? prediction.top_prediction : 'Select Symptoms Above'}
                  </h4>
                </div>
                {prediction && (
                  <span className={`badge ${
                    prediction.risk_level === 'High' ? 'badge-rose' :
                    prediction.risk_level === 'Moderate' ? 'badge-amber' : 'badge-emerald'
                  }`}>
                    {prediction.risk_level} Risk Tier
                  </span>
                )}
              </div>

              {prediction && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Calculated Model Confidence:</span>
                    <span style={{ color: 'var(--cyan-400)', fontWeight: '700' }}>{prediction.confidence}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${prediction.confidence}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <Info size={14} color="#818cf8" style={{ flexShrink: 0 }} />
              <span>Random Forest Classifier (200 Estimators) • Calibrated across 41 classes</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Top 5 Differential Diagnosis Likelihoods:
            </div>

            {prediction && prediction.top_predictions && prediction.top_predictions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prediction.top_predictions.map((p, idx) => (
                  <div key={p.disease} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: idx === 0 ? '#ffffff' : 'var(--text-secondary)', fontWeight: idx === 0 ? '700' : '500' }}>
                        #{p.rank} {p.disease}
                      </span>
                      <span style={{ color: idx === 0 ? 'var(--cyan-400)' : 'var(--text-muted)', fontWeight: '700' }}>
                        {p.confidence_percent}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, p.confidence_percent)}%`,
                        height: '100%',
                        background: idx === 0 ? 'linear-gradient(90deg, #06b6d4, #3b82f6)' : 'rgba(255, 255, 255, 0.25)',
                        borderRadius: '3px',
                        transition: 'width 0.35s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Select symptoms above to view differential probabilities.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
