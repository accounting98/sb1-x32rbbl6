import { Menu, Search } from 'lucide-react';

interface NavbarProps {
  openSidebar: () => void;
}

const Navbar = ({ openSidebar }: NavbarProps) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-gray-600 lg:hidden focus:outline-none"
            onClick={openSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div className="relative max-w-xs w-full hidden md:block">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="بحث..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-lg font-medium text-gray-900">مهندس محمد النوافله</div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;