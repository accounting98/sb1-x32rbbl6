import { Routes, Route } from 'react-router-dom';
import Layout from './Layout.js';
import Dashboard from './Dashboard.js';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        {/* Add other routes */}
      </Route>
    </Routes>
  );
}

export default App;