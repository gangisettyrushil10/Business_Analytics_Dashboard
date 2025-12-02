import { useState } from 'react';

interface InsightsBoxProps {
  insights: string;
  loading?: boolean;
}

export default function InsightsBox({ insights, loading = false }: InsightsBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '3px solid rgba(255,255,255,0.3)', 
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Generating AI insights...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div style={{ 
      marginTop: '2rem', 
      background: 'var(--bg-secondary)', 
      borderRadius: '8px',
      boxShadow: `0 2px 8px var(--shadow)`,
      overflow: 'hidden',
      border: `1px solid var(--border-color)`,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>AI-Generated Insights</h3>
        </div>
        <span style={{ fontSize: '1.2rem' }}>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            lineHeight: '1.8',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          }}>
            {insights.split('\n').map((paragraph, idx) => (
              <p key={idx} style={{ margin: idx === 0 ? '0 0 1rem 0' : '0 0 1rem 0' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

