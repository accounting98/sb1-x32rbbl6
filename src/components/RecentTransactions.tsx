import React from 'react';
import { InventoryTransaction } from '../types/inventory';
import { formatDateTimeArabic, formatCurrency } from '../utils/dateFormatter';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: InventoryTransaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>لا توجد معاملات حديثة</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>النوع</th>
            <th>المادة</th>
            <th>الكمية</th>
            <th>الجهة</th>
            <th>التاريخ</th>
            <th>المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <div className="flex items-center gap-2">
                  {transaction.type === 'incoming' ? (
                    <>
                      <ArrowDownLeft className="h-5 w-5 text-success-500" />
                      <span className="text-success-700">وارد</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-5 w-5 text-danger-500" />
                      <span className="text-danger-700">صادر</span>
                    </>
                  )}
                </div>
              </td>
              <td>{transaction.itemName}</td>
              <td>
                {transaction.quantity} {transaction.unit}
              </td>
              <td>
                {transaction.type === 'incoming'
                  ? transaction.supplierName
                  : transaction.branchName}
              </td>
              <td className="text-gray-500 text-sm">
                {formatDateTimeArabic(transaction.date)}
              </td>
              <td>
                {transaction.type === 'incoming' && transaction.totalPrice
                  ? formatCurrency(transaction.totalPrice)
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactions;