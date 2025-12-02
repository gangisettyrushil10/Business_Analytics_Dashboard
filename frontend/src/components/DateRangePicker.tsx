import { useState } from 'react';

interface DateRangePickerProps {
  rangeDays: number;
  onChange: (days: number) => void;
}

export default function DateRangePicker({ rangeDays, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handlePresetChange = (days: number) => {
    onChange(days);
    setShowCustom(false);
  };

  const handleCustomRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 365) {
        onChange(diffDays);
        setShowCustom(false);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={showCustom ? 'custom' : rangeDays}
          onChange={(e) => {
            if (e.target.value === 'custom') {
              setShowCustom(true);
              setStartDate(defaultStart);
              setEndDate(today);
            } else {
              handlePresetChange(Number(e.target.value));
            }
          }}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: 'white',
          }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
          <option value="custom">Custom Range</option>
        </select>

        {showCustom && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            padding: '0.5rem',
            background: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              style={{
                padding: '0.25rem',
                fontSize: '0.9rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              min={startDate}
              style={{
                padding: '0.25rem',
                fontSize: '0.9rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
            <button
              onClick={handleCustomRange}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.9rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
            <button
              onClick={() => {
                setShowCustom(false);
                onChange(30);
              }}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.9rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

