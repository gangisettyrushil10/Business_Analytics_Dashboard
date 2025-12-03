import { useState, ChangeEvent } from 'react';
import { FileSpreadsheet, WandSparkles, Trash2 } from 'lucide-react';
import { previewTransform } from '../api/client';
import { TransformPreviewResponse } from '../types';

export default function TransformPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TransformPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [renameColumns, setRenameColumns] = useState<Record<string, string>>({});
  const [mapCategories, setMapCategories] = useState<Record<string, string>>({});
  const [computedFields, setComputedFields] = useState<Record<string, string>>({});
  
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const fieldClass =
    "rounded-lg border bg-background px-3 py-2 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(null);
      setError(null);
      setRenameColumns({});
      setMapCategories({});
      setComputedFields({});
      
      setLoading(true);
      try {
        const result = await previewTransform(file);
        if (result.success && result.columns) {
          setAvailableColumns(result.columns);
          if (result.preview && result.preview.length > 0) {
            const categories = new Set<string>();
            result.preview.forEach((row: any) => {
              if (row.category) categories.add(row.category);
            });
            setAvailableCategories(Array.from(categories));
          }
        }
      } catch (err) {
        console.error('Auto-preview failed', err);
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
        Object.keys(renameColumns).length ? renameColumns : undefined,
        Object.keys(mapCategories).length ? mapCategories : undefined,
        Object.keys(computedFields).length ? computedFields : undefined
      );
      setPreview(result);
      if (result.columns) {
        setAvailableColumns(result.columns);
      }
      if (result.preview && result.preview.length > 0) {
        const categories = new Set<string>();
        result.preview.forEach((row: any) => {
          if (row.category) categories.add(row.category);
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
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">Data preparation</p>
        <h1 className="text-3xl font-semibold tracking-tight">Transform datasets</h1>
        <p className="text-sm text-muted-foreground">
          Apply renames, mappings, and computed metrics before committing data to the warehouse.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">1. Select file</h2>
            <p className="text-sm text-muted-foreground">
              Supported format: CSV up to 10MB. We automatically detect schema.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="file"
            accept=".csv"
            disabled={loading}
            onChange={handleFileChange}
            className="w-full rounded-lg border border-dashed border-input bg-background px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {selectedFile && (
            <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
              {selectedFile.name} · {(selectedFile.size / 1024).toFixed(2)} KB
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <WandSparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">2. Define transformations</h2>
            <p className="text-sm text-muted-foreground">
              Specify renames, category mappings, and computed fields. Preview before committing.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold">Rename columns</h3>
          {availableColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground">Upload a file to detect available columns.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {availableColumns.map((col) => (
                <div key={col} className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-card-foreground sm:min-w-[160px]">
                    {col}
                  </span>
                  <input
                    type="text"
                    placeholder="New column name"
                    value={renameColumns[col] || ''}
                    onChange={(e) => handleRenameColumn(col, e.target.value)}
                    className={`${fieldClass} flex-1`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-md font-semibold">Map categories</h3>
          {availableCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Preview the dataset to extract categories.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {availableCategories.map((cat) => (
                <div
                  key={cat}
                  className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center"
                >
                  <span className="text-sm font-medium text-card-foreground sm:min-w-[160px]">
                    {cat}
                  </span>
                  <input
                    type="text"
                    placeholder="New category value"
                    value={mapCategories[cat] || ''}
                    onChange={(e) => handleMapCategory(cat, e.target.value)}
                    className={`${fieldClass} flex-1`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-md font-semibold">Computed fields</h3>
          <p className="text-sm text-muted-foreground">
            Use column names in formulas, e.g. <code>amount * 1.0825</code>.
          </p>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Field name"
              id="computed-field-name"
              className={`${fieldClass} flex-1`}
            />
            <span className="hidden text-muted-foreground sm:block">=</span>
            <input
              type="text"
              placeholder="Formula"
              id="computed-field-formula"
              className={`${fieldClass} flex-[2]`}
            />
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              onClick={() => {
                const nameInput = document.getElementById("computed-field-name") as HTMLInputElement;
                const formulaInput = document.getElementById(
                  "computed-field-formula",
                ) as HTMLInputElement;
                if (nameInput?.value && formulaInput?.value) {
                  handleComputedField(nameInput.value, formulaInput.value);
                  nameInput.value = "";
                  formulaInput.value = "";
                }
              }}
            >
              Add field
            </button>
          </div>

          {Object.keys(computedFields).length > 0 && (
            <div className="mt-4 space-y-3">
              {Object.entries(computedFields).map(([name, formula]) => (
                <div
                  key={name}
                  className="flex flex-col gap-3 rounded-xl border bg-card/60 p-4 text-sm text-card-foreground sm:flex-row sm:items-center"
                >
                  <span className="font-semibold">{name}</span>
                  <span className="hidden text-muted-foreground sm:block">=</span>
                  <span className="flex-1 text-muted-foreground">{formula}</span>
                  <button
                    type="button"
                    onClick={() => handleComputedField(name, "")}
                    className="inline-flex items-center gap-1 rounded-lg border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePreview}
          disabled={!selectedFile || loading}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating preview…" : "Preview transformations"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          {error}
        </div>
      )}

      {preview && preview.success && (
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">
              Preview ({preview.preview_rows} of {preview.total_rows} rows)
            </h2>
            <p className="text-sm text-muted-foreground">
              Review a sample of the transformed dataset before committing changes.
            </p>
          </div>

          {preview.preview.length === 0 ? (
            <p className="text-sm text-muted-foreground">No preview rows available.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    {preview.columns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {preview.preview.map((row: any, idx: number) => (
                    <tr key={idx} className="transition-colors hover:bg-accent">
                      {preview.columns.map((col) => (
                        <td key={col} className="px-4 py-3">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                        </td>
                      ))}
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
