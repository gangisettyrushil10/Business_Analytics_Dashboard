export function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded-lg bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function TextSkeleton({ width = "100%", height = "20px" }: { width?: string; height?: string }) {
  return (
    <div
      className="animate-pulse rounded bg-muted"
      style={{ width, height }}
    />
  );
}
