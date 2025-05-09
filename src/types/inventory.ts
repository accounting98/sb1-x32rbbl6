export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  currentQuantity: number;
  minQuantity: number;
  price: number;
  lastUpdated: Date;
  expiryDate?: Date;
}

export interface InventoryTransaction {
  id: string;
  type: 'incoming' | 'outgoing';
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  date: Date;
  notes?: string;
  
  // For incoming transactions (from suppliers)
  supplierId?: string;
  supplierName?: string;
  totalPrice?: number;
  paidAmount?: number;
  
  // For outgoing transactions (to branches)
  branchId?: string;
  branchName?: string;
  representativeId?: string;
  representativeName?: string;
}