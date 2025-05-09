import { faker } from '@faker-js/faker/locale/ar';
import { InventoryItem, InventoryTransaction } from '../types/inventory';
import { Supplier, SupplierTransaction } from '../types/supplier';
import { Branch, BranchRepresentative } from '../types/branch';

// Set up faker to be consistent
faker.seed(123);

// Generate random dates within the last 3 months
const getRandomRecentDate = () => {
  return faker.date.recent({ days: 90 });
};

// Generate sample inventory categories
const inventoryCategories = [
  { id: '1', name: 'مواد غذائية' },
  { id: '2', name: 'مواد تغليف' },
  { id: '3', name: 'مواد خام' },
  { id: '4', name: 'أخرى' }
];

// Generate sample inventory items
const generateInventoryItems = (): InventoryItem[] => {
  const items: InventoryItem[] = [
    {
      id: '1',
      name: 'طحين',
      category: inventoryCategories[0],
      unit: 'كيلو',
      currentQuantity: 1200,
      minQuantity: 500,
      price: 0.75,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '2',
      name: 'سكر',
      category: inventoryCategories[0],
      unit: 'كيلو',
      currentQuantity: 800,
      minQuantity: 300,
      price: 1.2,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '3',
      name: 'زيت',
      category: inventoryCategories[0],
      unit: 'لتر',
      currentQuantity: 350,
      minQuantity: 100,
      price: 2.5,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '4',
      name: 'صناديق ورقية صغيرة',
      category: inventoryCategories[1],
      unit: 'قطعة',
      currentQuantity: 2000,
      minQuantity: 500,
      price: 0.15,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '5',
      name: 'أكياس بلاستيكية',
      category: inventoryCategories[1],
      unit: 'كرتون',
      currentQuantity: 150,
      minQuantity: 50,
      price: 12,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '6',
      name: 'بيض',
      category: inventoryCategories[2],
      unit: 'كرتون',
      currentQuantity: 80,
      minQuantity: 40,
      price: 5,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '7',
      name: 'خميرة',
      category: inventoryCategories[2],
      unit: 'كيلو',
      currentQuantity: 30,
      minQuantity: 20,
      price: 8,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '8',
      name: 'شوكولاتة',
      category: inventoryCategories[2],
      unit: 'كيلو',
      currentQuantity: 100,
      minQuantity: 50,
      price: 12,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '9',
      name: 'فانيليا',
      category: inventoryCategories[2],
      unit: 'لتر',
      currentQuantity: 25,
      minQuantity: 15,
      price: 6,
      lastUpdated: getRandomRecentDate()
    },
    {
      id: '10',
      name: 'مناديل',
      category: inventoryCategories[3],
      unit: 'علبة',
      currentQuantity: 200,
      minQuantity: 100,
      price: 1.8,
      lastUpdated: getRandomRecentDate()
    }
  ];
  
  return items;
};

// Generate inventory transactions
const generateInventoryTransactions = (
  items: InventoryItem[], 
  suppliers: Supplier[], 
  branches: Branch[]
): InventoryTransaction[] => {
  const transactions: InventoryTransaction[] = [];
  
  // Generate incoming transactions (from suppliers)
  for (let i = 0; i < 25; i++) {
    const item = faker.helpers.arrayElement(items);
    const supplier = faker.helpers.arrayElement(suppliers);
    const quantity = faker.number.int({ min: 50, max: 500 });
    const price = item.price * quantity;
    
    transactions.push({
      id: `in-${i + 1}`,
      type: 'incoming',
      itemId: item.id,
      itemName: item.name,
      quantity: quantity,
      unit: item.unit,
      date: getRandomRecentDate(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      totalPrice: price,
      paidAmount: faker.number.int({ min: 0, max: Math.floor(price) }),
      notes: faker.lorem.sentence(),
    });
  }
  
  // Generate outgoing transactions (to branches)
  for (let i = 0; i < 40; i++) {
    const item = faker.helpers.arrayElement(items);
    const branch = faker.helpers.arrayElement(branches);
    const representative = faker.helpers.arrayElement(branch.representatives);
    const quantity = faker.number.int({ min: 10, max: 100 });
    
    transactions.push({
      id: `out-${i + 1}`,
      type: 'outgoing',
      itemId: item.id,
      itemName: item.name,
      quantity: quantity,
      unit: item.unit,
      date: getRandomRecentDate(),
      branchId: branch.id,
      branchName: branch.name,
      representativeId: representative.id,
      representativeName: representative.name,
      notes: faker.lorem.sentence(),
    });
  }
  
  return transactions;
};

// Generate suppliers
const generateSuppliers = (): Supplier[] => {
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'شركة الوادي للمواد الغذائية',
      phone: faker.phone.number(),
      email: 'alwadi@example.com',
      address: faker.location.streetAddress(),
      contactPerson: faker.person.fullName(),
      paymentTerms: 'دفع آجل 30 يوم',
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      transactions: []
    },
    {
      id: '2',
      name: 'مؤسسة الريف للمنتجات الزراعية',
      phone: faker.phone.number(),
      email: 'alreef@example.com',
      address: faker.location.streetAddress(),
      contactPerson: faker.person.fullName(),
      paymentTerms: 'دفع فوري',
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      transactions: []
    },
    {
      id: '3',
      name: 'شركة الأمل للتغليف',
      phone: faker.phone.number(),
      email: 'alamal@example.com',
      address: faker.location.streetAddress(),
      contactPerson: faker.person.fullName(),
      paymentTerms: 'دفع آجل 15 يوم',
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      transactions: []
    },
    {
      id: '4',
      name: 'مخازن الشمال',
      phone: faker.phone.number(),
      email: 'alshamal@example.com',
      address: faker.location.streetAddress(),
      contactPerson: faker.person.fullName(),
      paymentTerms: 'دفع بالتقسيط',
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      transactions: []
    },
    {
      id: '5',
      name: 'مصنع النجمة للمواد الأولية',
      phone: faker.phone.number(),
      email: 'alnajma@example.com',
      address: faker.location.streetAddress(),
      contactPerson: faker.person.fullName(),
      paymentTerms: 'دفع آجل 45 يوم',
      totalPurchases: 0,
      totalPaid: 0,
      balance: 0,
      transactions: []
    }
  ];
  
  return suppliers;
};

