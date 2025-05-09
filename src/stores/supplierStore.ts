import { create } from 'zustand';
import { Supplier, SupplierTransaction } from '../types/supplier';

interface SupplierState {
  suppliers: Supplier[];
  
  // Actions
  initSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  addTransaction: (supplierId: string, transaction: SupplierTransaction) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getTotalBalance: () => number;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  
  initSuppliers: (suppliers) => {
    set({ suppliers });
  },
  
  addSupplier: (supplier) => {
    set((state) => ({
      suppliers: [...state.suppliers, supplier]
    }));
  },
  
  updateSupplier: (updatedSupplier) => {
    set((state) => ({
      suppliers: state.suppliers.map((supplier) => 
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    }));
  },
  
  addTransaction: (supplierId, transaction) => {
    set((state) => {
      const updatedSuppliers = [...state.suppliers];
      const supplierIndex = updatedSuppliers.findIndex(s => s.id === supplierId);
      
      if (supplierIndex !== -1) {
        const supplier = updatedSuppliers[supplierIndex];
        
        // Update supplier financials based on transaction type
        if (transaction.type === 'purchase') {
          updatedSuppliers[supplierIndex] = {
            ...supplier,
            totalPurchases: supplier.totalPurchases + transaction.amount,
            totalPaid: supplier.totalPaid + transaction.paid,
            balance: supplier.balance + transaction.balance,
            transactions: [...supplier.transactions, transaction]
          };
        } else if (transaction.type === 'payment') {
          updatedSuppliers[supplierIndex] = {
            ...supplier,
            totalPaid: supplier.totalPaid + transaction.amount,
            balance: supplier.balance - transaction.amount,
            transactions: [...supplier.transactions, transaction]
          };
        }
      }
      
      return { suppliers: updatedSuppliers };
    });
  },
  
  getSupplierById: (id) => {
    return get().suppliers.find(supplier => supplier.id === id);
  },
  
  getTotalBalance: () => {
    return get().suppliers.reduce((total, supplier) => {
      return total + supplier.balance;
    }, 0);
  }
}));