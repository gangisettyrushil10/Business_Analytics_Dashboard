import { useState, ChangeEvent } from "react";
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
    <div style={{ 
      padding: '1rem', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ color: 'var(--text-primary)' }}>Upload CSV File</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-primary)' }}>Upload a CSV file with sales data.</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Required columns: date, amount, category, customerID
        </p>
      </div>
  
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ 
            marginBottom: '1rem',
            color: 'var(--text-primary)',
          }}
        />
      </div>
  
      {selectedFile && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          background: 'var(--bg-secondary)', 
          borderRadius: '4px',
          border: `1px solid var(--border-color)`,
        }}>
          <p style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Selected file:</strong> {selectedFile.name}
          </p>
          <p style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}
  
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? 'Uploading...' : 'Upload CSV'}
      </button>
  
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'var(--bg-secondary)', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            border: `1px solid var(--border-color)`,
          }}>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
              <strong>Success!</strong>
            </p>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
              Rows inserted: {result.rows_inserted}
            </p>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
              Filename: {result.filename}
            </p>
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