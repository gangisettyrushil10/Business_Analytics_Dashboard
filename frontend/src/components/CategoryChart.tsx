import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { CategoryData } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: CategoryData[];
  onCategoryClick?: (category: string) => void;
}

export default function CategoryChart({ data, onCategoryClick }: CategoryChartProps) {
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ];

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Sales by Category',
        data: data.map(item => item.total),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0 && onCategoryClick) {
        const element = elements[0];
        const index = element.index;
        if (index < data.length) {
          const clickedCategory = data[index].category;
          onCategoryClick(clickedCategory);
        }
      }
    },
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Sales by Category (Click a slice to view transactions)',
      },
      tooltip: {
        callbacks: {
          // custom tooltip shows amount and percentage
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ 
      padding: '1rem', 
      background: 'var(--bg-secondary)', 
      borderRadius: '8px', 
      marginBottom: '2rem',
      border: `1px solid var(--border-color)`,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
