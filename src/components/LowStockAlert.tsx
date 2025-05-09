import React from 'react';
import { InventoryItem } from '../types/inventory';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LowStockAlertProps {
  items: InventoryItem[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>لا توجد مواد تحت الحد الأدنى حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const percentage = Math.floor((item.currentQuantity / item.minQuantity) * 100);
        let statusClass = '';
        
        if (percentage <= 50) {
          statusClass = 'bg-danger-500';
        } else if (percentage <= 80) {
          statusClass = 'bg-warning-500';
        } else {
          statusClass = 'bg-info-500';
        }
        
        return (
          <Link 
            key={item.id} 
            to={`/inventory/${item.id}`}
            className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle 
                  className={`h-5 w-5 ${
                    percentage <= 50 ? 'text-danger-500' : 'text-warning-500'
                  }`} 
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="text-gray-500 text-sm">
                {item.currentQuantity} {item.unit}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${statusClass}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>الحد الأدنى: {item.minQuantity} {item.unit}</span>
              <span>{percentage}%</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default LowStockAlert;