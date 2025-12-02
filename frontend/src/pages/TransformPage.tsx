import { useState, ChangeEvent } from 'react';
import { previewTransform } from '../api/client';
import { TransformPreviewResponse } from '../types';

export default function TransformPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TransformPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // transform rules
  const [renameColumns, setRenameColumns] = useState<Record<string, string>>({});
  const [mapCategories, setMapCategories] = useState<Record<string, string>>({});
  const [computedFields, setComputedFields] = useState<Record<string, string>>({});
  
  // available columns and categories (from preview)
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(null);
      setError(null);
      setRenameColumns({});
      setMapCategories({});
      setComputedFields({});
      
      // auto-load preview to get available columns
      setLoading(true);
      try {
        const result = await previewTransform(file);
        if (result.success && result.columns) {
          setAvailableColumns(result.columns);
          if (result.preview && result.preview.length > 0) {
            const categories = new Set<string>();
            result.preview.forEach((row: any) => {
              if (row.category) {
                categories.add(row.category);
              }
            });
            setAvailableCategories(Array.from(categories));
          }
        }
      } catch (err: any) {
        // ignore errors on initial load, user can preview manually
        console.error('Auto-preview failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await previewTransform(
        selectedFile,
        Object.keys(renameColumns).length > 0 ? renameColumns : undefined,
        Object.keys(mapCategories).length > 0 ? mapCategories : undefined,
        Object.keys(computedFields).length > 0 ? computedFields : undefined
      );
      
      setPreview(result);
      
      // update available columns and categories from preview
      if (result.columns) {
        setAvailableColumns(result.columns);
      }
      
      // extract unique categories from preview data
      if (result.preview && result.preview.length > 0) {
        const categories = new Set<string>();
        result.preview.forEach((row: any) => {
          if (row.category) {
            categories.add(row.category);
          }
        });
        setAvailableCategories(Array.from(categories));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to preview transformations');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameColumn = (oldName: string, newName: string) => {
    if (newName.trim()) {
      setRenameColumns({ ...renameColumns, [oldName]: newName });
    } else {
      const updated = { ...renameColumns };
      delete updated[oldName];
      setRenameColumns(updated);
    }
  };

  const handleMapCategory = (oldValue: string, newValue: string) => {
    if (newValue.trim()) {
      setMapCategories({ ...mapCategories, [oldValue]: newValue });
    } else {
      const updated = { ...mapCategories };
      delete updated[oldValue];
      setMapCategories(updated);
    }
  };

  const handleComputedField = (fieldName: string, formula: string) => {
    if (formula.trim()) {
      setComputedFields({ ...computedFields, [fieldName]: formula });
    } else {
      const updated = { ...computedFields };
      delete updated[fieldName];
      setComputedFields(updated);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Data Transformations</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Upload a CSV file and preview transformations before applying them.
      </p>

      {/* File Upload */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>1. Select File</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          style={{ marginBottom: '1rem' }}
        />
        {selectedFile && (
          <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: 0 }}>
              <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
      </div>

      {/* Transform Rules */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>2. Define Transformations</h2>

        {/* Rename Columns */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Rename Columns</h3>
          {availableColumns.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {availableColumns.map((col) => (
                <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ minWidth: '150px' }}>{col} →</span>
                  <input
                    type="text"
                    placeholder="New column name"
                    value={renameColumns[col] || ''}
                    onChange={(e) => handleRenameColumn(col, e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>Upload a file to see available columns</p>
          )}
        </div>

        {/* Map Categories */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Map Categories</h3>
          {availableCategories.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {availableCategories.map((cat) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ minWidth: '150px' }}>{cat} →</span>
                  <input
                    type="text"
                    placeholder="New category value"
                    value={mapCategories[cat] || ''}
                    onChange={(e) => handleMapCategory(cat, e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>Upload a file and preview to see available categories</p>
          )}
        </div>

        {/* Computed Fields */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Computed Fields</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              Create new fields using formulas. Use column names in formulas (e.g., "amount * 1.0825").
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Field name (e.g., amount_with_tax)"
                id="computed-field-name"
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <span>=</span>
              <input
                type="text"
                placeholder="Formula (e.g., amount * 1.0825)"
                id="computed-field-formula"
                style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                onClick={() => {
                  const nameInput = document.getElementById('computed-field-name') as HTMLInputElement;
                  const formulaInput = document.getElementById('computed-field-formula') as HTMLInputElement;
                  if (nameInput && formulaInput && nameInput.value && formulaInput.value) {
                    handleComputedField(nameInput.value, formulaInput.value);
                    nameInput.value = '';
                    formulaInput.value = '';
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
          </div>
          
          {Object.keys(computedFields).length > 0 && (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {Object.entries(computedFields).map(([name, formula]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{name}</span>
                  <span>=</span>
                  <span style={{ flex: 1 }}>{formula}</span>
                  <button
                    onClick={() => handleComputedField(name, '')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Button */}
        <button
          onClick={handlePreview}
          disabled={!selectedFile || loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: (!selectedFile || loading) ? 0.6 : 1,
          }}
        >
          {loading ? 'Generating Preview...' : 'Preview Transformations'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fee', color: '#c00', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Preview Table */}
      {preview && preview.success && (
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>
            Preview ({preview.preview_rows} of {preview.total_rows} rows)
          </h2>
          
          {preview.preview.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                  <tr>
                    {preview.columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          borderBottom: '2px solid #dee2e6',
                          fontWeight: 'bold',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                      {preview.columns.map((col) => (
                        <td key={col} style={{ padding: '0.75rem' }}>
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#666' }}>No preview data available</p>
          )}
        </div>
      )}
    </div>
  );
}

