import React from 'react';
import { Cpu, Layers, GitFork, BarChart3, Stethoscope, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemHealth }) {
  const tabs = [
    { id: 'comparison', label: 'Tri-Modal Comparator', icon: Sparkles, badge: 'All 3' },
    { id: 'ml', label: '1) ML Symptom Classifier', icon: Cpu, badge: 'Random Forest' },
    { id: 'dl', label: '2) DL Chest X-Ray', icon: Layers, badge: '31-Layer CNN' },
    { id: 'rules', label: '3) Simple Rules Engine', icon: GitFork, badge: 'J48 Tree' },
    { id: 'benchmark', label: 'Paradigm Benchmarks', icon: BarChart3, badge: 'Trade-offs' }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 15, 29, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '10px 28px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 14px rgba(6, 182, 212, 0.4)'
          }}>
            <Stethoscope size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                ClinicalTriModal <span style={{ color: 'var(--cyan-400)' }}>AI</span>
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>v1.0 Ready</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Diagnostic Intelligence: Machine Learning vs Deep Learning vs Simple Rules
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '24px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            color: '#34d399'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block'
            }} />
            <span>FastAPI Server Active</span>
          </div>
        </div>
      </div>

      <nav style={{
        maxWidth: '1440px',
        margin: '10px auto 0 auto',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={17} color={isActive ? '#38bdf8' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.66rem',
                padding: '2px 6px',
                borderRadius: '6px',
                background: isActive ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: '600'
              }}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
