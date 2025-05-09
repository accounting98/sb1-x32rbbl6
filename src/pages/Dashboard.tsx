import { useState, useEffect } from 'react';
import { Boxes, CreditCard, TrendingDown, ShoppingCart } from 'lucide-react';
import Stats from '../components/Stats';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSupplierStore } from '../stores/supplierStore';
import InventoryChart from '../components/InventoryChart';
import LowStockAlert from '../components/LowStockAlert';
import RecentTransactions from '../components/RecentTransactions';

const Dashboard = () => {
  const { items, getLowStockItems, getTotalInventoryValue, getRecentTransactions } = useInventoryStore();
  const { getTotalBalance } = useSupplierStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    document.title = 'لوحة التحكم | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  const lowStockItems = getLowStockItems();
  const totalInventoryValue = getTotalInventoryValue();
  const totalSupplierBalance = getTotalBalance();
  const recentTransactions = getRecentTransactions(5);

  const stats = [
    {
      title: 'قيمة المخزون',
      value: `${totalInventoryValue.toFixed(2)} د.أ`,
      icon: <Boxes className="h-6 w-6 text-primary-500" />,
      change: '+5.3%',
      changeType: 'positive' as const,
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'المستحقات للموردين',
      value: `${totalSupplierBalance.toFixed(2)} د.أ`,
      icon: <CreditCard className="h-6 w-6 text-warning-500" />,
      change: '-2.1%',
      changeType: 'negative' as const,
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'مواد تحت الحد الأدنى',
      value: lowStockItems.length.toString(),
      icon: <TrendingDown className="h-6 w-6 text-danger-500" />,
      change: '+3',
      changeType: 'negative' as const,
      description: 'منذ الأسبوع الماضي'
    },
    {
      title: 'عدد المعاملات الشهرية',
      value: '156',
      icon: <ShoppingCart className="h-6 w-6 text-success-500" />,
      change: '+12.5%',
      changeType: 'positive' as const,
      description: 'منذ الشهر الماضي'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
      </div>

      <Stats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">حالة المخزون</h2>
            <select
              className="select text-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
              <option value="quarter">آخر 3 أشهر</option>
              <option value="year">آخر سنة</option>
            </select>
          </div>
          <InventoryChart items={items} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">المواد تحت الحد الأدنى</h2>
          <LowStockAlert items={lowStockItems} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">آخر المعاملات</h2>
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;