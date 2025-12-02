import { CustomerStatsResponse } from '../types';

interface CustomerStatsProps {
  data: CustomerStatsResponse;
}

export default function CustomerStats({ data }: CustomerStatsProps) {
  return (
    <div style={{ 
      padding: '1rem', 
      background: 'var(--bg-secondary)', 
      borderRadius: '8px', 
      marginBottom: '2rem',
      border: `1px solid var(--border-color)`,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <h2 style={{ color: 'var(--text-primary)' }}>Customer Statistics</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-primary)', 
          borderRadius: '4px',
          border: `1px solid var(--border-color)`,
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Customers</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{data.total_customers}</p>
        </div>
        
        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-primary)', 
          borderRadius: '4px',
          border: `1px solid var(--border-color)`,
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Revenue</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${data.total_revenue.toFixed(2)}</p>
        </div>
        
        <div style={{ 
          padding: '1rem', 
          background: 'var(--bg-primary)', 
          borderRadius: '4px',
          border: `1px solid var(--border-color)`,
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Avg per Customer</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${data.avg_spent_per_customer.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <h3 style={{ color: 'var(--text-primary)' }}>Top 5 Customers</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid var(--border-color)` }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)' }}>Customer ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>Total Spent</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {data.top_customers.map((customer) => (
                <tr key={customer.customerID} style={{ borderBottom: `1px solid var(--border-color)` }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>#{customer.customerID}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    ${customer.total_spent.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>{customer.transaction_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
