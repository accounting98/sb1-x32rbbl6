import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { InventoryItem } from '../types/inventory';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface InventoryChartProps {
  items: InventoryItem[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ items }) => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[]
  });

  useEffect(() => {
    if (items.length === 0) return;

    // Get top 10 items by value
    const topItems = [...items]
      .sort((a, b) => (b.currentQuantity * b.price) - (a.currentQuantity * a.price))
      .slice(0, 8);

    const labels = topItems.map(item => item.name);
    const currentQuantities = topItems.map(item => item.currentQuantity);
    const minQuantities = topItems.map(item => item.minQuantity);

    setChartData({
      labels,
      datasets: [
        {
          label: 'الكمية الحالية',
          data: currentQuantities,
          backgroundColor: '#3B5998',
        },
        {
          label: 'الحد الأدنى',
          data: minQuantities,
          backgroundColor: '#F56C6C',
        },
      ],
    });
  }, [items]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Tajawal',
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Tajawal',
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Tajawal',
          },
        },
      },
    },
  };

  if (items.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>لا توجد بيانات متاحة</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default InventoryChart;