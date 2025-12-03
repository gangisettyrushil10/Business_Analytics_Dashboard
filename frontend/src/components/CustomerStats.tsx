import { DollarSign, Users, Wallet } from "lucide-react";
import { CustomerStatsResponse } from '../types';

interface CustomerStatsProps {
  data: CustomerStatsResponse;
}

const statCards = [
  {
    label: "Total Customers",
    icon: Users,
    key: "total_customers" as const,
    format: (value: number) => value.toLocaleString(),
  },
  {
    label: "Total Revenue",
    icon: DollarSign,
    key: "total_revenue" as const,
    format: (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
  },
  {
    label: "Avg per Customer",
    icon: Wallet,
    key: "avg_spent_per_customer" as const,
    format: (value: number) => `$${value.toFixed(2)}`,
  },
];

export default function CustomerStats({ data }: CustomerStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, icon: Icon, key, format }) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary/50 to-primary" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {format(data[key])}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Top Customers</h3>
            <p className="text-sm text-muted-foreground">
              Highest value accounts by total spend
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Users className="h-4 w-4" />
            {data.top_customers.length} profiles
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="py-3 pr-4 font-semibold">Customer ID</th>
                <th className="py-3 pr-4 font-semibold text-right">Total Spent</th>
                <th className="py-3 font-semibold text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.top_customers.map((customer) => (
                <tr key={customer.customerID} className="transition-colors hover:bg-accent">
                  <td className="py-3 pr-4 font-medium text-card-foreground">
                    #{customer.customerID}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold">
                    ${customer.total_spent.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {customer.transaction_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
