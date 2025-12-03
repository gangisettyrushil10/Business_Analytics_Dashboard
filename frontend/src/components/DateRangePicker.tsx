import { useState } from 'react';
import { Calendar } from 'lucide-react';

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

  const getDisplayText = () => {
    if (rangeDays === 7) return '7 Days';
    if (rangeDays === 30) return '30 Days';
    if (rangeDays === 90) return '90 Days';
    if (rangeDays === 365) return '1 Year';
    return `${rangeDays} Days`;
  };

  return (
    <div className="relative">
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
        className="appearance-none rounded-lg border bg-background px-4 py-2 pr-8 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value={7}>7 Days</option>
        <option value={30}>30 Days</option>
        <option value={90}>90 Days</option>
        <option value={365}>1 Year</option>
        <option value="custom">Custom range</option>
      </select>
      <Calendar className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      {showCustom && (
        <div className="absolute top-full z-50 mt-2 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              min={startDate}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCustomRange}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustom(false);
                onChange(30);
              }}
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
