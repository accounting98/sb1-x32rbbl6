import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventoryStore } from '../stores/inventoryStore';
import { Package, Search, Filter, ArrowUpDown, Plus, FileDown } from 'lucide-react';
import { formatDateTimeArabic, formatCurrency } from '../utils/dateFormatter';
import { generateInventoryReport } from '../utils/reportGenerator';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { items, categories } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Update document title
  useEffect(() => {
    document.title = 'المخزون | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  // Filter and sort items
  useEffect(() => {
    let result = [...items];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(item => item.category.id === selectedCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'quantity':
          valueA = a.currentQuantity;
          valueB = b.currentQuantity;
          break;
        case 'category':
          valueA = a.category.name;
          valueB = b.category.name;
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'value':
          valueA = a.currentQuantity * a.price;
          valueB = b.currentQuantity * b.price;
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }

      if (typeof valueA === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });

    setFilteredItems(result);
  }, [items, searchTerm, selectedCategory, sortField, sortDirection]);

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort arrow
  const renderSortArrow = (field: string) => {
    if (field !== sortField) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown className="h-4 w-4 text-primary-500" /> 
      : <ArrowUpDown className="h-4 w-4 text-primary-500 transform rotate-180" />;
  };

  const handleExport = async () => {
    try {
      await generateInventoryReport(filteredItems, [], [], {
        totalValue: filteredItems.reduce((sum, item) => sum + (item.currentQuantity * item.price), 0),
        lowStockCount: filteredItems.filter(item => item.currentQuantity <= item.minQuantity).length,
        totalBalance: 0
      });
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">المخزون</h1>
        
        <div className="flex space-x-3 space-x-reverse">
          <Link 
            to="/inventory/add-incoming" 
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>تسجيل وارد</span>
          </Link>
          <Link 
            to="/inventory/add-outgoing" 
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>تسجيل صادر</span>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            بحث
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="input pr-10"
              placeholder="ابحث عن اسم المادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            التصنيف
          </label>
          <select
            id="category"
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">جميع التصنيفات</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          className="flex items-center gap-2 text-gray-600 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={handleExport}
        >
          <FileDown className="h-5 w-5" />
          <span>تصدير</span>
        </button>
      </div>
      
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="cursor-pointer hover:bg-gray-200" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center justify-between">
                    <span>اسم المادة</span>
                    {renderSortArrow('name')}
                  </div>
                </th>
                <th
                  className="cursor-pointer hover:bg-gray-200" 
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center justify-between">
                    <span>التصنيف</span>
                    {renderSortArrow('category')}
                  </div>
                </th>
                <th
                  className="cursor-pointer hover:bg-gray-200" 
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-between">
                    <span>الكمية الحالية</span>
                    {renderSortArrow('quantity')}
                  </div>
                </th>
                <th>الحد الأدنى</th>
                <th
                  className="cursor-pointer hover:bg-gray-200" 
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-between">
                    <span>سعر الوحدة</span>
                    {renderSortArrow('price')}
                  </div>
                </th>
                <th
                  className="cursor-pointer hover:bg-gray-200" 
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-between">
                    <span>القيمة الإجمالية</span>
                    {renderSortArrow('value')}
                  </div>
                </th>
                <th>آخر تحديث</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td>
                      <Link 
                        to={`/inventory/${item.id}`} 
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-800"
                      >
                        <Package className="h-5 w-5" />
                        <span className="underline">{item.name}</span>
                      </Link>
                    </td>
                    <td>
                      <span className="badge bg-gray-100 text-gray-800">
                        {item.category.name}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${item.currentQuantity <= item.minQuantity ? 'text-danger-600' : 'text-gray-900'}`}>
                          {item.currentQuantity}
                        </span>
                        <span className="text-gray-500">{item.unit}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span>{item.minQuantity}</span>
                        <span className="text-gray-500">{item.unit}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td className="font-medium">
                      {formatCurrency(item.currentQuantity * item.price)}
                    </td>
                    <td className="text-gray-500 text-sm">
                      {formatDateTimeArabic(item.lastUpdated)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد مواد مطابقة لمعايير البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;