import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';
import { Layers, UploadCloud, Eye, Sliders, AlertCircle, CheckCircle, RefreshCw, Activity, Image as ImageIcon, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function DLPredictionView({ initialSample = 'sample_pneumonia.jpg', onPredictionUpdate }) {
  const [samples, setSamples] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [selectedSample, setSelectedSample] = useState(initialSample);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/dl/samples'))
      .then(res => res.json())
      .then(data => {
        setSamples(data);
        if (data.length > 0 && !selectedSample) {
          setSelectedSample(data[0].id);
          runSamplePrediction(data[0].id);
        } else if (selectedSample) {
          runSamplePrediction(selectedSample);
        }
      })
      .catch(err => console.error('Failed to load DL samples:', err));

    fetch(apiUrl('/api/dl/info'))
      .then(res => res.json())
      .then(data => setModelInfo(data))
      .catch(err => console.error('Failed to load DL model info:', err));
  }, []);

  const runSamplePrediction = (sampleId) => {
    setLoading(true);
    setSelectedSample(sampleId);
    setUploadedFile(null);
    setPreviewUrl(null);

    const formData = new FormData();
    formData.append('sample_id', sampleId);

    fetch(apiUrl('/api/dl/predict'), {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setPrediction(data);
        setLoading(false);
        if (onPredictionUpdate) onPredictionUpdate(data);
      })
      .catch(err => {
        console.error('DL Prediction error:', err);
        setLoading(false);
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setSelectedSample(null);
    setPreviewUrl(URL.createObjectURL(file));

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch(apiUrl('/api/dl/predict'), {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setPrediction(data);
        setLoading(false);
        if (onPredictionUpdate) onPredictionUpdate(data);
      })
      .catch(err => {
        console.error('File prediction failed:', err);
        setLoading(false);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-cyan">Method 2: Deep Learning</span>
              <span className="badge badge-indigo">Chest Radiograph CNN</span>
              <span className="badge badge-emerald">Grad-CAM Heatmap</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
              Deep Convolutional Neural Network Vision Diagnostic
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '780px', marginTop: '4px' }}>
              Trained on chest radiography with <strong>31 functional neural layers</strong> (SpatialDropout, Conv2D, GlobalAveragePooling, Dense). Localizes pulmonary opacities and alveolar consolidations with Class Activation Heatmaps.
            </p>
          </div>

          <button
            onClick={() => setShowLayers(!showLayers)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <Info size={16} />
            <span>{showLayers ? 'Hide Architecture' : 'Inspect 31 Layers'}</span>
            {showLayers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            🔬 Select Preset Radiograph or Upload Patient Scan:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => runSamplePrediction(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: selectedSample === s.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedSample === s.id ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  color: selectedSample === s.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: selectedSample === s.id ? '700' : '500',
                  fontSize: '0.8rem'
                }}
              >
                <ImageIcon size={15} color={selectedSample === s.id ? 'var(--cyan-400)' : 'var(--text-muted)'} />
                <span>{s.label} ({s.filename})</span>
              </button>
            ))}

            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px dashed rgba(99, 102, 241, 0.5)',
              color: '#818cf8',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              <UploadCloud size={15} />
              <span>Upload Custom X-Ray Scan</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      {showLayers && modelInfo && (
        <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
              Neural Network Architecture (31 Layers Deep)
            </h4>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div>Total Parameters: <strong style={{ color: 'var(--cyan-400)' }}>{modelInfo.total_parameters}</strong></div>
              <div>Trainable: <strong style={{ color: '#34d399' }}>{modelInfo.trainable_parameters}</strong></div>
              <div>Resolution: <strong style={{ color: '#ffffff' }}>224×224×3</strong></div>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '6px',
            maxHeight: '240px',
            overflowY: 'auto'
          }}>
            {modelInfo.layers.map((l, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '5px 8px',
                fontSize: '0.74rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>#{i+1} {l.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{l.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--cyan-400)" />
              Frontal Chest Radiograph Analysis
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={e => setShowHeatmap(e.target.checked)}
              />
              <span>Grad-CAM Activation Map</span>
            </label>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            background: '#000000',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--cyan-400)' }}>
                <RefreshCw size={32} className="pulse-animation" />
                <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Running Deep CNN Inference...</p>
              </div>
            ) : prediction ? (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={showHeatmap && prediction.heatmap_image ? prediction.heatmap_image : prediction.original_image}
                  alt="Chest Radiograph"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '3px 7px', borderRadius: '4px', fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  SCAN: CHEST PA | 224x224
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '3px 7px', borderRadius: '4px', fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  LAYER: conv2d_3
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No image loaded</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{
            padding: '20px',
            borderLeft: prediction && prediction.diagnosis === 'PNEUMONIA' ? '4px solid #f43f5e' : '4px solid #10b981'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  DL Radiological Finding
                </span>
                <h3 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginTop: '3px' }}>
                  {prediction ? prediction.diagnosis : 'Awaiting Input'}
                </h3>
              </div>
              {prediction && (
                <span className={`badge ${prediction.diagnosis === 'PNEUMONIA' ? 'badge-rose' : 'badge-emerald'}`}>
                  {prediction.risk_tier}
                </span>
              )}
            </div>

            {prediction && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pneumonia Infiltrates Likelihood:</span>
                    <span style={{ color: prediction.diagnosis === 'PNEUMONIA' ? '#fb7185' : 'var(--text-muted)', fontWeight: '700' }}>
                      {(prediction.pneumonia_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${prediction.pneumonia_probability * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f43f5e, #fb7185)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Normal / Clear Lungs Likelihood:</span>
                    <span style={{ color: prediction.diagnosis === 'NORMAL' ? '#34d399' : 'var(--text-muted)', fontWeight: '700' }}>
                      {(prediction.normal_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${prediction.normal_probability * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <div>Inference Latency: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{prediction ? `${prediction.latency_ms} ms` : '—'}</span></div>
              <div>Input: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>224×224×3 RGB</span></div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--cyan-400)" />
              Automated Radiological Interpretation
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {prediction ? prediction.clinical_finding : 'Load a scan to generate interpretation report.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
