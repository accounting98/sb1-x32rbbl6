import { useEffect, useState } from 'react';
import { User, Building, Bell, Shield, Globe, Package, ChevronLeft, Plus, X, Edit, AlertTriangle, Calendar } from 'lucide-react';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSupplierStore } from '../stores/supplierStore';
import toast from 'react-hot-toast';
import { formatDateArabic } from '../utils/dateFormatter';

const Settings = () => {
  const { categories, items, addCategory, updateCategory, deleteCategory, addItem, updateItem, deleteItem } = useInventoryStore();
  const { suppliers } = useSupplierStore();
  const [activeSection, setActiveSection] = useState('notifications');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editedCategory, setEditedCategory] = useState({ id: '', name: '' });
  const [newItem, setNewItem] = useState({
    name: '',
    categoryId: '',
    unit: '',
    minQuantity: '',
    price: '',
    expiryDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    lowStock: true,
    lowStockThreshold: 100,
    supplierBalance: true,
    supplierBalanceThreshold: 1000,
    emailNotifications: true,
    browserNotifications: true
  });

  useEffect(() => {
    document.title = 'الإعدادات | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  const lowStockItems = items.filter(item => 
    (item.currentQuantity / item.minQuantity) * 100 <= notificationSettings.lowStockThreshold
  );

  const suppliersWithHighBalance = suppliers.filter(supplier => 
    supplier.balance >= notificationSettings.supplierBalanceThreshold
  );

  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === '' || 
      item.category.id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      addCategory({
        id: `cat-${Date.now()}`,
        name: newCategory.name.trim()
      });
      setNewCategory({ name: '' });
      setShowNewCategoryModal(false);
      toast.success('تم إضافة التصنيف بنجاح');
    }
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedCategory.name.trim()) {
      updateCategory({
        id: editedCategory.id,
        name: editedCategory.name.trim()
      });
      setShowEditCategoryModal(false);
      toast.success('تم تحديث التصنيف بنجاح');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.categoryId && newItem.unit && newItem.minQuantity && newItem.price) {
      const category = categories.find(c => c.id === newItem.categoryId);
      if (category) {
        addItem({
          id: `item-${Date.now()}`,
          name: newItem.name.trim(),
          category: category,
          unit: newItem.unit,
          currentQuantity: 0,
          minQuantity: parseInt(newItem.minQuantity),
          price: parseFloat(newItem.price),
          lastUpdated: new Date(),
          expiryDate: newItem.expiryDate ? new Date(newItem.expiryDate) : undefined
        });
        setNewItem({
          name: '',
          categoryId: '',
          unit: '',
          minQuantity: '',
          price: '',
          expiryDate: ''
        });
        setShowNewItemModal(false);
        toast.success('تم إضافة المادة بنجاح');
      }
    }
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      updateItem(selectedItem);
      setShowEditItemModal(false);
      toast.success('تم تحديث المادة بنجاح');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    try {
      deleteItem(itemId);
      toast.success('تم حذف المادة بنجاح');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-medium text-lg">القائمة</h2>
            </div>
            <ul>
              {[
                { icon: User, name: 'الملف الشخصي', id: 'profile' },
                { icon: Package, name: 'إدارة المخزون', id: 'inventory' },
                { icon: Building, name: 'بيانات الشركة', id: 'company' },
                { icon: Bell, name: 'الإشعارات', id: 'notifications' },
                { icon: Shield, name: 'الأمان', id: 'security' },
                { icon: Globe, name: 'اللغة والمنطقة', id: 'locale' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon 
                        className={`h-5 w-5 ${activeSection === item.id ? 'text-primary-500' : 'text-gray-500'}`} 
                      />
                      <span>{item.name}</span>
                    </div>
                    {activeSection === item.id && <ChevronLeft className="h-5 w-5" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-6">إعدادات الملف الشخصي</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                    <span className="text-3xl font-bold text-primary-500">أم</span>
                  </div>
                  <div>
                    <button className="btn btn-primary text-sm">تغيير الصورة</button>
                    <p className="text-xs text-gray-500 mt-1">JPG أو PNG. الحد الأقصى 1MB</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="input"
                      defaultValue="أحمد"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الأخير
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="input"
                      defaultValue="محمد"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="input"
                      defaultValue="ahmed@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="input"
                      defaultValue="+962 7777 77777"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      الدور الوظيفي
                    </label>
                    <input
                      type="text"
                      id="role"
                      className="input"
                      defaultValue="مدير المخزن"
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="btn btn-primary px-6">حفظ التغييرات</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">إدارة التصنيفات</h2>
                  <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setShowNewCategoryModal(true)}
                  >
                    <Plus className="h-5 w-5" />
                    <span>إضافة تصنيف</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(category => (
                    <div 
                      key={category.id}
                      className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-gray-500 hover:text-primary-500"
                          onClick={() => {
                            setEditedCategory({ id: category.id, name: category.name });
                            setShowEditCategoryModal(true);
                          }}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-danger-500"
                          onClick={() => {
                            try {
                              deleteCategory(category.id);
                              toast.success('تم حذف التصنيف بنجاح');
                            } catch (error: any) {
                              toast.error(error.message);
                            }
                          }}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">إدارة المواد</h2>
                  <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setShowNewItemModal(true)}
                  >
                    <Plus className="h-5 w-5" />
                    <span>إضافة مادة</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="input"
                        placeholder="بحث عن مادة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <select
                        className="select"
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      >
                        <option value="">جميع التصنيفات</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>اسم المادة</th>
                          <th>التصنيف</th>
                          <th>الوحدة</th>
                          <th>الحد الأدنى</th>
                          <th>السعر (د.أ)</th>
                          <th>تاريخ الإنتهاء</th>
                          <th>الحالة</th>
                          <th>إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => (
                          <tr key={item.id}>
                            <td className="font-medium">{item.name}</td>
                            <td>
                              <span className="badge bg-gray-100 text-gray-800">
                                {item.category.name}
                              </span>
                            </td>
                            <td>{item.unit}</td>
                            <td>{item.minQuantity}</td>
                            <td>{item.price.toFixed(2)}</td>
                            <td>
                              {item.expiryDate ? formatDateArabic(item.expiryDate) : '-'}
                            </td>
                            <td>
                              {item.currentQuantity <= item.minQuantity ? (
                                <span className="badge bg-danger-100 text-danger-800 flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  تحت الحد الأدنى
                                </span>
                              ) : (
                                <span className="badge bg-success-100 text-success-800">
                                  طبيعي
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="text-primary-600 hover:text-primary-800 ml-2"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowEditItemModal(true);
                                }}
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                className="text-danger-600 hover:text-danger-800"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-6">إعدادات الإشعارات</h2>

                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">تنبيهات المخزون</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">تفعيل تنبيهات المخزون</label>
                          <p className="text-sm text-gray-500">تنبيهات عند وصول المواد للحد الأدنى</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="lowStock"
                            className="sr-only peer"
                            checked={notificationSettings.lowStock}
                            onChange={handleNotificationSettingsChange}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          نسبة التنبيه من الحد الأدنى
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            name="lowStockThreshold"
                            min="0"
                            max="200"
                            step="10"
                            value={notificationSettings.lowStockThreshold}
                            onChange={handleNotificationSettingsChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm text-gray-600 min-w-[4rem]">
                            {notificationSettings.lowStockThreshold}%
                          </span>
                        </div>
                      </div>

                      {lowStockItems.length > 0 && (
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-warning-800 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <h4 className="font-medium">يوجد {lowStockItems.length} مواد تحت الحد الأدنى</h4>
                          </div>
                          <ul className="space-y-2">
                            {lowStockItems.map(item => (
                              <li key={item.id} className="flex items-center justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-warning-600">
                                  {item.currentQuantity} / {item.minQuantity} {item.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">تنبيهات المستحقات</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">تفعيل تنبيهات المستحقات</label>
                          <p className="text-sm text-gray-500">تنبيهات عند تجاوز مستحقات الموردين الحد المسموح</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="supplierBalance"
                            className="sr-only peer"
                            checked={notificationSettings.supplierBalance}
                            onChange={handleNotificationSettingsChange}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          الحد الأقصى للمستحقات (د.أ)
                        </label>
                        <input
                          type="number"
                          name="supplierBalanceThreshold"
                          min="0"
                          step="100"
                          value={notificationSettings.supplierBalanceThreshold}
                          onChange={handleNotificationSettingsChange}
                          className="input w-full md:w-1/3"
                        />
                      </div>

                      {suppliersWithHighBalance.length > 0 && (
                        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-danger-800 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <h4 className="font-medium">يوجد {suppliersWithHighBalance.length} موردين تجاوزوا الحد الأقصى</h4>
                          </div>
                          <ul className="space-y-2">
                            {suppliersWithHighBalance.map(supplier => (
                              <li key={supplier.id} className="flex items-center justify-between text-sm">
                                <span>{supplier.name}</span>
                                <span className="text-danger-600">{supplier.balance.toFixed(2)} د.أ</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">طرق الإشعار</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">إشعارات البريد الإلكتروني</label>
                          <p className="text-sm text-gray-500">استلام الإشعارات عبر البريد الإلكتروني</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            className="sr-only peer"
                            checked={notificationSettings.emailNotifications}
                            onChange={handleNotificationSettingsChange}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">إشعارات المتصفح</label>
                          <p className="text-sm text-gray-500">استلام الإشعارات في المتصفح</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="browserNotifications"
                            className="sr-only peer"
                            checked={notificationSettings.browserNotifications}
                            onChange={handleNotificationSettingsChange}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      className="btn btn-primary px-6"
                      onClick={() => toast.success('تم حفظ إعدادات الإشعارات')}
                    >
                      حفظ الإعدادات
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">إضافة تصنيف جديد</h3>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم التصنيف
                </label>
                <input
                  type="text"
                  id="categoryName"
                  className="input"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowNewCategoryModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">إضافة مادة جديدة</h3>
            <form onSubmit={handleAddItem}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المادة
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    className="input"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    التصنيف
                  </label>
                  <select
                    id="itemCategory"
                    className="select"
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem,categoryId: e.target.value })}
                    required
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="itemUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    وحدة القياس
                  </label>
                  <input
                    type="text"
                    id="itemUnit"
                    className="input"
                    placeholder="مثال: كيلو، لتر، قطعة"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemMinQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأدنى
                  </label>
                  <input
                    type="number"
                    id="itemMinQuantity"
                    className="input"
                    min="0"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem({ ...newItem, minQuantity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    سعر الوحدة (د.أ)
                  </label>
                  <input
                    type="number"
                    id="itemPrice"
                    className="input"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الإنتهاء
                  </label>
                  <input
                    type="date"
                    id="itemExpiryDate"
                    className="input"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowNewItemModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">تعديل المادة</h3>
            <form onSubmit={handleEditItem}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editItemName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المادة
                  </label>
                  <input
                    type="text"
                    id="editItemName"
                    className="input"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editItemCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    التصنيف
                  </label>
                  <select
                    id="editItemCategory"
                    className="select"
                    value={selectedItem.category.id}
                    onChange={(e) => {
                      const category = categories.find(c => c.id === e.target.value);
                      if (category) {
                        setSelectedItem({ ...selectedItem, category });
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
                  <label htmlFor="editItemUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    وحدة القياس
                  </label>
                  <input
                    type="text"
                    id="editItemUnit"
                    className="input"
                    value={selectedItem.unit}
                    onChange={(e) => setSelectedItem({ ...selectedItem, unit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editItemMinQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    الحد الأدنى
                  </label>
                  <input
                    type="number"
                    id="editItemMinQuantity"
                    className="input"
                    min="0"
                    value={selectedItem.minQuantity}
                    onChange={(e) => setSelectedItem({ ...selectedItem, minQuantity: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editItemPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    سعر الوحدة (د.أ)
                  </label>
                  <input
                    type="number"
                    id="editItemPrice"
                    className="input"
                    min="0"
                    step="0.01"
                    value={selectedItem.price}
                    onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editItemExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الإنتهاء
                  </label>
                  <input
                    type="date"
                    id="editItemExpiryDate"
                    className="input"
                    value={selectedItem.expiryDate ? selectedItem.expiryDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, expiryDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedItem(null);
                    setShowEditItemModal(false);
                  }}
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

      {showEditCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">تعديل التصنيف</h3>
            <form onSubmit={handleEditCategory}>
              <div className="mb-4">
                <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم التصنيف
                </label>
                <input
                  type="text"
                  id="editCategoryName"
                  className="input"
                  value={editedCategory.name}
                  onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowEditCategoryModal(false)}
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

export default Settings;