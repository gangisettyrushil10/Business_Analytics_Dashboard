import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface InsightsBoxProps {
  insights: string;
  loading?: boolean;
}

export default function InsightsBox({ insights, loading = false }: InsightsBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Generating AI insights
              </p>
              <p className="text-xs text-muted-foreground">
                This usually takes a few seconds
              </p>
            </div>
          </div>
          <div className="h-24 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-t-xl border-b bg-gradient-to-r from-primary/80 to-primary px-6 py-4 text-primary-foreground transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">
              AI-Generated Insights
            </p>
            <p className="text-sm text-primary-foreground/80">
              Strategic recommendations tailored to your data
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3 px-6 py-5 text-sm leading-relaxed text-card-foreground">
          {insights.split('\n').map((paragraph, idx) => (
            <p key={`${paragraph}-${idx}`} className="text-sm">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