// Generate supplier transactions
const generateSupplierTransactions = (
  suppliers: Supplier[], 
  incomingTransactions: InventoryTransaction[]
): void => {
  // Process incoming inventory transactions to create supplier transactions
  incomingTransactions.forEach(transaction => {
    if (transaction.type === 'incoming' && transaction.supplierId) {
      const supplierIndex = suppliers.findIndex(s => s.id === transaction.supplierId);
      
      if (supplierIndex !== -1) {
        const supplierTransaction: SupplierTransaction = {
          id: `st-${transaction.id}`,
          date: transaction.date,
          type: 'purchase',
          amount: transaction.totalPrice,
          paid: transaction.paidAmount,
          balance: transaction.totalPrice - transaction.paidAmount,
          notes: transaction.notes || '',
          relatedTransactionId: transaction.id
        };
        
        // Update supplier totals
        suppliers[supplierIndex].totalPurchases += transaction.totalPrice;
        suppliers[supplierIndex].totalPaid += transaction.paidAmount;
        suppliers[supplierIndex].balance += (transaction.totalPrice - transaction.paidAmount);
        
        // Add transaction to supplier's transactions
        suppliers[supplierIndex].transactions.push(supplierTransaction);
      }
    }
  });
  
  // Add some payment transactions
  suppliers.forEach((supplier, index) => {
    if (supplier.balance > 0) {
      // Generate 1-3 payment transactions per supplier
      const paymentCount = faker.number.int({ min: 1, max: 3 });
      
      for (let i = 0; i < paymentCount; i++) {
        const paymentAmount = faker.number.int({ 
          min: Math.min(500, Math.floor(supplier.balance)), 
          max: Math.min(2000, Math.floor(supplier.balance)) 
        });
        
        if (paymentAmount > 0) {
          const paymentTransaction: SupplierTransaction = {
            id: `payment-${supplier.id}-${i}`,
            date: getRandomRecentDate(),
            type: 'payment',
            amount: paymentAmount,
            paid: paymentAmount,
            balance: -paymentAmount,
            notes: 'دفعة من المستحقات',
            relatedTransactionId: ''
          };
          
          // Update supplier totals
          suppliers[index].totalPaid += paymentAmount;
          suppliers[index].balance -= paymentAmount;
          
          // Add payment transaction
          suppliers[index].transactions.push(paymentTransaction);
        }
      }
    }
  });
};

// Generate branches
const generateBranches = (): Branch[] => {
  const branches: Branch[] = [
    {
      id: '1',
      name: 'فرع الجبيهة',
      location: 'الجبيهة - شارع الملكة رانيا',
      phone: faker.phone.number(),
      manager: 'محمد أحمد',
      representatives: [
        { id: 'rep1-1', name: 'أحمد خالد', phone: faker.phone.number(), role: 'مندوب استلام' },
        { id: 'rep1-2', name: 'عمر علي', phone: faker.phone.number(), role: 'مندوب استلام' }
      ]
    },
    {
      id: '2',
      name: 'فرع الصويفية',
      location: 'الصويفية - شارع الوكالات',
      phone: faker.phone.number(),
      manager: 'سمير راشد',
      representatives: [
        { id: 'rep2-1', name: 'رامي فادي', phone: faker.phone.number(), role: 'مندوب استلام' }
      ]
    },
    {
      id: '3',
      name: 'فرع تلاع العلي',
      location: 'تلاع العلي - شارع المدينة المنورة',
      phone: faker.phone.number(),
      manager: 'فراس محمود',
      representatives: [
        { id: 'rep3-1', name: 'سامي وليد', phone: faker.phone.number(), role: 'مندوب استلام' },
        { id: 'rep3-2', name: 'ناصر محمد', phone: faker.phone.number(), role: 'مندوب استلام' }
      ]
    },
    {
      id: '4',
      name: 'فرع عبدون',
      location: 'عبدون - الدوار الخامس',
      phone: faker.phone.number(),
      manager: 'علاء حسن',
      representatives: [
        { id: 'rep4-1', name: 'مهند علي', phone: faker.phone.number(), role: 'مندوب استلام' }
      ]
    }
  ];
  
  return branches;
};

export const initializeData = () => {
  // Generate base data
  const inventoryItems = generateInventoryItems();
  const suppliers = generateSuppliers();
  const branches = generateBranches();
  
  // Generate transactions
  const inventoryTransactions = generateInventoryTransactions(inventoryItems, suppliers, branches);
  
  // Process supplier transactions based on inventory transactions
  const incomingTransactions = inventoryTransactions.filter(t => t.type === 'incoming');
  generateSupplierTransactions(suppliers, incomingTransactions);
  
  return {
    inventory: {
      items: inventoryItems,
      transactions: inventoryTransactions,
      categories: inventoryCategories
    },
    suppliers,
    branches
  };
};