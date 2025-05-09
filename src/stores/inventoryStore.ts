import { create } from 'zustand';
import { InventoryItem, InventoryTransaction, InventoryCategory } from '../types/inventory';

interface InventoryState {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  categories: InventoryCategory[];
  
  // Actions
  initInventory: (data: { 
    items: InventoryItem[]; 
    transactions: InventoryTransaction[];
    categories: InventoryCategory[];
  }) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (itemId: string) => void;
  addTransaction: (transaction: InventoryTransaction) => void;
  addCategory: (category: InventoryCategory) => void;
  updateCategory: (category: InventoryCategory) => void;
  deleteCategory: (categoryId: string) => void;
  getLowStockItems: () => InventoryItem[];
  getTotalInventoryValue: () => number;
  getRecentTransactions: (limit?: number) => InventoryTransaction[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  transactions: [],
  categories: [],
  
  initInventory: (data) => {
    set({
      items: data.items,
      transactions: data.transactions,
      categories: data.categories
    });
  },
  
  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item]
    }));
  },
  
  updateItem: (updatedItem) => {
    set((state) => ({
      items: state.items.map((item) => 
        item.id === updatedItem.id ? updatedItem : item
      )
    }));
  },

  deleteItem: (itemId) => {
    // Check if item has any transactions
    const hasTransactions = get().transactions.some(t => t.itemId === itemId);
    if (hasTransactions) {
      throw new Error('لا يمكن حذف المادة لأنها مرتبطة بمعاملات');
    }
    
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId)
    }));
  },
  
  addTransaction: (transaction) => {
    set((state) => {
      // Add transaction to transactions list
      const newTransactions = [...state.transactions, transaction];
      
      // Update item quantity based on transaction type
      const updatedItems = [...state.items];
      const itemIndex = updatedItems.findIndex(item => item.id === transaction.itemId);
      
      if (itemIndex !== -1) {
        const item = updatedItems[itemIndex];
        
        if (transaction.type === 'incoming') {
          // Add quantity for incoming transactions
          updatedItems[itemIndex] = {
            ...item,
            currentQuantity: item.currentQuantity + transaction.quantity,
            lastUpdated: transaction.date
          };
        } else if (transaction.type === 'outgoing') {
          // Subtract quantity for outgoing transactions
          updatedItems[itemIndex] = {
            ...item,
            currentQuantity: Math.max(0, item.currentQuantity - transaction.quantity),
            lastUpdated: transaction.date
          };
        }
      }
      
      return {
        transactions: newTransactions,
        items: updatedItems
      };
    });
  },
  
  addCategory: (category) => {
    set((state) => ({
      categories: [...state.categories, category]
    }));
  },

  updateCategory: (updatedCategory) => {
    set((state) => ({
      categories: state.categories.map((category) => 
        category.id === updatedCategory.id ? updatedCategory : category
      )
    }));
  },

  deleteCategory: (categoryId) => {
    // Check if category has items
    const hasItems = get().items.some(item => item.category.id === categoryId);
    if (hasItems) {
      throw new Error('لا يمكن حذف التصنيف لأنه يحتوي على مواد');
    }
    
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== categoryId)
    }));
  },
  
  getLowStockItems: () => {
    return get().items.filter(item => item.currentQuantity <= item.minQuantity);
  },
  
  getTotalInventoryValue: () => {
    return get().items.reduce((total, item) => {
      return total + (item.currentQuantity * item.price);
    }, 0);
  },
  
  getRecentTransactions: (limit = 10) => {
    return [...get().transactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }
}));