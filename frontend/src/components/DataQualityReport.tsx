import { useState } from 'react';
import { ValidationIssue, ValidationSummary } from '../types';

interface DataQualityReportProps {
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
  summary: ValidationSummary;
}

export default function DataQualityReport({ warnings, errors, summary }: DataQualityReportProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!summary.has_warnings && !summary.has_errors) {
    return null;
  }

  return (
    <div style={{ 
      marginTop: '1rem', 
      padding: '1rem', 
      background: 'var(--bg-secondary)', 
      borderRadius: '4px', 
      border: `1px solid var(--border-color)`,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <strong>Data Quality Report</strong>
          <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
            {summary.warning_count} warning{summary.warning_count !== 1 ? 's' : ''}
            {summary.error_count > 0 && `, ${summary.error_count} error${summary.error_count !== 1 ? 's' : ''}`}
          </span>
        </div>
        <span style={{ fontSize: '1.2rem' }}>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '1rem' }}>
          {/* Summary */}
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>Summary:</strong> {summary.valid_rows} of {summary.total_rows} rows are valid
            </p>
            {summary.error_count > 0 && (
              <p style={{ margin: 0, color: '#dc3545' }}>
                <strong>Errors:</strong> {summary.error_count} issue{summary.error_count !== 1 ? 's' : ''} detected
              </p>
            )}
            {summary.warning_count > 0 && (
              <p style={{ margin: 0, color: '#856404' }}>
                <strong>Warnings:</strong> {summary.warning_count} issue{summary.warning_count !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>

          {/* Errors Table */}
          {errors.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc3545' }}>Errors</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Message</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Count</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((error, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '0.5rem' }}>{error.type}</td>
                      <td style={{ padding: '0.5rem' }}>{error.message}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{error.count || '-'}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {error.percentage !== undefined ? `${error.percentage}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Warnings Table */}
          {warnings.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Warnings</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Message</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Count</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map((warning, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '0.5rem' }}>{warning.type}</td>
                      <td style={{ padding: '0.5rem' }}>
                        {warning.message}
                        {warning.examples && warning.examples.length > 0 && (
                          <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
                            Examples: {warning.examples.slice(0, 3).map(ex => ex.message || `Row ${ex.row}`).join(', ')}
                            {warning.examples.length > 3 && '...'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{warning.count || '-'}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {warning.percentage !== undefined ? `${warning.percentage}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

