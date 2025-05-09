import { useState, useEffect } from 'react';
import { useBranchStore } from '../stores/branchStore';
import { Search, Plus, Store, MapPin, Phone, User, Users, Edit, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Branches = () => {
  const { branches, addBranch, updateBranch } = useBranchStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBranches, setFilteredBranches] = useState(branches);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    phone: '',
    manager: '',
    representatives: [{ id: '', name: '', phone: '', role: '' }]
  });
  
  // Update document title
  useEffect(() => {
    document.title = 'الفروع | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  // Filter branches
  useEffect(() => {
    if (searchTerm) {
      const filtered = branches.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBranches(filtered);
    } else {
      setFilteredBranches(branches);
    }
  }, [branches, searchTerm]);

  const handleAddRepresentative = () => {
    setNewBranch({
      ...newBranch,
      representatives: [
        ...newBranch.representatives,
        { id: '', name: '', phone: '', role: '' }
      ]
    });
  };

  const handleRemoveRepresentative = (index: number) => {
    const updatedRepresentatives = newBranch.representatives.filter((_, i) => i !== index);
    setNewBranch({
      ...newBranch,
      representatives: updatedRepresentatives
    });
  };

  const handleRepresentativeChange = (index: number, field: string, value: string) => {
    const updatedRepresentatives = newBranch.representatives.map((rep, i) => {
      if (i === index) {
        return { ...rep, [field]: value };
      }
      return rep;
    });
    setNewBranch({
      ...newBranch,
      representatives: updatedRepresentatives
    });
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const branch = {
      id: `branch-${Date.now()}`,
      ...newBranch,
      representatives: newBranch.representatives.map(rep => ({
        ...rep,
        id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    addBranch(branch);
    setNewBranch({
      name: '',
      location: '',
      phone: '',
      manager: '',
      representatives: [{ id: '', name: '', phone: '', role: '' }]
    });
    setShowNewBranchModal(false);
    toast.success('تم إضافة الفرع بنجاح');
  };

  const handleEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBranch) {
      updateBranch(selectedBranch);
      setShowEditBranchModal(false);
      toast.success('تم تحديث بيانات الفرع بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">الفروع</h1>
        
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowNewBranchModal(true)}
        >
          <Plus className="h-5 w-5" />
          <span>إضافة فرع</span>
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
            placeholder="ابحث عن فرع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.length > 0 ? (
          filteredBranches.map(branch => (
            <div 
              key={branch.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <Link 
                    to={`/branches/${branch.id}`}
                    className="flex items-center gap-3 hover:text-primary-600"
                  >
                    <div className="p-2 rounded-full bg-secondary-100">
                      <Store className="h-5 w-5 text-secondary-600" />
                    </div>
                    <h3 className="font-medium text-lg text-gray-900">{branch.name}</h3>
                  </Link>
                  <button
                    className="text-gray-500 hover:text-primary-500"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowEditBranchModal(true);
                    }}
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{branch.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{branch.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{branch.manager}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>المندوبين</span>
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">
                      {branch.representatives.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {branch.representatives.map(rep => (
                      <div key={rep.id} className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm font-medium">{rep.name}</p>
                          <p className="text-xs text-gray-500">{rep.role}</p>
                        </div>
                        <span className="text-xs text-primary-600">{rep.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            لا يوجد فروع مطابقة لمعايير البحث
          </div>
        )}
      </div>

      {/* Modal for adding new branch */}
      {showNewBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">إضافة فرع جديد</h3>
            <form onSubmit={handleAddBranch}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الفرع *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="input"
                    value={newBranch.location}
                    onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="input"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                    مدير الفرع *
                  </label>
                  <input
                    type="text"
                    id="manager"
                    className="input"
                    value={newBranch.manager}
                    onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      المندوبين *
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-800"
                      onClick={handleAddRepresentative}
                    >
                      + إضافة مندوب
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newBranch.representatives.map((rep, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
                        {index > 0 && (
                          <button
                            type="button"
                            className="absolute left-2 top-2 text-gray-400 hover:text-danger-500"
                            onClick={() => handleRemoveRepresentative(index)}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              اسم المندوب *
                            </label>
                            <input
                              type="text"
                              className="input"
                              value={rep.name}
                              onChange={(e) => handleRepresentativeChange(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              رقم الهاتف *
                            </label>
                            <input
                              type="tel"
                              className="input"
                              value={rep.phone}
                              onChange={(e) => handleRepresentativeChange(index, 'phone', e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              الدور الوظيفي *
                            </label>
                            <input
                              type="text"
                              className="input"
                              placeholder="مثال: مندوب استلام"
                              value={rep.role}
                              onChange={(e) => handleRepresentativeChange(index, 'role', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowNewBranchModal(false)}
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

      {/* Modal for editing branch */}
      {showEditBranchModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">تعديل بيانات الفرع</h3>
            <form onSubmit={handleEditBranch}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الفرع *
                  </label>
                  <input
                    type="text"
                    id="editName"
                    className="input"
                    value={selectedBranch.name}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    id="editLocation"
                    className="input"
                    value={selectedBranch.location}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    id="editPhone"
                    className="input"
                    value={selectedBranch.phone}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editManager" className="block text-sm font-medium text-gray-700 mb-1">
                    مدير الفرع *
                  </label>
                  <input
                    type="text"
                    id="editManager"
                    className="input"
                    value={selectedBranch.manager}
                    onChange={(e) => setSelectedBranch({ ...selectedBranch, manager: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      المندوبين *
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:text-primary-800"
                      onClick={() => {
                        setSelectedBranch({
                          ...selectedBranch,
                          representatives: [
                            ...selectedBranch.representatives,
                            { id: `rep-${Date.now()}`, name: '', phone: '', role: '' }
                          ]
                        });
                      }}
                    >
                      + إضافة مندوب
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedBranch.representatives.map((rep: any, index: number) => (
                      <div key={rep.id} className="p-4 border rounded-lg bg-gray-50 relative">
                        {selectedBranch.representatives.length > 1 && (
                          <button
                            type="button"
                            className="absolute left-2 top-2 text-gray-400 hover:text-danger-500"
                            onClick={() => {
                              const updatedRepresentatives = selectedBranch.representatives.filter((_: any, i: number) => i !== index);
                              setSelectedBranch({
                                ...selectedBranch,
                                representatives: updatedRepresentatives
                              });
                            }}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              اسم المندوب *
                            </label>
                            <input
                              type="text"
                              className="input"
                              value={rep.name}
                              onChange={(e) => {
                                const updatedRepresentatives = selectedBranch.representatives.map((r: any, i: number) => 
                                  i === index ? { ...r, name: e.target.value } : r
                                );
                                setSelectedBranch({
                                  ...selectedBranch,
                                  representatives: updatedRepresentatives
                                });
                              }}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              رقم الهاتف *
                            </label>
                            <input
                              type="tel"
                              className="input"
                              value={rep.phone}
                              onChange={(e) => {
                                const updatedRepresentatives = selectedBranch.representatives.map((r: any, i: number) => 
                                  i === index ? { ...r, phone: e.target.value } : r
                                );
                                setSelectedBranch({
                                  ...selectedBranch,
                                  representatives: updatedRepresentatives
                                });
                              }}
                              required
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              الدور الوظيفي *
                            </label>
                            <input
                              type="text"
                              className="input"
                              value={rep.role}
                              onChange={(e) => {
                                const updatedRepresentatives = selectedBranch.representatives.map((r: any, i: number) => 
                                  i === index ? { ...r, role: e.target.value } : r
                                );
                                setSelectedBranch({
                                  ...selectedBranch,
                                  representatives: updatedRepresentatives
                                });
                              }}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedBranch(null);
                    setShowEditBranchModal(false);
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

export default Branches;