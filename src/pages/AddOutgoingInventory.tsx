import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../stores/inventoryStore';
import { useBranchStore } from '../stores/branchStore';
import { ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTimeArabic } from '../utils/dateFormatter';

const AddOutgoingInventory = () => {
  const navigate = useNavigate();
  const { items, categories, addTransaction } = useInventoryStore();
  const { branches } = useBranchStore();
  
  const [formData, setFormData] = useState({
    itemId: '',
    branchId: '',
    representativeId: '',
    quantity: '',
    notes: ''
  });
  
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Update document title
  useEffect(() => {
    document.title = 'تسجيل صادر جديد | نظام إدارة المخزون المركزي للمخابز';
  }, []);
  
  // Update representatives when branch changes
  useEffect(() => {
    if (formData.branchId) {
      const branch = branches.find(b => b.id === formData.branchId);
      setSelectedBranch(branch);
      // Reset selected representative when branch changes
      setFormData(prev => ({
        ...prev,
        representativeId: ''
      }));
    } else {
      setSelectedBranch(null);
    }
  }, [formData.branchId, branches]);
  
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
    
    if (!formData.branchId) {
      newErrors.branchId = 'الرجاء اختيار الفرع';
    }
    
    if (!formData.representativeId) {
      newErrors.representativeId = 'الرجاء اختيار المندوب';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'الرجاء إدخال كمية صالحة';
    } else {
      // Check if quantity is available in inventory
      const selectedItem = items.find(item => item.id === formData.itemId);
      if (selectedItem && parseInt(formData.quantity) > selectedItem.currentQuantity) {
        newErrors.quantity = `الكمية غير متوفرة. المتاح حالياً: ${selectedItem.currentQuantity} ${selectedItem.unit}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, items]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const selectedItem = items.find(item => item.id === formData.itemId);
    const branch = branches.find(b => b.id === formData.branchId);
    const representative = branch?.representatives.find(r => r.id === formData.representativeId);
    
    if (!selectedItem || !branch || !representative) {
      return;
    }
    
    // Create transaction
    const transaction = {
      id: `out-${Date.now()}`,
      type: 'outgoing' as const,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: parseInt(formData.quantity),
      unit: selectedItem.unit,
      date: new Date(),
      branchId: branch.id,
      branchName: branch.name,
      representativeId: representative.id,
      representativeName: representative.name,
      notes: formData.notes
    };
    
    try {
      // Add transaction
      addTransaction(transaction);
      
      // Show success message
      toast.success('تم تسجيل الصادر بنجاح');
      
      // Navigate back to inventory
      navigate('/inventory');
    } catch (error) {
      console.error('Error processing outgoing transaction:', error);
      toast.error('حدث خطأ أثناء تسجيل الصادر');
    }
  };

  const selectedItem = formData.itemId ? items.find(item => item.id === formData.itemId) : null;
  const selectedRepresentative = formData.representativeId && selectedBranch ? 
    selectedBranch.representatives.find((r: any) => r.id === formData.representativeId) : null;

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
              <h1 className="text-2xl font-bold text-gray-900">تسجيل صادر جديد</h1>
              <p className="text-gray-600 mt-1">تسجيل صرف مواد من المخزن إلى الفروع</p>
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
                              {item.name} (المتاح: {item.currentQuantity} {item.unit})
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.itemId && <p className="mt-1 text-sm text-danger-600">{errors.itemId}</p>}
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
                  <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                    الفرع *
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    className={`select ${errors.branchId ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.branchId}
                    onChange={handleChange}
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && <p className="mt-1 text-sm text-danger-600">{errors.branchId}</p>}
                </div>
                
                <div>
                  <label htmlFor="representativeId" className="block text-sm font-medium text-gray-700 mb-1">
                    المندوب المستلم *
                  </label>
                  <select
                    id="representativeId"
                    name="representativeId"
                    className={`select ${errors.representativeId ? 'border-danger-500 ring-1 ring-danger-500' : ''}`}
                    value={formData.representativeId}
                    onChange={handleChange}
                    disabled={!selectedBranch}
                  >
                    <option value="">اختر المندوب</option>
                    {selectedBranch?.representatives.map((rep: any) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.name} - {rep.role}
                      </option>
                    ))}
                  </select>
                  {errors.representativeId && <p className="mt-1 text-sm text-danger-600">{errors.representativeId}</p>}
                  {!selectedBranch && <p className="mt-1 text-sm text-gray-500">الرجاء اختيار الفرع أولاً</p>}
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
                  معاينة الإذن
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  تسجيل الصادر
                </button>
              </div>
            </form>
          </div>
        </div>

        {showPreview && selectedItem && selectedBranch && selectedRepresentative && (
          <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-6">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium">معاينة إذن الصرف</h2>
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
                <p className="text-lg mt-2">إذن صرف</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">رقم الإذن</p>
                <p className="font-medium">OUT-{Date.now()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">التاريخ</p>
                <p className="font-medium">{formatDateTimeArabic(new Date())}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">معلومات الفرع</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">اسم الفرع:</span> {selectedBranch.name}</p>
                  <p><span className="text-gray-600">العنوان:</span> {selectedBranch.location}</p>
                  <p><span className="text-gray-600">رقم الهاتف:</span> {selectedBranch.phone}</p>
                  <p><span className="text-gray-600">المندوب المستلم:</span> {selectedRepresentative.name}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">تفاصيل الصرف</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-right">المادة</th>
                      <th className="py-2 text-right">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">{selectedItem.name}</td>
                      <td className="py-2">{formData.quantity} {selectedItem.unit}</td>
                    </tr>
                  </tbody>
                </table>
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

export default AddOutgoingInventory;