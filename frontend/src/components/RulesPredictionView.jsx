import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';
import { GitFork, CheckCircle2, ArrowRight, Zap, RefreshCw, FileText, Image as ImageIcon, ShieldCheck, Info } from 'lucide-react';

export default function RulesPredictionView({ initialInputs, onInputsChange }) {
  const [metadata, setMetadata] = useState(null);
  const [inputs, setInputs] = useState(initialInputs || {
    dyspnea: 'yes',
    polyuria: 'no',
    RT_PCR: 'not_done',
    skin_lesion: 'no'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/rules/info'))
      .then(res => res.json())
      .then(data => {
        setMetadata(data);
        evaluateRules(inputs);
      })
      .catch(err => console.error('Failed to load rules metadata:', err));
  }, []);

  const evaluateRules = (currentInputs) => {
    setLoading(true);
    fetch(apiUrl('/api/rules/predict'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentInputs)
    })
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Rules evaluation failed:', err);
        setLoading(false);
      });
  };

  const handleInputChange = (field, value) => {
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    if (onInputsChange) onInputsChange(updated);
    evaluateRules(updated);
  };

  const applyPreset = (presetKey) => {
    if (!metadata || !metadata.presets || !metadata.presets[presetKey]) return;
    const p = metadata.presets[presetKey];
    const newInputs = {
      dyspnea: p.dyspnea,
      polyuria: p.polyuria,
      RT_PCR: p.RT_PCR,
      skin_lesion: p.skin_lesion
    };
    setInputs(newInputs);
    if (onInputsChange) onInputsChange(newInputs);
    evaluateRules(newInputs);
  };

  const activeNodes = result ? result.active_nodes : [];
  const activeEdges = result ? result.active_edges : [];

  const isNodeActive = (id) => activeNodes.includes(id);
  const isEdgeActive = (id) => activeEdges.includes(id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-emerald">Method 3: Simple Rules</span>
              <span className="badge badge-indigo">J48 / C4.5 Decision Tree</span>
              <span className="badge badge-cyan">100% Deterministic & Auditable</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
              J48 Clinical Decision Tree Rule Engine
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '780px', marginTop: '4px' }}>
              Directly synthesized from the verified clinical triage tree diagram (<strong>j48.png</strong>). Evaluates deterministic conditional branches across respiratory, metabolic, molecular, and dermatological decision boundaries with zero black-box opacity.
            </p>
          </div>

          <button
            onClick={() => setShowOriginalImage(!showOriginalImage)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <ImageIcon size={15} />
            <span>{showOriginalImage ? 'Hide Original j48.png' : 'View Original j48.png'}</span>
          </button>
        </div>

        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            ⚡ One-Click Decision Tree Presets:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {metadata && metadata.presets && Object.entries(metadata.presets).map(([k, p]) => (
              <button
                key={k}
                onClick={() => applyPreset(k)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.name} → <strong>{p.expected}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showOriginalImage && (
        <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>Original J48 Decision Tree Specification (j48.png)</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>C4.5 Tree Output from Repository</span>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
            <img src="/j48.png" alt="Original J48 Tree" style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={18} color="var(--emerald-500)" />
              Clinical Triage Input Parameters
            </h3>

            {/* Input 1: Dyspnea */}
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: isNodeActive('dyspnea') ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
              background: isNodeActive('dyspnea') ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                  1. Dyspnea (Shortness of Breath)
                </label>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>Root Node</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['yes', 'no'].map(val => (
                  <button
                    key={val}
                    onClick={() => handleInputChange('dyspnea', val)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      border: inputs.dyspnea === val ? '1px solid #06b6d4' : '1px solid var(--border-subtle)',
                      background: inputs.dyspnea === val ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255, 255, 255, 0.04)',
                      color: inputs.dyspnea === val ? '#ffffff' : 'var(--text-secondary)',
                      textTransform: 'uppercase'
                    }}
                  >
                    = {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Polyuria */}
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: isNodeActive('polyuria') ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
              background: isNodeActive('polyuria') ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              opacity: inputs.dyspnea === 'yes' ? 0.45 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                  2. Polyuria (Excessive Urination)
                </label>
                <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>Level 1 Branch</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['yes', 'no'].map(val => (
                  <button
                    key={val}
                    onClick={() => handleInputChange('polyuria', val)}
                    disabled={inputs.dyspnea === 'yes'}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: inputs.dyspnea === 'yes' ? 'not-allowed' : 'pointer',
                      border: inputs.polyuria === val ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
                      background: inputs.polyuria === val ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.04)',
                      color: inputs.polyuria === val ? '#ffffff' : 'var(--text-secondary)',
                      textTransform: 'uppercase'
                    }}
                  >
                    = {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: RT-PCR */}
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: isNodeActive('RT_PCR') ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
              background: isNodeActive('RT_PCR') ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              opacity: (inputs.dyspnea === 'yes' || inputs.polyuria === 'yes') ? 0.45 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                  3. RT-PCR Viral Status
                </label>
                <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>Level 2 Branch</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'positive', label: 'Positive', color: '#8b5cf6' },
                  { id: 'negative', label: 'Negative', color: '#10b981' },
                  { id: 'not_done', label: 'Not Done', color: '#64748b' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleInputChange('RT_PCR', item.id)}
                    disabled={inputs.dyspnea === 'yes' || inputs.polyuria === 'yes'}
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.76rem',
                      cursor: (inputs.dyspnea === 'yes' || inputs.polyuria === 'yes') ? 'not-allowed' : 'pointer',
                      border: inputs.RT_PCR === item.id ? `1px solid ${item.color}` : '1px solid var(--border-subtle)',
                      background: inputs.RT_PCR === item.id ? item.color : 'rgba(255, 255, 255, 0.04)',
                      color: inputs.RT_PCR === item.id ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    = {item.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 4: Skin Lesion */}
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: isNodeActive('skin_lesion') ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
              background: isNodeActive('skin_lesion') ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              opacity: (inputs.dyspnea === 'yes' || inputs.polyuria === 'yes' || inputs.RT_PCR !== 'not_done') ? 0.45 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                  4. Skin Lesion (Dermatosis)
                </label>
                <span className="badge badge-rose" style={{ fontSize: '0.62rem' }}>Level 3 Branch</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['yes', 'no'].map(val => (
                  <button
                    key={val}
                    onClick={() => handleInputChange('skin_lesion', val)}
                    disabled={inputs.dyspnea === 'yes' || inputs.polyuria === 'yes' || inputs.RT_PCR !== 'not_done'}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: (inputs.dyspnea === 'yes' || inputs.polyuria === 'yes' || inputs.RT_PCR !== 'not_done') ? 'not-allowed' : 'pointer',
                      border: inputs.skin_lesion === val ? '1px solid #ec4899' : '1px solid var(--border-subtle)',
                      background: inputs.skin_lesion === val ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'rgba(255, 255, 255, 0.04)',
                      color: inputs.skin_lesion === val ? '#ffffff' : 'var(--text-secondary)',
                      textTransform: 'uppercase'
                    }}
                  >
                    = {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{
            padding: '20px',
            borderLeft: result ? `5px solid ${result.badge_color || '#10b981'}` : '5px solid #10b981'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  J48 Triage Leaf Outcome
                </span>
                <h3 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginTop: '3px' }}>
                  {result ? result.diagnosis : 'Calculating...'}
                </h3>
              </div>
              {result && (
                <span className="badge badge-emerald">
                  Support: {result.support} (100%)
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Severity Level: <strong style={{ color: result ? result.badge_color : '#ffffff' }}>{result ? result.severity : '—'}</strong>
            </p>

            {result && (
              <div style={{
                marginTop: '14px',
                padding: '10px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: '#38bdf8',
                lineHeight: '1.4'
              }}>
                {result.rule_expression}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--emerald-500)" />
              Live Visual Tree Traversal (j48 Diagram)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Active Path Illuminated
            </span>
          </div>

          <div style={{
            background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            padding: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '440px'
          }}>
            <svg viewBox="0 0 760 520" style={{ width: '100%', height: 'auto', maxHeight: '480px' }}>
              <defs>
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* EDGES */}
              <line
                x1="220" y1="50" x2="80" y2="150"
                stroke={isEdgeActive('dyspnea->yes') ? '#06b6d4' : '#475569'}
                strokeWidth={isEdgeActive('dyspnea->yes') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('dyspnea->yes') ? '6 3' : 'none'}
                filter={isEdgeActive('dyspnea->yes') ? 'url(#glow-cyan)' : 'none'}
              />
              <text x="120" y="95" fill={isEdgeActive('dyspnea->yes') ? '#38bdf8' : '#94a3b8'} fontSize="13" fontWeight="700">= yes</text>

              <line
                x1="220" y1="50" x2="360" y2="150"
                stroke={isEdgeActive('dyspnea->no') ? '#06b6d4' : '#475569'}
                strokeWidth={isEdgeActive('dyspnea->no') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('dyspnea->no') ? '6 3' : 'none'}
                filter={isEdgeActive('dyspnea->no') ? 'url(#glow-cyan)' : 'none'}
              />
              <text x="295" y="95" fill={isEdgeActive('dyspnea->no') ? '#38bdf8' : '#94a3b8'} fontSize="13" fontWeight="700">= no</text>

              <line
                x1="360" y1="150" x2="220" y2="250"
                stroke={isEdgeActive('polyuria->yes') ? '#f59e0b' : '#475569'}
                strokeWidth={isEdgeActive('polyuria->yes') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('polyuria->yes') ? '6 3' : 'none'}
              />
              <text x="270" y="195" fill={isEdgeActive('polyuria->yes') ? '#fbbf24' : '#94a3b8'} fontSize="13" fontWeight="700">= yes</text>

              <line
                x1="360" y1="150" x2="500" y2="250"
                stroke={isEdgeActive('polyuria->no') ? '#06b6d4' : '#475569'}
                strokeWidth={isEdgeActive('polyuria->no') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('polyuria->no') ? '6 3' : 'none'}
                filter={isEdgeActive('polyuria->no') ? 'url(#glow-cyan)' : 'none'}
              />
              <text x="435" y="195" fill={isEdgeActive('polyuria->no') ? '#38bdf8' : '#94a3b8'} fontSize="13" fontWeight="700">= no</text>

              <line
                x1="500" y1="250" x2="220" y2="350"
                stroke={isEdgeActive('RT_PCR->positive') ? '#8b5cf6' : '#475569'}
                strokeWidth={isEdgeActive('RT_PCR->positive') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('RT_PCR->positive') ? '6 3' : 'none'}
              />
              <text x="310" y="300" fill={isEdgeActive('RT_PCR->positive') ? '#a78bfa' : '#94a3b8'} fontSize="13" fontWeight="700">= positive</text>

              <line
                x1="500" y1="250" x2="500" y2="350"
                stroke={isEdgeActive('RT_PCR->negative') ? '#10b981' : '#475569'}
                strokeWidth={isEdgeActive('RT_PCR->negative') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('RT_PCR->negative') ? '6 3' : 'none'}
              />
              <text x="508" y="300" fill={isEdgeActive('RT_PCR->negative') ? '#34d399' : '#94a3b8'} fontSize="13" fontWeight="700">= negative</text>

              <line
                x1="500" y1="250" x2="650" y2="350"
                stroke={isEdgeActive('RT_PCR->not_done') ? '#06b6d4' : '#475569'}
                strokeWidth={isEdgeActive('RT_PCR->not_done') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('RT_PCR->not_done') ? '6 3' : 'none'}
                filter={isEdgeActive('RT_PCR->not_done') ? 'url(#glow-cyan)' : 'none'}
              />
              <text x="585" y="295" fill={isEdgeActive('RT_PCR->not_done') ? '#38bdf8' : '#94a3b8'} fontSize="13" fontWeight="700">= not_done</text>

              <line
                x1="650" y1="350" x2="550" y2="450"
                stroke={isEdgeActive('skin_lesion->yes') ? '#ec4899' : '#475569'}
                strokeWidth={isEdgeActive('skin_lesion->yes') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('skin_lesion->yes') ? '6 3' : 'none'}
              />
              <text x="575" y="395" fill={isEdgeActive('skin_lesion->yes') ? '#f472b6' : '#94a3b8'} fontSize="13" fontWeight="700">= yes</text>

              <line
                x1="650" y1="350" x2="710" y2="450"
                stroke={isEdgeActive('skin_lesion->no') ? '#3b82f6' : '#475569'}
                strokeWidth={isEdgeActive('skin_lesion->no') ? '3.5' : '1.5'}
                strokeDasharray={isEdgeActive('skin_lesion->no') ? '6 3' : 'none'}
              />
              <text x="690" y="395" fill={isEdgeActive('skin_lesion->no') ? '#60a5fa' : '#94a3b8'} fontSize="13" fontWeight="700">= no</text>

              {/* NODES */}
              <g transform="translate(220, 50)">
                <ellipse rx="55" ry="24" fill={isNodeActive('dyspnea') ? 'rgba(6, 182, 212, 0.3)' : 'rgba(100, 116, 139, 0.4)'} stroke={isNodeActive('dyspnea') ? '#06b6d4' : '#64748b'} strokeWidth={isNodeActive('dyspnea') ? '3' : '1.5'} />
                <text textAnchor="middle" dy="5" fill="#ffffff" fontSize="13" fontWeight="700">dyspnea</text>
              </g>

              <g transform="translate(360, 150)">
                <ellipse rx="52" ry="24" fill={isNodeActive('polyuria') ? 'rgba(6, 182, 212, 0.3)' : 'rgba(100, 116, 139, 0.4)'} stroke={isNodeActive('polyuria') ? '#06b6d4' : '#64748b'} strokeWidth={isNodeActive('polyuria') ? '3' : '1.5'} />
                <text textAnchor="middle" dy="5" fill="#ffffff" fontSize="13" fontWeight="700">polyuria</text>
              </g>

              <g transform="translate(500, 250)">
                <ellipse rx="55" ry="24" fill={isNodeActive('RT_PCR') ? 'rgba(6, 182, 212, 0.3)' : 'rgba(100, 116, 139, 0.4)'} stroke={isNodeActive('RT_PCR') ? '#06b6d4' : '#64748b'} strokeWidth={isNodeActive('RT_PCR') ? '3' : '1.5'} />
                <text textAnchor="middle" dy="5" fill="#ffffff" fontSize="13" fontWeight="700">RT_PCR</text>
              </g>

              <g transform="translate(650, 350)">
                <ellipse rx="54" ry="24" fill={isNodeActive('skin_lesion') ? 'rgba(6, 182, 212, 0.3)' : 'rgba(100, 116, 139, 0.4)'} stroke={isNodeActive('skin_lesion') ? '#06b6d4' : '#64748b'} strokeWidth={isNodeActive('skin_lesion') ? '3' : '1.5'} />
                <text textAnchor="middle" dy="5" fill="#ffffff" fontSize="13" fontWeight="700">skin_lesion</text>
              </g>

              {/* LEAVES */}
              <g transform="translate(30, 130)">
                <rect width="105" height="34" rx="4" fill={isNodeActive('pneumonia_leaf') ? 'rgba(239, 68, 68, 0.35)' : 'rgba(100, 116, 139, 0.3)'} stroke={isNodeActive('pneumonia_leaf') ? '#ef4444' : '#64748b'} strokeWidth={isNodeActive('pneumonia_leaf') ? '3' : '1'} />
                <text x="52" y="22" textAnchor="middle" fill={isNodeActive('pneumonia_leaf') ? '#fca5a5' : '#cbd5e1'} fontSize="12" fontWeight="700">pneumonia (5.0)</text>
              </g>

              <g transform="translate(170, 230)">
                <rect width="95" height="34" rx="4" fill={isNodeActive('diabetes_leaf') ? 'rgba(245, 158, 11, 0.35)' : 'rgba(100, 116, 139, 0.3)'} stroke={isNodeActive('diabetes_leaf') ? '#f59e0b' : '#64748b'} strokeWidth={isNodeActive('diabetes_leaf') ? '3' : '1'} />
                <text x="47" y="22" textAnchor="middle" fill={isNodeActive('diabetes_leaf') ? '#fde68a' : '#cbd5e1'} fontSize="12" fontWeight="700">diabetes (5.0)</text>
              </g>

              <g transform="translate(170, 330)">
                <rect width="95" height="34" rx="4" fill={isNodeActive('covid19_leaf') ? 'rgba(139, 92, 246, 0.35)' : 'rgba(100, 116, 139, 0.3)'} stroke={isNodeActive('covid19_leaf') ? '#8b5cf6' : '#64748b'} strokeWidth={isNodeActive('covid19_leaf') ? '3' : '1'} />
                <text x="47" y="22" textAnchor="middle" fill={isNodeActive('covid19_leaf') ? '#ddd6fe' : '#cbd5e1'} fontSize="12" fontWeight="700">covid19 (5.0)</text>
              </g>

              <g transform="translate(455, 330)">
                <rect width="90" height="34" rx="4" fill={isNodeActive('none_leaf') ? 'rgba(16, 185, 129, 0.35)' : 'rgba(100, 116, 139, 0.3)'} stroke={isNodeActive('none_leaf') ? '#10b981' : '#64748b'} strokeWidth={isNodeActive('none_leaf') ? '3' : '1'} />
                <text x="45" y="22" textAnchor="middle" fill={isNodeActive('none_leaf') ? '#a7f3d0' : '#cbd5e1'} fontSize="12" fontWeight="700">none (5.0)</text>
              </g>

              <g transform="translate(490, 435)">
                <rect width="130" height="34" rx="4" fill={isNodeActive('skin_condition_leaf') ? 'rgba(236, 72, 153, 0.35)' : 'rgba(100, 116, 139, 0.3)'} stroke={isNodeActive('skin_condition_leaf') ? '#ec4899' : '#64748b'} strokeWidth={isNodeActive('skin_condition_leaf') ? '3' : '1'} />
                <text x="65" y="22" textAnchor="middle" fill={isNodeActive('skin_condition_leaf') ? '#fbcfe8' : '#cbd5e1'} fontSize="12" fontWeight="700">skin_condition (5.0)</text>
              </g>

              <g transform="translate(640, 435)">
                <rect width="115" height="34" rx="4" fill={isNodeActive('hypertension_leaf') ? 'rgba(59, 130, 246, 0.35)' : 'rgba(100, 116, 139, 0.3)'} stroke={isNodeActive('hypertension_leaf') ? '#3b82f6' : '#64748b'} strokeWidth={isNodeActive('hypertension_leaf') ? '3' : '1'} />
                <text x="57" y="22" textAnchor="middle" fill={isNodeActive('hypertension_leaf') ? '#bfdbfe' : '#cbd5e1'} fontSize="12" fontWeight="700">hypertension (5.0)</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
