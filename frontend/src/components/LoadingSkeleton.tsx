interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export function ChartSkeleton() {
  return (
    <div style={{
      padding: '1rem',
      background: 'var(--bg-secondary)',
      borderRadius: '8px',
      marginBottom: '2rem',
      border: `1px solid var(--border-color)`,
    }}>
      <div style={{
        height: 'clamp(200px, 40vw, 300px)',
        background: `linear-gradient(90deg, var(--bg-primary) 25%, var(--border-color) 50%, var(--bg-primary) 75%)`,
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s ease-in-out infinite',
        borderRadius: '8px',
      }} />
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div style={{
      padding: '1rem',
      background: 'var(--bg-secondary)',
      borderRadius: '8px',
      marginBottom: '2rem',
      border: `1px solid var(--border-color)`,
    }}>
      <div style={{
        height: 'clamp(150px, 30vw, 200px)',
        background: `linear-gradient(90deg, var(--bg-primary) 25%, var(--border-color) 50%, var(--bg-primary) 75%)`,
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s ease-in-out infinite',
        borderRadius: '8px',
      }} />
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function TextSkeleton({ width = '100%', height = '20px', borderRadius = '4px' }: LoadingSkeletonProps) {
  return (
    <div style={{
      width,
      height,
      background: `linear-gradient(90deg, var(--bg-primary) 25%, var(--border-color) 50%, var(--bg-primary) 75%)`,
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s ease-in-out infinite',
      borderRadius,
      marginBottom: '0.5rem',
    }} />
  );
}
