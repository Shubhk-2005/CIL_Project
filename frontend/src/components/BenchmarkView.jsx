import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, Layers, GitFork } from 'lucide-react';

export default function BenchmarkView() {
  const dimensions = [
    { label: 'Interpretability & Clinical Audit', rules: 100, ml: 78, dl: 62 },
    { label: 'Inference Speed (< 1ms)', rules: 99, ml: 92, dl: 58 },
    { label: 'High-Dimensional Modality (Images)', rules: 10, ml: 30, dl: 98 },
    { label: 'Resilience to Missing Inputs', rules: 65, ml: 88, dl: 82 },
    { label: 'Hardware Accessibility (Zero GPU)', rules: 100, ml: 95, dl: 45 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span className="badge badge-indigo">Paradigm Comparison Matrix</span>
          <span className="badge badge-emerald">Clinical Decision Science</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
          Architectural & Operational Benchmark Matrix
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px' }}>
          Comparative evaluation across computational complexity, explainability, and clinical application domains.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--cyan-400)" />
          Key Capability Metrics Across Paradigms (0 – 100 Score)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dimensions.map((dim, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#ffffff' }}>
                {dim.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
                    <span style={{ color: '#34d399' }}>Rules (J48)</span>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{dim.rules}/100</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${dim.rules}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
                    <span style={{ color: '#818cf8' }}>ML (Random Forest)</span>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{dim.ml}/100</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${dim.ml}%`, height: '100%', background: '#6366f1' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
                    <span style={{ color: 'var(--cyan-400)' }}>DL (CNN Vision)</span>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{dim.dl}/100</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${dim.dl}%`, height: '100%', background: '#06b6d4' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderTop: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={18} color="#818cf8" />
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>1) Machine Learning</h4>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--cyan-400)', fontWeight: '600', marginBottom: '10px' }}>
            Random Forest Ensemble (200 Trees)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Multi-symptom differential diagnosis, primary care intake triage, and calculating continuous probability distributions across 41 conditions.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderTop: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Layers size={18} color="var(--cyan-400)" />
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>2) Deep Learning</h4>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--cyan-400)', fontWeight: '600', marginBottom: '10px' }}>
            31-Layer Deep CNN (Spatial Infiltration)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Radiological image screening, pneumonia localization, and assisting radiologists with explainable Grad-CAM activation heatmap overlays.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <GitFork size={18} color="#34d399" />
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>3) Simple Rules</h4>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '600', marginBottom: '10px' }}>
            J48 Decision Tree (C4.5 Heuristic)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Emergency room rapid triage, immediate life-threat stratification, and strict rule-based hospital protocol compliance with 100% auditability.
          </p>
        </div>
      </div>
    </div>
  );
}
