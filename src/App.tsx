import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Branches from './pages/Branches';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import SupplierDetails from './pages/SupplierDetails';
import BranchDetails from './pages/BranchDetails';
import BranchInvoices from './pages/BranchInvoices';
import AddIncomingInventory from './pages/AddIncomingInventory';
import AddOutgoingInventory from './pages/AddOutgoingInventory';
import InventoryDetails from './pages/InventoryDetails';
import { initializeData } from './utils/initialData';
import { useInventoryStore } from './stores/inventoryStore';
import { useSupplierStore } from './stores/supplierStore';
import { useBranchStore } from './stores/branchStore';

function App() {
  const { initInventory } = useInventoryStore();
  const { initSuppliers } = useSupplierStore();
  const { initBranches } = useBranchStore();

  useEffect(() => {
    // Initialize data stores with demo data
    const initialData = initializeData();
    initInventory(initialData.inventory);
    initSuppliers(initialData.suppliers);
    initBranches(initialData.branches);
  }, [initInventory, initSuppliers, initBranches]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="inventory">
          <Route index element={<Inventory />} />
          <Route path="add-incoming" element={<AddIncomingInventory />} />
          <Route path="add-outgoing" element={<AddOutgoingInventory />} />
          <Route path=":id" element={<InventoryDetails />} />
        </Route>
        <Route path="suppliers">
          <Route index element={<Suppliers />} />
          <Route path=":id" element={<SupplierDetails />} />
        </Route>
        <Route path="branches">
          <Route index element={<Branches />} />
          <Route path="invoices" element={<BranchInvoices />} />
          <Route path=":id" element={<BranchDetails />} />
        </Route>
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;