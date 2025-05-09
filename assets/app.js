// Get React components and hooks
const { useState, useEffect } = React;

// Icons from Lucide
const { 
  Home, 
  Package, 
  Truck,
  Store,
  FileBarChart,
  Settings,
  Menu,
  Search,
  Bell
} = lucide;

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: 'لوحة التحكم', icon: Home },
    { name: 'المخزون', icon: Package },
    { name: 'الموردين', icon: Truck },
    { name: 'الفروع', icon: Store },
    { name: 'التقارير', icon: FileBarChart },
    { name: 'الإعدادات', icon: Settings }
  ];

  return React.createElement('div', {
    className: `sidebar ${!isOpen ? 'hidden' : ''}`
  },
    React.createElement('div', { className: 'p-4 border-b' },
      React.createElement('h1', { className: 'text-xl font-bold text-primary-600' }, 'نظام المخزون'),
      React.createElement('p', { className: 'text-sm text-gray-500' }, 'المخابز والحلويات')
    ),
    React.createElement('nav', { className: 'py-4' },
      React.createElement('ul', { className: 'space-y-1' },
        navItems.map((item, index) => 
          React.createElement('li', { key: index },
            React.createElement('a', {
              href: '#',
              className: `nav-item ${index === 0 ? 'active' : ''}`,
              onClick: (e) => {
                e.preventDefault();
                console.log(item.name);
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }
            },
              React.createElement(item.icon, { className: 'h-5 w-5 ml-3' }),
              React.createElement('span', null, item.name)
            )
          )
        )
      )
    )
  );
}

// Navbar Component
function Navbar({ openSidebar }) {
  return React.createElement('header', { className: 'bg-white shadow-sm z-10 sticky top-0' },
    React.createElement('div', { className: 'container flex items-center justify-between py-4' },
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement('button', {
          className: 'lg:hidden btn',
          onClick: openSidebar
        },
          React.createElement(Menu, { size: 24 })
        ),
        React.createElement('div', { className: 'relative max-w-xs w-full hidden md:block' },
          React.createElement('div', { className: 'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none' },
            React.createElement(Search, { className: 'h-5 w-5 text-gray-400' })
          ),
          React.createElement('input', {
            type: 'text',
            className: 'w-full pr-10 py-2 border border-gray-300 rounded-md',
            placeholder: 'بحث...'
          })
        )
      ),
      React.createElement('div', { className: 'flex items-center space-x-4 space-x-reverse' },
        React.createElement('div', { className: 'text-lg font-medium' }, 'مهندس محمد النوافله')
      )
    )
  );
}

// Stats Component
function Stats({ stats }) {
  return React.createElement('div', { className: 'stats-grid' },
    stats.map((stat, index) => 
      React.createElement('div', { 
        key: index,
        className: 'stat-card'
      },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'stat-title' }, stat.title),
            React.createElement('p', { className: 'stat-value' }, stat.value)
          ),
          React.createElement('div', { className: 'p-2 rounded-full bg-gray-50' },
            React.createElement(stat.icon, { 
              className: 'h-5 w-5 text-primary-500'
            })
          )
        )
      )
    )
  );
}

// Dashboard Component
function Dashboard() {
  const stats = [
    {
      title: 'قيمة المخزون',
      value: '12,500 د.أ',
      icon: Package
    },
    {
      title: 'المستحقات للموردين',
      value: '4,200 د.أ',
      icon: Truck
    },
    {
      title: 'مواد تحت الحد الأدنى',
      value: '8',
      icon: Bell
    },
    {
      title: 'عدد المعاملات الشهرية',
      value: '156',
      icon: FileBarChart
    }
  ];

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'لوحة التحكم')
    ),
    React.createElement(Stats, { stats: stats })
  );
}

// Layout Component
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return React.createElement('div', { className: 'flex min-h-screen bg-gray-50' },
    React.createElement(Sidebar, {
      isOpen: sidebarOpen,
      onClose: () => setSidebarOpen(false)
    }),
    React.createElement('div', { className: 'flex-1' },
      React.createElement(Navbar, { openSidebar: () => setSidebarOpen(true) }),
      React.createElement('main', { className: 'main-content' },
        React.createElement(Dashboard)
      )
    )
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Layout));