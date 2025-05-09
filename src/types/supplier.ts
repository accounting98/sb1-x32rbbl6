export interface SupplierTransaction {
  id: string;
  date: Date;
  type: 'purchase' | 'payment';
  amount: number;
  paid: number;
  balance: number;
  notes: string;
  relatedTransactionId: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  totalPurchases: number;
  totalPaid: number;
  balance: number;
  transactions: SupplierTransaction[];
}