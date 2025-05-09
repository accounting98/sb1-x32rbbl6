import { useState, useEffect } from 'react';
import { useInventoryStore } from '../stores/inventoryStore';
import { Search, Filter, Calendar, AlertTriangle, Download } from 'lucide-react';
import { formatDateArabic } from '../utils/dateFormatter';

const ExpiryDates = () => {
  const { items, categories } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'expired'>('all');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    document.title = 'تواريخ الإنتهاء | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  useEffect(() => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category.id === selectedCategory);
    }

    // Apply date filter
    const today = new Date();
    switch (dateFilter) {
      case 'week':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filtered = filtered.filter(item => 
          item.expiryDate && 
          item.expiryDate > today && 
          item.expiryDate <= nextWeek
        );
        break;
      case 'month':
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        filtered = filtered.filter(item => 
          item.expiryDate && 
          item.expiryDate > today && 
          item.expiryDate <= nextMonth
        );
        break;
      case 'expired':
        filtered = filtered.filter(item => 
          item.expiryDate && item.expiryDate < today
        );
        break;
    }

    // Sort by expiry date (closest first)
    filtered.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return a.expiryDate.getTime() - b.expiryDate.getTime();
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, dateFilter]);

  // Calculate statistics
  const today = new Date();
  const expiredCount = items.filter(item => item.expiryDate && item.expiryDate < today).length;
  const expiringThisWeekCount = items.filter(item => {
    if (!item.expiryDate) return false;
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return item.expiryDate > today && item.expiryDate <= nextWeek;
  }).length;
  const expiringThisMonthCount = items.filter(item => {
    if (!item.expiryDate) return false;
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return item.expiryDate > today && item.expiryDate <= nextMonth;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">تواريخ الإنتهاء</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-danger-50 border border-danger-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-danger-800 font-medium">المواد المنتهية</h3>
            <AlertTriangle className="h-5 w-5 text-danger-500" />
          </div>
          <p className="text-2xl font-bold text-danger-900">{expiredCount}</p>
          <p className="text-sm text-danger-600 mt-1">مادة منتهية الصلاحية</p>
        </div>

        <div className="bg-warning-50 border border-warning-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-warning-800 font-medium">تنتهي خلال أسبوع</h3>
            <Calendar className="h-5 w-5 text-warning-500" />
          </div>
          <p className="text-2xl font-bold text-warning-900">{expiringThisWeekCount}</p>
          <p className="text-sm text-warning-600 mt-1">مواد تنتهي خلال 7 أيام</p>
        </div>

        <div className="bg-info-50 border border-info-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-info-800 font-medium">تنتهي خلال شهر</h3>
            <Calendar className="h-5 w-5 text-info-500" />
          </div>
          <p className="text-2xl font-bold text-info-900">{expiringThisMonthCount}</p>
          <p className="text-sm text-info-600 mt-1">مواد تنتهي خلال 30 يوم</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pr-10"
                  placeholder="بحث عن مادة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <select
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

            <div className="w-full md:w-48">
              <select
                className="select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
              >
                <option value="all">جميع التواريخ</option>
                <option value="expired">منتهية الصلاحية</option>
                <option value="week">تنتهي خلال أسبوع</option>
                <option value="month">تنتهي خلال شهر</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>المادة</th>
                  <th>التصنيف</th>
                  <th>الكمية الحالية</th>
                  <th>تاريخ الإنتهاء</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => {
                    const today = new Date();
                    let status: { text: string; class: string } = { text: '', class: '' };
                    
                    if (!item.expiryDate) {
                      status = { text: 'غير محدد', class: 'bg-gray-100 text-gray-800' };
                    } else if (item.expiryDate < today) {
                      status = { text: 'منتهية الصلاحية', class: 'bg-danger-100 text-danger-800' };
                    } else {
                      const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      if (daysUntilExpiry <= 7) {
                        status = { text: 'تنتهي خلال أسبوع', class: 'bg-warning-100 text-warning-800' };
                      } else if (daysUntilExpiry <= 30) {
                        status = { text: 'تنتهي خلال شهر', class: 'bg-info-100 text-info-800' };
                      } else {
                        status = { text: 'سارية الصلاحية', class: 'bg-success-100 text-success-800' };
                      }
                    }

                    return (
                      <tr key={item.id}>
                        <td className="font-medium">{item.name}</td>
                        <td>
                          <span className="badge bg-gray-100 text-gray-800">
                            {item.category.name}
                          </span>
                        </td>
                        <td>
                          {item.currentQuantity} {item.unit}
                        </td>
                        <td>
                          {item.expiryDate ? formatDateArabic(item.expiryDate) : '-'}
                        </td>
                        <td>
                          <span className={`badge ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      لا توجد مواد مطابقة لمعايير البحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiryDates;