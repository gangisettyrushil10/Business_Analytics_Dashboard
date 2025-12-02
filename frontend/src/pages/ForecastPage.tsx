import { useState, useEffect } from 'react';
import { getForecast } from '../api/client';
import { ForecastResponse } from '../types';
import ForecastChart from '../components/ForecastChart';
import { ChartSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);

      try {
        const data = await getForecast(period);
        setForecastData(data);
        showToast('Forecast generated successfully', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.detail || 'Failed to load forecast', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [period, showToast]);

  return (
    <div style={{ 
      padding: '1rem', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Revenue Forecast</h1>
        
        <div>
          <label style={{ marginRight: '0.5rem', color: 'var(--text-primary)' }}>Forecast Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            style={{ 
              padding: '0.5rem', 
              fontSize: '1rem', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: 'var(--bg-secondary)', 
        borderRadius: '8px',
        border: `1px solid var(--border-color)`,
      }}>
        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
          <strong>Forecasting Method:</strong> Prophet time-series model
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          The shaded area represents the 95% confidence interval. Predictions are based on historical revenue patterns.
        </p>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : forecastData ? (
        <>
          <ForecastChart data={forecastData} />
          
          <div style={{ 
            padding: '1rem', 
            background: 'var(--bg-secondary)', 
            borderRadius: '8px',
            border: `1px solid var(--border-color)`,
          }}>
            <h3 style={{ color: 'var(--text-primary)' }}>Forecast Summary</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Average Predicted Revenue</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  ${(forecastData.predicted.reduce((a, b) => a + b, 0) / forecastData.predicted.length).toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Predicted Revenue</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  ${forecastData.predicted.reduce((a, b) => a + b, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Forecast Period</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {period} days
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
