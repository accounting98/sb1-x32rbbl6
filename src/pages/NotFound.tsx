import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mt-2">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        
        <Link 
          to="/" 
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;