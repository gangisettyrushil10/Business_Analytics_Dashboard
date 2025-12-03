import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
      void fetchSales();
    }
  }, [isOpen, filterType, filterValue]);

  const fetchSales = async () => {
    if (!filterType || !filterValue) return;

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        limit: 1000,
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
    }
    if (filterType === 'category') {
      return `Transactions in ${filterValue}`;
    }
    return 'Transaction Details';
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="ml-auto flex h-full w-full max-w-xl flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString()} matching transactions
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border bg-background p-2 text-muted-foreground transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading transactions…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <span className="font-semibold text-card-foreground">{total}</span>{' '}
                total records • Showing up to 1,000 recent entries
              </div>

              {sales.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center space-y-2 rounded-xl border border-dashed">
                  <p className="text-sm font-medium text-card-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust your filters and try again.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="bg-muted text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Category</th>
                        <th className="px-4 py-3 text-right font-semibold">Amount</th>
                        <th className="px-4 py-3 text-right font-semibold">Customer ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {sales.map((sale) => (
                        <tr key={sale.id} className="transition-colors hover:bg-accent">
                          <td className="px-4 py-3 font-medium">{sale.date}</td>
                          <td className="px-4 py-3 text-muted-foreground">{sale.category}</td>
                          <td className="px-4 py-3 text-right font-semibold text-card-foreground">
                            ${sale.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {sale.customerID}
                          </td>
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
    </div>
  );
}
