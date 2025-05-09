import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBranchStore } from '../stores/branchStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { Store, MapPin, Phone, User, Users, ArrowLeft, FileBarChart, ArrowUpRight, Package } from 'lucide-react';
import { formatDateTimeArabic } from '../utils/dateFormatter';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { generateBranchReport } from '../utils/reportGenerator';
import { toast } from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BranchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getBranchById } = useBranchStore();
  const { transactions, items } = useInventoryStore();
  const branch = getBranchById(id || '');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    if (branch) {
      document.title = `${branch.name} | نظام إدارة المخزون المركزي للمخابز`;
    }
  }, [branch]);

  if (!branch) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-800">الفرع غير موجود</h2>
        <Link to="/branches" className="text-primary-600 hover:text-primary-800 mt-2 inline-block">
          العودة إلى قائمة الفروع
        </Link>
      </div>
    );
  }

  // Get branch transactions
  const branchTransactions = transactions.filter(t => 
    t.type === 'outgoing' && t.branchId === branch.id
  );

  // Calculate statistics
  const totalTransactions = branchTransactions.length;
  const uniqueItems = new Set(branchTransactions.map(t => t.itemId)).size;
  const totalQuantity = branchTransactions.reduce((sum, t) => sum + t.quantity, 0);

  // Get most requested items
  const itemRequests = branchTransactions.reduce((acc, t) => {
    if (!acc[t.itemId]) {
      acc[t.itemId] = {
        itemId: t.itemId,
        itemName: t.itemName,
        totalQuantity: 0,
        count: 0
      };
    }
    acc[t.itemId].totalQuantity += t.quantity;
    acc[t.itemId].count += 1;
    return acc;
  }, {} as Record<string, { itemId: string; itemName: string; totalQuantity: number; count: number; }>);

  const mostRequestedItems = Object.values(itemRequests)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Prepare chart data
  const chartData = {
    labels: mostRequestedItems.map(item => item.itemName),
    datasets: [
      {
        label: 'عدد الطلبات',
        data: mostRequestedItems.map(item => item.count),
        backgroundColor: '#3B5998',
      }
    ],
  };

  const chartOptions = {
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

  const handleGenerateReport = async () => {
    try {
      await generateBranchReport(branch, branchTransactions, {
        totalItems: uniqueItems,
        totalTransactions,
        totalQuantity
      });
      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء التقرير');
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-600">
        <Link to="/branches" className="flex items-center gap-1 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" />
          <span>العودة إلى الفروع</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
                <p className="text-gray-600">{branch.manager}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={handleGenerateReport}
              >
                <FileBarChart className="h-5 w-5" />
                <span>تصدير التقرير</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-lg mb-4 pb-2 border-b">معلومات الفرع</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">العنوان</p>
                    <p className="text-gray-900">{branch.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">رقم الهاتف</p>
                    <p className="text-gray-900">{branch.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">مدير الفرع</p>
                    <p className="text-gray-900">{branch.manager}</p>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-gray-900 flex items-center gap-2 mt-6 mb-3">
                <Users className="h-4 w-4" />
                <span>المندوبين</span>
              </h4>
              
              <div className="space-y-3">
                {branch.representatives.map(rep => (
                  <div 
                    key={rep.id}
                    className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <p className="font-medium">{rep.name}</p>
                    <p className="text-sm text-gray-500">{rep.role}</p>
                    <p className="text-sm text-primary-600 mt-1">{rep.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">إحصائيات المخزون</h3>
                
                <div className="flex gap-2">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                  <div className="flex items-center gap-2 text-primary-600 mb-1">
                    <Package className="h-5 w-5" />
                    <h4 className="font-medium">إجمالي المواد</h4>
                  </div>
                  <p className="text-2xl font-bold text-primary-900">{uniqueItems}</p>
                  <p className="text-sm text-primary-600">مادة مختلفة</p>
                </div>

                <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-100">
                  <div className="flex items-center gap-2 text-secondary-600 mb-1">
                    <ArrowUpRight className="h-5 w-5" />
                    <h4 className="font-medium">عدد الطلبات</h4>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">{totalTransactions}</p>
                  <p className="text-sm text-secondary-600">طلب</p>
                </div>

                <div className="p-4 rounded-lg bg-success-50 border border-success-100">
                  <div className="flex items-center gap-2 text-success-600 mb-1">
                    <Package className="h-5 w-5" />
                    <h4 className="font-medium">إجمالي الكميات</h4>
                  </div>
                  <p className="text-2xl font-bold text-success-900">{totalQuantity}</p>
                  <p className="text-sm text-success-600">وحدة</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">المواد الأكثر طلباً</h4>
                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">سجل الطلبات</h4>
                  <select
                    className="select text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">جميع التصنيفات</option>
                    {Array.from(new Set(items.map(item => item.category.name))).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>المادة</th>
                        <th>الكمية</th>
                        <th>المندوب</th>
                        <th>ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchTransactions
                        .filter(t => !selectedCategory || 
                          items.find(i => i.id === t.itemId)?.category.name === selectedCategory
                        )
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .map(transaction => (
                          <tr key={transaction.id}>
                            <td className="text-sm text-gray-600">
                              {formatDateTimeArabic(transaction.date)}
                            </td>
                            <td>
                              <div className="font-medium">{transaction.itemName}</div>
                              <div className="text-xs text-gray-500">
                                {items.find(i => i.id === transaction.itemId)?.category.name}
                              </div>
                            </td>
                            <td>
                              {transaction.quantity} {transaction.unit}
                            </td>
                            <td>{transaction.representativeName}</td>
                            <td className="text-sm text-gray-600">
                              {transaction.notes || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetails;