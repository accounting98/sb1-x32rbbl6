import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupplierStore } from '../stores/supplierStore';
import { Search, Plus, Truck, Phone, Mail, CreditCard, Edit } from 'lucide-react';
import { formatCurrency } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
    paymentTerms: 'دفع فوري'
  });
  
  // Update document title
  useEffect(() => {
    document.title = 'الموردين | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  // Filter suppliers
  useEffect(() => {
    if (searchTerm) {
      const filtered = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [suppliers, searchTerm]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplier = {
      id: `sup-${Date.now()}`,
      ...newSupplier,
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      transactions: []
    };

    addSupplier(supplier);
    setNewSupplier({
      name: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      paymentTerms: 'دفع فوري'
    });
    setShowNewSupplierModal(false);
    toast.success('تم إضافة المورد بنجاح');
  };

  const handleEditSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSupplier) {
      updateSupplier(selectedSupplier);
      setSelectedSupplier(null);
      setShowEditSupplierModal(false);
      toast.success('تم تحديث بيانات المورد بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">الموردين</h1>
        
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowNewSupplierModal(true)}
        >
          <Plus className="h-5 w-5" />
          <span>إضافة مورد</span>
        </button>
      </div>
      
      <div className="w-full md:w-1/3">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pr-10"
            placeholder="ابحث عن مورد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(supplier => (
            <div 
              key={supplier.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <Link 
                  to={`/suppliers/${supplier.id}`}
                  className="flex items-center gap-3 hover:text-primary-600"
                >
                  <div className="p-2 rounded-full bg-primary-100">
                    <Truck className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-900 mb-1">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowEditSupplierModal(true);
                    }}
                    className="text-gray-500 hover:text-primary-600"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <span className={`badge ${
                    supplier.balance > 0 
                      ? 'bg-danger-100 text-danger-800' 
                      : 'bg-success-100 text-success-800'
                  }`}>
                    {supplier.balance > 0 ? 'رصيد مستحق' : 'رصيد مسدد'}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{supplier.email}</span>
                </div>
                
                <div className="pt-2 mt-2 border-t">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">المبلغ المستحق:</span>
                    <span className={`font-medium ${
                      supplier.balance > 0 ? 'text-danger-600' : 'text-success-600'
                    }`}>
                      {formatCurrency(supplier.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            لا يوجد موردين مطابقين لمعايير البحث
          </div>
        )}
      </div>

      {/* Modal for adding new supplier */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">إضافة مورد جديد</h3>
            <form onSubmit={handleAddSupplier}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الشركة
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                    الشخص المسؤول
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    className="input"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    required
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
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    required
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
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="input"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                    شروط الدفع
                  </label>
                  <select
                    id="paymentTerms"
                    className="select"
                    value={newSupplier.paymentTerms}
                    onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                    required
                  >
                    <option value="دفع فوري">دفع فوري</option>
                    <option value="دفع آجل 15 يوم">دفع آجل 15 يوم</option>
                    <option value="دفع آجل 30 يوم">دفع آجل 30 يوم</option>
                    <option value="دفع آجل 45 يوم">دفع آجل 45 يوم</option>
                    <option value="دفع بالتقسيط">دفع بالتقسيط</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowNewSupplierModal(false)}
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

      {/* Modal for editing supplier */}
      {showEditSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">تعديل بيانات المورد</h3>
            <form onSubmit={handleEditSupplier}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الشركة
                  </label>
                  <input
                    type="text"
                    id="editName"
                    className="input"
                    value={selectedSupplier.name}
                    onChange={(e) => setSelectedSupplier({ ...selectedSupplier, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editContactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                    الشخص المسؤول
                  </label>
                  <input
                    type="text"
                    id="editContactPerson"
                    className="input"
                    value={selectedSupplier.contactPerson}
                    onChange={(e) => setSelectedSupplier({ ...selectedSupplier, contactPerson: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="editPhone"
                    className="input"
                    value={selectedSupplier.phone}
                    onChange={(e) => setSelectedSupplier({ ...selectedSupplier, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="editEmail"
                    className="input"
                    value={selectedSupplier.email}
                    onChange={(e) => setSelectedSupplier({ ...selectedSupplier, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    id="editAddress"
                    className="input"
                    value={selectedSupplier.address}
                    onChange={(e) => setSelectedSupplier({ ...selectedSupplier, address: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editPaymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                    شروط الدفع
                  </label>
                  <select
                    id="editPaymentTerms"
                    className="select"
                    value={selectedSupplier.paymentTerms}
                    onChange={(e) => setSelectedSupplier({ ...selectedSupplier, paymentTerms: e.target.value })}
                    required
                  >
                    <option value="دفع فوري">دفع فوري</option>
                    <option value="دفع آجل 15 يوم">دفع آجل 15 يوم</option>
                    <option value="دفع آجل 30 يوم">دفع آجل 30 يوم</option>
                    <option value="دفع آجل 45 يوم">دفع آجل 45 يوم</option>
                    <option value="دفع بالتقسيط">دفع بالتقسيط</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedSupplier(null);
                    setShowEditSupplierModal(false);
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
    </div>
  );
};

export default Suppliers;