import { useState, useEffect } from 'react';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSupplierStore } from '../stores/supplierStore';
import { FileBarChart, AlertTriangle, CreditCard, TrendingDown, Calendar, Download, Filter } from 'lucide-react';
import { formatCurrency } from '../utils/dateFormatter';
import { generateInventoryReport } from '../utils/reportGenerator';
import LowStockAlert from '../components/LowStockAlert';
import ExpiryDates from './ExpiryDates';
import toast from 'react-hot-toast';

const Reports = () => {
  const { items, getLowStockItems, getTotalInventoryValue } = useInventoryStore();
  const { suppliers, getTotalBalance } = useSupplierStore();
  const [activeTab, setActiveTab] = useState('lowStock');
  
  // Update document title
  useEffect(() => {
    document.title = 'التقارير | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  const lowStockItems = getLowStockItems();
  const totalInventoryValue = getTotalInventoryValue();
  const totalSupplierBalance = getTotalBalance();

  const handleExportReport = async () => {
    try {
      await generateInventoryReport(items, [], suppliers, {
        totalValue: totalInventoryValue,
        lowStockCount: lowStockItems.length,
        totalBalance: totalSupplierBalance
      });
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
        
        <button 
          className="btn btn-secondary flex items-center gap-2"
          onClick={handleExportReport}
        >
          <Download className="h-5 w-5" />
          <span>تصدير التقارير</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-r-4 border-primary-500">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-primary-800 font-medium">قيمة المخزون الحالية</h3>
            <FileBarChart className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-primary-900">{formatCurrency(totalInventoryValue)}</p>
          <p className="text-sm text-primary-600 mt-1">إجمالي قيمة {items.length} صنف</p>
        </div>
        
        <div className="card bg-gradient-to-br from-warning-50 to-warning-100 border-r-4 border-warning-500">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-warning-800 font-medium">المواد تحت الحد الأدنى</h3>
            <AlertTriangle className="h-5 w-5 text-warning-500" />
          </div>
          <p className="text-2xl font-bold text-warning-900">{lowStockItems.length}</p>
          <p className="text-sm text-warning-600 mt-1">بحاجة إلى طلب جديد</p>
        </div>
        
        <div className="card bg-gradient-to-br from-danger-50 to-danger-100 border-r-4 border-danger-500">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-danger-800 font-medium">المستحقات للموردين</h3>
            <CreditCard className="h-5 w-5 text-danger-500" />
          </div>
          <p className="text-2xl font-bold text-danger-900">{formatCurrency(totalSupplierBalance)}</p>
          <p className="text-sm text-danger-600 mt-1">لـ {suppliers.filter(s => s.balance > 0).length} مورد</p>
        </div>
      </div>
      
      <div className="card">
        <div className="border-b pb-4 mb-6">
          <div className="flex space-x-6 space-x-reverse">
            <button
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'lowStock'
                  ? 'text-primary-600 border-b-2 border-primary-500 -mb-4'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('lowStock')}
            >
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                <span>المواد تحت الحد الأدنى</span>
              </div>
            </button>
            <button
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'expiryDates'
                  ? 'text-primary-600 border-b-2 border-primary-500 -mb-4'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('expiryDates')}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>تواريخ الإنتهاء</span>
              </div>
            </button>
            <button
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'supplierBalances'
                  ? 'text-primary-600 border-b-2 border-primary-500 -mb-4'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('supplierBalances')}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>مستحقات الموردين</span>
              </div>
            </button>
          </div>
        </div>
        
        {activeTab === 'lowStock' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">المواد تحت الحد الأدنى</h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Filter className="h-4 w-4" />
                <span>تصفية</span>
              </div>
            </div>
            
            <LowStockAlert items={lowStockItems} />
          </>
        )}

        {activeTab === 'expiryDates' && (
          <ExpiryDates />
        )}
        
        {activeTab === 'supplierBalances' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">مستحقات الموردين</h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Filter className="h-4 w-4" />
                <span>تصفية</span>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>اسم المورد</th>
                    <th>إجمالي المشتريات</th>
                    <th>المبالغ المدفوعة</th>
                    <th>الرصيد المستحق</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-gray-500">{supplier.contactPerson}</div>
                      </td>
                      <td>{formatCurrency(supplier.totalPurchases)}</td>
                      <td>{formatCurrency(supplier.totalPaid)}</td>
                      <td className={`font-medium ${supplier.balance > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                        {formatCurrency(supplier.balance)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            supplier.balance > 0
                              ? 'bg-danger-100 text-danger-800'
                              : 'bg-success-100 text-success-800'
                          }`}
                        >
                          {supplier.balance > 0 ? 'رصيد مستحق' : 'مسدد بالكامل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;