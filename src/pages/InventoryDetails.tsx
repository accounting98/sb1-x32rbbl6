import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../stores/inventoryStore';
import { useBranchStore } from '../stores/branchStore';
import { useSupplierStore } from '../stores/supplierStore';
import { Package, ArrowLeft, Edit, FileBarChart, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { formatDateTimeArabic, formatCurrency } from '../utils/dateFormatter';
import { generateInvoice, generateOutgoingInvoice } from '../utils/reportGenerator';
import toast from 'react-hot-toast';

const InventoryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, transactions, categories, updateItem } = useInventoryStore();
  const { branches } = useBranchStore();
  const { suppliers } = useSupplierStore();
  const [item, setItem] = useState<any>(null);
  const [itemTransactions, setItemTransactions] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedItem, setEditedItem] = useState<any>(null);
  
  // Filtering state
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    from: '',
    to: ''
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  
  // Find the item and its transactions
  useEffect(() => {
    const foundItem = items.find(i => i.id === id);
    if (foundItem) {
      setItem(foundItem);
      setEditedItem(foundItem);
      
      // Find all transactions for this item
      const relatedTransactions = transactions.filter(t => t.itemId === id);
      setItemTransactions(relatedTransactions);
      setFilteredTransactions(relatedTransactions);
      
      // Update document title
      document.title = `${foundItem.name} | نظام إدارة المخزون المركزي للمخابز`;
    }
  }, [id, items, transactions]);

  // Apply filters
  useEffect(() => {
    if (!itemTransactions.length) return;

    let filtered = [...itemTransactions];
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
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Apply entity filter
    if (entityFilter !== 'all') {
      if (entityFilter.startsWith('supplier-')) {
        const supplierId = entityFilter.replace('supplier-', '');
        filtered = filtered.filter(t => t.type === 'incoming' && t.supplierId === supplierId);
      } else if (entityFilter.startsWith('branch-')) {
        const branchId = entityFilter.replace('branch-', '');
        filtered = filtered.filter(t => t.type === 'outgoing' && t.branchId === branchId);
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    setFilteredTransactions(filtered);
  }, [itemTransactions, dateFilter, customDateRange, typeFilter, entityFilter]);
  
  if (!item) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-800">المادة غير موجودة</h2>
        <Link to="/inventory" className="text-primary-600 hover:text-primary-800 mt-2 inline-block">
          العودة إلى المخزون
        </Link>
      </div>
    );
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editedItem) return;

    // Validate form
    if (!editedItem.name || !editedItem.category || !editedItem.unit || !editedItem.minQuantity || !editedItem.price) {
      toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    try {
      // Update item
      updateItem(editedItem);
      
      // Update local state
      setItem(editedItem);
      
      // Close modal
      setShowEditModal(false);
      
      // Show success message
      toast.success('تم تحديث المادة بنجاح');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('حدث خطأ أثناء تحديث المادة');
    }
  };

  const handleDownloadInvoice = async (transaction: any) => {
    try {
      if (transaction.type === 'incoming') {
        const supplier = suppliers.find(s => s.id === transaction.supplierId);
        if (!supplier) throw new Error('Supplier not found');
        
        await generateInvoice(transaction, supplier, item);
      } else {
        const branch = branches.find(b => b.id === transaction.branchId);
        if (!branch) throw new Error('Branch not found');
        
        await generateOutgoingInvoice(transaction, branch, item);
      }
      
      toast.success('تم تحميل الفاتورة بنجاح');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('حدث خطأ أثناء تحميل الفاتورة');
    }
  };
  
  // Calculate statistics
  const totalIncoming = itemTransactions
    .filter(t => t.type === 'incoming')
    .reduce((sum, t) => sum + t.quantity, 0);
    
  const totalOutgoing = itemTransactions
    .filter(t => t.type === 'outgoing')
    .reduce((sum, t) => sum + t.quantity, 0);
    
  const stockValue = item.currentQuantity * item.price;
  
  // Calculate stock status
  const stockPercentage = Math.floor((item.currentQuantity / item.minQuantity) * 100);
  let stockStatus = '';
  let stockStatusClass = '';
  
  if (item.currentQuantity <= item.minQuantity * 0.5) {
    stockStatus = 'منخفض جداً';
    stockStatusClass = 'bg-danger-100 text-danger-800';
  } else if (item.currentQuantity <= item.minQuantity) {
    stockStatus = 'منخفض';
    stockStatusClass = 'bg-warning-100 text-warning-800';
  } else if (item.currentQuantity <= item.minQuantity * 2) {
    stockStatus = 'متوسط';
    stockStatusClass = 'bg-info-100 text-info-800';
  } else {
    stockStatus = 'جيد';
    stockStatusClass = 'bg-success-100 text-success-800';
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-600">
        <Link to="/inventory" className="flex items-center gap-1 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" />
          <span>العودة إلى المخزون</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                  <span className={`badge ${stockStatusClass}`}>
                    {stockStatus}
                  </span>
                </div>
                <p className="text-gray-600">
                  {item.category.name} - {item.unit}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-5 w-5" />
                <span>تعديل</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-lg mb-4 pb-2 border-b">تفاصيل المادة</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">الكمية الحالية</h5>
                    <p className="font-bold text-xl">
                      {item.currentQuantity} <span className="text-sm font-normal">{item.unit}</span>
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">الحد الأدنى</h5>
                    <p className="font-bold text-xl">
                      {item.minQuantity} <span className="text-sm font-normal">{item.unit}</span>
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className={`h-2.5 rounded-full ${
                      stockPercentage <= 50 
                        ? 'bg-danger-500' 
                        : stockPercentage <= 100 
                        ? 'bg-warning-500' 
                        : 'bg-success-500'
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">سعر الوحدة</h5>
                    <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                  </div>
                  
                  <div className="p-3 bg-success-50 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">قيمة المخزون</h5>
                    <p className="font-bold text-lg text-success-800">{formatCurrency(stockValue)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">إجمالي الوارد</h5>
                    <p className="font-bold text-lg text-primary-800">
                      {totalIncoming} <span className="text-sm font-normal">{item.unit}</span>
                    </p>
                  </div>
                  
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <h5 className="text-xs text-gray-500 mb-1">إجمالي الصادر</h5>
                    <p className="font-bold text-lg text-secondary-800">
                      {totalOutgoing} <span className="text-sm font-normal">{item.unit}</span>
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 pt-2 mt-2 border-t border-gray-100">
                  <p>آخر تحديث: {formatDateTimeArabic(item.lastUpdated)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-medium text-lg">سجل المعاملات</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <select
                    className="select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">جميع التواريخ</option>
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
                    <option value="incoming">الوارد</option>
                    <option value="outgoing">الصادر</option>
                  </select>
                </div>

                <div className="w-full md:w-64">
                  <select
                    className="select"
                    value={entityFilter}
                    onChange={(e) => setEntityFilter(e.target.value)}
                  >
                    <option value="all">جميع الجهات</option>
                    <optgroup label="الموردين">
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={`supplier-${supplier.id}`}>
                          {supplier.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="الفروع">
                      {branches.map(branch => (
                        <option key={branch.id} value={`branch-${branch.id}`}>
                          {branch.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>النوع</th>
                      <th>الكمية</th>
                      <th>الجهة</th>
                      <th>المبلغ</th>
                      <th>ملاحظات</th>
                      <th>إجراءات</th>
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
                            <div className="flex items-center gap-2">
                              {transaction.type === 'incoming' ? (
                                <>
                                  <ArrowDownLeft className="h-5 w-5 text-success-500" />
                                  <span className="text-success-700">وارد</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="h-5 w-5 text-danger-500" />
                                  <span className="text-danger-700">صادر</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="font-medium">
                              {transaction.quantity} {transaction.unit}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="font-medium">
                                {transaction.type === 'incoming' 
                                  ? transaction.supplierName 
                                  : transaction.branchName}
                              </div>
                              {transaction.type === 'outgoing' && transaction.representativeName && (
                                <div className="text-sm text-gray-500">
                                  {transaction.representativeName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {transaction.type === 'incoming' && transaction.totalPrice
                              ? formatCurrency(transaction.totalPrice)
                              : '-'}
                          </td>
                          <td className="text-sm text-gray-600">
                            {transaction.notes || '-'}
                          </td>
                          <td>
                            <button
                              onClick={() => handleDownloadInvoice(transaction)}
                              className="text-primary-600 hover:text-primary-800"
                              title={transaction.type === 'incoming' ? 'تحميل الفاتورة' : 'تحميل إذن الصرف'}
                            >
                              <FileBarChart className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-gray-500">
                          لا توجد معاملات مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">تعديل المادة</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المادة *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={editedItem.name}
                    onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    التصنيف *
                  </label>
                  <select
                    id="category"
                    className="select"
                    value={editedItem.category.id}
                    onChange={(e) => {
                      const category = categories.find(c => c.id === e.target.value);
                      if (category) {
                        setEditedItem({ ...editedItem, category });
                      }
                    }}
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    وحدة القياس *
                  </label>
                  <input
                    type="text"
                    id="unit"
                    className="input"
                    value={editedItem.unit}
                    onChange={(e) => setEditedItem({ ...editedItem, unit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأدنى *
                  </label>
                  <input
                    type="number"
                    id="minQuantity"
                    className="input"
                    min="0"
                    value={editedItem.minQuantity}
                    onChange={(e) => setEditedItem({ ...editedItem, minQuantity: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    سعر الوحدة (د.أ) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    className="input"
                    min="0"
                    step="0.01"
                    value={editedItem.price}
                    onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEditModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetails;