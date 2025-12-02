import { useEffect, useState } from 'react';
import { searchSales } from '../api/client';
import { Sale } from '../types';

interface SalesDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: 'date' | 'category' | null;
  filterValue: string | null;
}

export default function SalesDetailDrawer({ isOpen, onClose, filterType, filterValue }: SalesDetailDrawerProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen && filterType && filterValue) {
      fetchSales();
    }
  }, [isOpen, filterType, filterValue]);

  const fetchSales = async () => {
    if (!filterType || !filterValue) return;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        limit: 1000, // get all matching sales
        offset: 0,
      };

      if (filterType === 'date') {
        params.date = filterValue;
      } else if (filterType === 'category') {
        params.category = filterValue;
      }

      const response = await searchSales(params);
      setSales(response.results);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (filterType === 'date') {
      return `Transactions on ${filterValue}`;
    } else if (filterType === 'category') {
      return `Transactions in ${filterValue}`;
    }
    return 'Transaction Details';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '600px',
          maxWidth: '90vw',
          background: 'white',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>{getTitle()}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem 0.5rem',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading transactions...</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '4px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}>
                  <strong>Total Transactions:</strong> {total}
                </p>
              </div>

              {sales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No transactions found.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                          Date
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                          Category
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>
                          Amount
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>
                          Customer ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '0.75rem' }}>{sale.date}</td>
                          <td style={{ padding: '0.75rem' }}>{sale.category}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                            ${sale.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{sale.customerID}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

