import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSupplierStore } from '../stores/supplierStore';
import { ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateInvoice } from '../utils/reportGenerator';
import { formatCurrency, formatDateTimeArabic } from '../utils/dateFormatter';

const AddIncomingInventory = () => {
  const navigate = useNavigate();
  const { items, categories, addTransaction } = useInventoryStore();
  const { suppliers, addTransaction: addSupplierTransaction } = useSupplierStore();
  
  const [formData, setFormData] = useState({
    itemId: '',
    supplierId: '',
    quantity: '',
    unitPrice: '',
    paidAmount: '',
    notes: ''
  });
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Update document title
  useEffect(() => {
    document.title = 'تسجيل وارد جديد | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  // Calculate total price when quantity or unit price changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    setTotalPrice(quantity * unitPrice);
  }, [formData.quantity, formData.unitPrice]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.itemId) {
      newErrors.itemId = 'الرجاء اختيار المادة';
    }
    
    if (!formData.supplierId) {
      newErrors.supplierId = 'الرجاء اختيار المورد';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'الرجاء إدخال كمية صالحة';
    }
    
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'الرجاء إدخال سعر صالح';
    }
    
    if (!formData.paidAmount) {
      newErrors.paidAmount = 'الرجاء إدخال المبلغ المدفوع';
    } else if (parseFloat(formData.paidAmount) > totalPrice) {
      newErrors.paidAmount = 'المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, totalPrice]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const selectedItem = items.find(item => item.id === formData.itemId);
    const selectedSupplier = suppliers.find(supplier => supplier.id === formData.supplierId);
    
    if (!selectedItem || !selectedSupplier) {
      return;
    }
    
    // Create transaction ID
    const transactionId = `in-${Date.now()}`;
    
    // Create inventory transaction
    const inventoryTransaction = {
      id: transactionId,
      type: 'incoming' as const,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: parseInt(formData.quantity),
      unit: selectedItem.unit,
      date: new Date(),
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      totalPrice: totalPrice,
      paidAmount: parseFloat(formData.paidAmount),
      notes: formData.notes
    };
    
    // Create supplier transaction
    const supplierTransaction = {
      id: `st-${transactionId}`,
      date: new Date(),
      type: 'purchase' as const,
      amount: totalPrice,
      paid: parseFloat(formData.paidAmount),
      balance: totalPrice - parseFloat(formData.paidAmount),
      notes: formData.notes || `توريد ${selectedItem.name}`,
      relatedTransactionId: transactionId
    };
    
    try {
      // Add transactions
      addTransaction(inventoryTransaction);
      addSupplierTransaction(selectedSupplier.id, supplierTransaction);
      
      // Generate invoice
      await generateInvoice(inventoryTransaction, selectedSupplier, selectedItem);
      
      // Show success message
      toast.success('تم تسجيل الوارد وطباعة الفاتورة بنجاح');
      
      // Navigate back to inventory
      navigate('/inventory');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('تم تسجيل الوارد ولكن حدث خطأ أثناء طباعة الفاتورة');
      navigate('/inventory');
    }
  };

  const selectedItem = formData.itemId ? items.find(item => item.id === formData.itemId) : null;
  const selectedSupplier = formData.supplierId ? suppliers.find(supplier => supplier.id === formData.supplierId) : null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-600">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة</span>
        </button>
      </div>
      
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">تسجيل وارد جديد</h1>
              <p className="text-gray-600 mt-1">إضافة توريد جديد من الموردين إلى المخزن</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">
                    المادة *
                  </label>
                  <select
                    id="itemId"
                    name="itemId"
                    className={`select ${errors.itemId ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.itemId}
                    onChange={handleChange}
                  >
                    <option value="">اختر المادة</option>
                    {categories.map(category => (
                      <optgroup key={category.id} label={category.name}>
                        {items
                          .filter(item => item.category.id === category.id)
                          .map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.itemId && <p className="mt-1 text-sm text-danger-600">{errors.itemId}</p>}
                </div>
                
                <div>
                  <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
                    المورد *
                  </label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    className={`select ${errors.supplierId ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.supplierId}
                    onChange={handleChange}
                  >
                    <option value="">اختر المورد</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && <p className="mt-1 text-sm text-danger-600">{errors.supplierId}</p>}
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    الكمية *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    className={`input ${errors.quantity ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                  {errors.quantity && <p className="mt-1 text-sm text-danger-600">{errors.quantity}</p>}
                </div>
                
                <div>
                  <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    سعر الوحدة (د.أ) *
                  </label>
                  <input
                    type="number"
                    id="unitPrice"
                    name="unitPrice"
                    min="0.01"
                    step="0.01"
                    className={`input ${errors.unitPrice ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.unitPrice}
                    onChange={handleChange}
                  />
                  {errors.unitPrice && <p className="mt-1 text-sm text-danger-600">{errors.unitPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر الإجمالي (د.أ)
                  </label>
                  <input
                    type="text"
                    className="input bg-gray-50"
                    value={totalPrice.toFixed(2)}
                    readOnly
                    disabled
                  />
                </div>
                
                <div>
                  <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    المبلغ المدفوع (د.أ) *
                  </label>
                  <input
                    type="number"
                    id="paidAmount"
                    name="paidAmount"
                    min="0"
                    step="0.01"
                    max={totalPrice}
                    className={`input ${errors.paidAmount ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.paidAmount}
                    onChange={handleChange}
                  />
                  {errors.paidAmount && <p className="mt-1 text-sm text-danger-600">{errors.paidAmount}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input"
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => navigate(-1)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50"
                  onClick={() => setShowPreview(true)}
                  disabled={Object.keys(errors).length > 0}
                >
                  معاينة الفاتورة
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  تسجيل الوارد
                </button>
              </div>
            </form>
          </div>
        </div>

        {showPreview && selectedItem && selectedSupplier && (
          <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-6">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium">معاينة الفاتورة</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-primary-600">مخبز السنابل</h1>
                <p className="text-lg mt-2">فاتورة توريد</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">رقم الفاتورة</p>
                <p className="font-medium">IN-{Date.now()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">التاريخ</p>
                <p className="font-medium">{formatDateTimeArabic(new Date())}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">معلومات المورد</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">اسم المورد:</span> {selectedSupplier.name}</p>
                  <p><span className="text-gray-600">العنوان:</span> {selectedSupplier.address}</p>
                  <p><span className="text-gray-600">رقم الهاتف:</span> {selectedSupplier.phone}</p>
                  <p><span className="text-gray-600">الشخص المسؤول:</span> {selectedSupplier.contactPerson}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">تفاصيل التوريد</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-right">المادة</th>
                      <th className="py-2 text-right">الكمية</th>
                      <th className="py-2 text-right">السعر</th>
                      <th className="py-2 text-right">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">{selectedItem.name}</td>
                      <td className="py-2">{formData.quantity} {selectedItem.unit}</td>
                      <td className="py-2">{formatCurrency(parseFloat(formData.unitPrice))}</td>
                      <td className="py-2">{formatCurrency(totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">معلومات الدفع</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ الإجمالي:</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ المدفوع:</span>
                    <span>{formatCurrency(parseFloat(formData.paidAmount))}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">المبلغ المتبقي:</span>
                    <span>{formatCurrency(totalPrice - parseFloat(formData.paidAmount))}</span>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">ملاحظات</h3>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}

              <div className="border-t pt-4 text-center text-sm text-gray-500">
                مخبز السنابل - نظام إدارة المخزون المركزي
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddIncomingInventory;