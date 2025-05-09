import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSupplierStore } from '../stores/supplierStore';
import { Truck, Phone, Mail, MapPin, User, ArrowLeft, Download, Plus, CreditCard, Calendar, Filter } from 'lucide-react';
import { formatDateTimeArabic, formatCurrency } from '../utils/dateFormatter';
import { generateSupplierStatement } from '../utils/reportGenerator';
import toast from 'react-hot-toast';

const SupplierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { getSupplierById, addTransaction } = useSupplierStore();
  const supplier = getSupplierById(id || '');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payment, setPayment] = useState({
    amount: '',
    notes: ''
  });

  // Date filtering state
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    from: '',
    to: ''
  });
  
  // Transaction type filtering state
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [filteredTransactions, setFilteredTransactions] = useState(supplier?.transactions || []);
  
  useEffect(() => {
    if (supplier) {
      document.title = `${supplier.name} | نظام إدارة المخزون المركزي للمخابز`;
      filterTransactions();
    }
  }, [supplier, dateFilter, customDateRange, typeFilter]);

  const filterTransactions = () => {
    if (!supplier) return;

    let filtered = [...supplier.transactions];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Apply date filter
    switch (dateFilter) {
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(t => t.date >= weekAgo);
        break;

      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(t => t.date >= monthAgo);
        break;

      case 'quarter':
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        filtered = filtered.filter(t => t.date >= quarterAgo);
        break;

      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(t => t.date >= yearAgo);
        break;

      case 'custom':
        if (customDateRange.from) {
          const fromDate = new Date(customDateRange.from);
          filtered = filtered.filter(t => t.date >= fromDate);
        }
        if (customDateRange.to) {
          const toDate = new Date(customDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(t => t.date <= toDate);
        }
        break;

      default:
        // 'all' - no filtering needed
        break;
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    setFilteredTransactions(filtered);
  };

  const calculateFilteredStats = () => {
    let totalPurchases = 0;
    let totalPaid = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'purchase') {
        totalPurchases += t.amount;
        totalPaid += t.paid;
      } else {
        totalPaid += t.amount;
      }
    });

    return {
      totalPurchases,
      totalPaid
    };
  };

  const handleGenerateStatement = async () => {
    try {
      const stats = calculateFilteredStats();
      await generateSupplierStatement(supplier, filteredTransactions, {
        totalPurchases: stats.totalPurchases,
        totalPaid: stats.totalPaid,
        balance: supplier.balance
      });
      toast.success('تم تحميل كشف الحساب بنجاح');
    } catch (error) {
      console.error('Error generating statement:', error);
      toast.error('حدث خطأ أثناء تحميل كشف الحساب');
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment.amount || parseFloat(payment.amount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    const paymentAmount = parseFloat(payment.amount);
    if (paymentAmount > supplier.balance) {
      toast.error('المبلغ المدخل أكبر من الرصيد المستحق');
      return;
    }

    const transaction = {
      id: `payment-${Date.now()}`,
      date: new Date(),
      type: 'payment' as const,
      amount: paymentAmount,
      paid: paymentAmount,
      balance: -paymentAmount,
      notes: payment.notes || 'دفعة من المستحقات',
      relatedTransactionId: ''
    };

    addTransaction(supplier.id, transaction);
    setPayment({ amount: '', notes: '' });
    setShowPaymentModal(false);
    toast.success('تم تسجيل الدفعة بنجاح');
  };

  if (!supplier) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-800">المورد غير موجود</h2>
        <Link to="/suppliers" className="text-primary-600 hover:text-primary-800 mt-2 inline-block">
          العودة إلى قائمة الموردين
        </Link>
      </div>
    );
  }

  const stats = calculateFilteredStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-600">
        <Link to="/suppliers" className="flex items-center gap-1 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" />
          <span>العودة إلى الموردين</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                <p className="text-gray-600">{supplier.contactPerson}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowPaymentModal(true)}
                disabled={supplier.balance <= 0}
              >
                <Plus className="h-5 w-5" />
                <span>تسجيل دفعة</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-lg mb-4 pb-2 border-b">معلومات المورد</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">رقم الهاتف</p>
                    <p className="text-gray-900">{supplier.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">البريد الإلكتروني</p>
                    <p className="text-gray-900">{supplier.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">العنوان</p>
                    <p className="text-gray-900">{supplier.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">جهة الاتصال</p>
                    <p className="text-gray-900">{supplier.contactPerson}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">شروط الدفع</p>
                    <p className="text-gray-900">{supplier.paymentTerms}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-medium text-lg">كشف الحساب</h3>
                <button 
                  className="flex items-center gap-1 text-gray-600 text-sm hover:text-primary-600"
                  onClick={handleGenerateStatement}
                >
                  <Download className="h-4 w-4" />
                  <span>تصدير الكشف</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                  <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                  <p className="text-xl font-bold text-primary-800">{formatCurrency(stats.totalPurchases)}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-success-50 border border-success-100">
                  <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
                  <p className="text-xl font-bold text-success-800">{formatCurrency(stats.totalPaid)}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-danger-50 border border-danger-100">
                  <p className="text-sm text-gray-600">الرصيد المستحق</p>
                  <p className="text-xl font-bold text-danger-800">{formatCurrency(supplier.balance)}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <select
                    className="select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">جميع المعاملات</option>
                    <option value="week">آخر أسبوع</option>
                    <option value="month">آخر شهر</option>
                    <option value="quarter">آخر 3 أشهر</option>
                    <option value="year">آخر سنة</option>
                    <option value="custom">تاريخ محدد</option>
                  </select>
                </div>

                {dateFilter === 'custom' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="date"
                        className="input"
                        value={customDateRange.from}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        className="input"
                        value={customDateRange.to}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="w-full md:w-48">
                  <select
                    className="select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">جميع المعاملات</option>
                    <option value="purchase">المشتريات</option>
                    <option value="payment">المدفوعات</option>
                  </select>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>النوع</th>
                      <th>القيمة</th>
                      <th>المدفوع</th>
                      <th>الرصيد</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="text-sm text-gray-600">
                            {formatDateTimeArabic(transaction.date)}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                transaction.type === 'purchase'
                                  ? 'bg-primary-100 text-primary-800'
                                  : 'bg-success-100 text-success-800'
                              }`}
                            >
                              {transaction.type === 'purchase' ? 'مشتريات' : 'دفعة'}
                            </span>
                          </td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>{formatCurrency(transaction.paid)}</td>
                          <td 
                            className={transaction.balance >= 0 ? 'text-danger-600' : 'text-success-600'}
                          >
                            {formatCurrency(Math.abs(transaction.balance))}
                          </td>
                          <td className="text-sm text-gray-600">
                            {transaction.notes}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          لا توجد معاملات مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan={2} className="text-left">المجموع:</td>
                      <td>{formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}</td>
                      <td>{formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.paid, 0))}</td>
                      <td 
                        className={supplier.balance > 0 ? 'text-danger-600' : 'text-success-600'}
                      >
                        {formatCurrency(Math.abs(supplier.balance))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">تسجيل دفعة جديدة</h3>
            <form onSubmit={handleAddPayment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الرصيد المستحق
                  </label>
                  <div className="text-lg font-bold text-danger-600">
                    {formatCurrency(supplier.balance)}
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    المبلغ المدفوع *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    className="input"
                    min="0.01"
                    step="0.01"
                    max={supplier.balance}
                    value={payment.amount}
                    onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="input"
                    value={payment.notes}
                    onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                    placeholder="أي ملاحظات إضافية..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowPaymentModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  تسجيل الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDetails;