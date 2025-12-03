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

// Vibrant color palette for categories
const categoryColors = [
  '#6366f1', // Indigo - Electronics
  '#ec4899', // Pink - Clothing
  '#f59e0b', // Amber - Food
  '#10b981', // Emerald - Home & Garden
  '#3b82f6', // Blue - Sports & Outdoors
  '#8b5cf6', // Purple - Other
  '#ef4444', // Red - Backup
  '#14b8a6', // Teal - Backup
];

export default function CategoryChart({ data, onCategoryClick }: CategoryChartProps) {
  // Map categories to colors (with fallback)
  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Sales by Category',
        data: data.map(item => item.total),
        backgroundColor: data.map((_, index) => getCategoryColor(index)),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
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
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 12,
            weight: '500' as const,
          },
          color: 'hsl(var(--color-foreground))',
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600' as const,
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
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
    <div className="h-[320px] w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
