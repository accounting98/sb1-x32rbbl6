import { Boxes, CreditCard, TrendingDown, ShoppingCart } from 'lucide-react';
import Stats from '../components/Stats';

const Dashboard = () => {
  const stats = [
    {
      title: 'قيمة المخزون',
      value: '12,500 د.أ',
      icon: <Boxes className="h-6 w-6 text-primary-500" />,
      change: '+5.3%',
      changeType: 'positive' as const,
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'المستحقات للموردين',
      value: '4,200 د.أ',
      icon: <CreditCard className="h-6 w-6 text-warning-500" />,
      change: '-2.1%',
      changeType: 'negative' as const,
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'مواد تحت الحد الأدنى',
      value: '8',
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
    </div>
  );
};

export default Dashboard;