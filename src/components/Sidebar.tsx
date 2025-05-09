import { Link, useLocation } from 'react-router-dom';
import { Home, PackageOpen, Truck, Store, FileBarChart, Settings, Warehouse } from 'lucide-react';

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'لوحة التحكم', path: '/', icon: Home },
    { name: 'المخزون', path: '/inventory', icon: PackageOpen },
    { name: 'الموردين', path: '/suppliers', icon: Truck },
    { name: 'الفروع', path: '/branches', icon: Store },
    { name: 'التقارير', path: '/reports', icon: FileBarChart },
    { name: 'الإعدادات', path: '/settings', icon: Settings }
  ];
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center p-4 border-b">
        <Link to="/" className="flex items-center space-x-2 space-x-reverse text-primary-600" onClick={closeSidebar}>
          <Warehouse className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">نظام المخزون</h1>
            <p className="text-xs text-gray-500">المخابز والحلويات</p>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeSidebar}
              >
                <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-primary-500' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;