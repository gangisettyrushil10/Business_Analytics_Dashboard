import { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { ValidationIssue, ValidationSummary } from '../types';

interface DataQualityReportProps {
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
  summary: ValidationSummary;
}

function IssueTable({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof AlertTriangle;
  rows: ValidationIssue[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Message</th>
              <th className="px-4 py-3 text-right font-semibold">Count</th>
              <th className="px-4 py-3 text-right font-semibold">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.map((issue, idx) => (
              <tr key={`${issue.type}-${idx}`} className="transition-colors hover:bg-accent">
                <td className="px-4 py-3 font-medium text-card-foreground">{issue.type}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {issue.message}
                  {issue.examples && issue.examples.length > 0 && (
                    <p className="mt-1 text-xs">
                      Examples:{' '}
                      {issue.examples
                        .slice(0, 3)
                        .map((example) => example.message || `Row ${example.row}`)
                        .join(', ')}
                      {issue.examples.length > 3 && '…'}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-card-foreground">
                  {issue.count ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {issue.percentage !== undefined ? `${issue.percentage}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DataQualityReport({
  warnings,
  errors,
  summary,
}: DataQualityReportProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!summary.has_warnings && !summary.has_errors) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-t-xl border-b px-6 py-4 text-left transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div>
          <h3 className="text-lg font-semibold">Data Quality Report</h3>
          <p className="text-sm text-muted-foreground">
            {summary.warning_count} warning{summary.warning_count === 1 ? '' : 's'} ·{' '}
            {summary.error_count} error{summary.error_count === 1 ? '' : 's'}
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-6 px-6 py-5">
          <div className="rounded-xl border border-dashed bg-muted/50 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-card-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {summary.valid_rows} of {summary.total_rows} rows are valid
              </span>
              {summary.error_count > 0 && (
                <span className="inline-flex items-center gap-1 text-card-foreground">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  {summary.error_count} blocking issues detected
                </span>
              )}
              {summary.warning_count > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  {summary.warning_count} warnings highlighted
                </span>
              )}
            </div>
          </div>

          {errors.length > 0 && <IssueTable title="Errors" icon={AlertCircle} rows={errors} />}
          {warnings.length > 0 && <IssueTable title="Warnings" icon={AlertTriangle} rows={warnings} />}
        </div>
      )}
    </div>
  );
}
