import { useState, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { uploadCSV } from "../api/client";
import { UploadResponse } from "../types";
import DataQualityReport from "../components/DataQualityReport";
import { useToast } from "../contexts/ToastContext";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'info');
      return;
    }
  
    setUploading(true);
    setResult(null);
  
    try {
      const response = await uploadCSV(selectedFile);
      setResult(response);
      showToast(`Successfully uploaded ${response.rows_inserted} rows`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">Data ingestion</p>
        <h1 className="text-3xl font-semibold tracking-tight">Upload sales data</h1>
        <p className="text-sm text-muted-foreground">
          Provide a CSV with the columns <code>date</code>, <code>amount</code>, <code>category</code>,{' '}
          <code>customerID</code>.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Select CSV file</h2>
            <p className="text-sm text-muted-foreground">We validate schema and data quality automatically.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="file"
            accept=".csv"
            disabled={uploading}
            onChange={handleFileChange}
            className="w-full rounded-lg border border-dashed border-input bg-background px-4 py-3 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {selectedFile && (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-card-foreground">{selectedFile.name}</p>
              <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload CSV'}
            </button>
            {uploading && <span className="text-sm text-muted-foreground">Processing file…</span>}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Upload summary</h3>
            <p className="mt-1 text-sm text-muted-foreground">We ingested your dataset successfully.</p>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <dt className="text-muted-foreground">Rows inserted</dt>
                <dd className="text-2xl font-semibold text-card-foreground">
                  {result.rows_inserted.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <dt className="text-muted-foreground">Filename</dt>
                <dd className="font-medium text-card-foreground">{result.filename}</dd>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-card-foreground">Ready for analysis</dd>
              </div>
            </dl>
          </div>

          {result.summary && (result.summary.has_warnings || result.summary.has_errors) && (
            <DataQualityReport
              warnings={result.warnings || []}
              errors={result.errors || []}
              summary={result.summary}
            />
          )}
        </div>
      )}
    </div>
  );
}
