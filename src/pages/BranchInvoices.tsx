import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventoryStore } from '../stores/inventoryStore';
import { useBranchStore } from '../stores/branchStore';
import { ArrowLeft, FileText, Download, Search, Filter, Printer } from 'lucide-react';
import { formatDateTimeArabic, formatCurrency } from '../utils/dateFormatter';
import { generateInvoice, generateOutgoingInvoice } from '../utils/reportGenerator';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const BranchInvoices = () => {
  const { transactions, items } = useInventoryStore();
  const { branches } = useBranchStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  
  useEffect(() => {
    document.title = 'الصادر والوارد | نظام إدارة المخزون المركزي للمخابز';
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.type === 'incoming' && t.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.type === 'outgoing' && t.branchName?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedType]);

  const handleDownloadInvoice = async (transaction: any) => {
    try {
      const item = items.find(i => i.id === transaction.itemId);
      if (!item) throw new Error('Item not found');

      if (transaction.type === 'incoming') {
        await generateInvoice(transaction, {
          id: transaction.supplierId,
          name: transaction.supplierName,
          phone: '-',
          email: '-',
          address: '-',
          contactPerson: '-',
          paymentTerms: '-',
          totalPurchases: 0,
          totalPaid: 0,
          balance: 0,
          transactions: []
        }, item);
      } else {
        const branch = branches.find(b => b.id === transaction.branchId);
        if (!branch) throw new Error('Branch not found');
        
        await generateOutgoingInvoice(transaction, branch, item);
      }
      
      toast.success('تم تحميل الفاتورة بنجاح');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('حدث خطأ أثناء تحميل الفاتورة');
    }
  };

  const handlePrintAll = async () => {
    try {
      // Header style for tables
      const headerStyle = {
        fill: {
          color: 'F3F4F6'
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 }
        }
      };

      // Create document sections
      const sections = [
        // Company Logo & Name
        new Paragraph({
          children: [
            new TextRun({
              text: 'مخبز السنابل',
              size: 40,
              bold: true,
              color: '3B5998'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        // Report Title
        new Paragraph({
          children: [
            new TextRun({
              text: 'كشف الصادر والوارد',
              size: 32,
              bold: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        // Date
        new Paragraph({
          children: [
            new TextRun({
              text: `تاريخ الكشف: ${formatDateTimeArabic(new Date())}`,
              size: 24
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 }
        }),

        // Transactions Table
        new Table({
          width: {
            size: 100,
            type: 'pct',
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 }
          },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'رقم الفاتورة', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'النوع', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'التاريخ', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'المادة', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'الكمية', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'الجهة', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'المبلغ', alignment: AlignmentType.RIGHT })],
                  ...headerStyle
                })
              ]
            }),
            ...filteredTransactions.map(transaction => new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: transaction.id, alignment: AlignmentType.RIGHT })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: transaction.type === 'incoming' ? 'وارد' : 'صادر', 
                    alignment: AlignmentType.RIGHT 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: formatDateTimeArabic(transaction.date), 
                    alignment: AlignmentType.RIGHT 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ text: transaction.itemName, alignment: AlignmentType.RIGHT })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: `${transaction.quantity} ${transaction.unit}`, 
                    alignment: AlignmentType.RIGHT 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: transaction.type === 'incoming' ? transaction.supplierName : transaction.branchName, 
                    alignment: AlignmentType.RIGHT 
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: transaction.type === 'incoming' && transaction.totalPrice 
                      ? formatCurrency(transaction.totalPrice) 
                      : '-', 
                    alignment: AlignmentType.RIGHT 
                  })]
                })
              ]
            }))
          ]
        }),

        // Summary
        new Paragraph({
          children: [
            new TextRun({
              text: 'ملخص الكشف',
              size: 28,
              bold: true,
              color: '3B5998'
            })
          ],
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400, after: 200 }
        }),

        new Table({
          width: {
            size: 100,
            type: 'pct',
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'إجمالي عدد المعاملات:', alignment: AlignmentType.RIGHT })]
                }),
                new TableCell({
                  children: [new Paragraph({ text: filteredTransactions.length.toString(), alignment: AlignmentType.RIGHT })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'إجمالي الوارد:', alignment: AlignmentType.RIGHT })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'incoming')
                        .reduce((sum, t) => sum + (t.totalPrice || 0), 0)
                    ), 
                    alignment: AlignmentType.RIGHT 
                  })]
                })
              ]
            })
          ]
        }),

        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: 'مخبز السنابل - نظام إدارة المخزون المركزي',
              size: 20,
              color: '666666'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 }
        })
      ];

      // Create document
      const doc = new Document({
        sections: [{
          properties: { 
            rtl: true
          },
          children: sections
        }]
      });

      // Generate and save document
      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `كشف_الصادر_والوارد_${new Date().toISOString().split('T')[0]}.docx`);
      
      toast.success('تم تحميل الكشف بنجاح');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('حدث خطأ أثناء تحميل الكشف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-600">
        <Link to="/branches" className="flex items-center gap-1 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" />
          <span>العودة إلى الفروع</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">الصادر والوارد</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة فواتير الصادر والوارد</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pr-10"
                  placeholder="بحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <select
                className="select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
              >
                <option value="all">جميع الفواتير</option>
                <option value="incoming">فواتير الوارد</option>
                <option value="outgoing">فواتير الصادر</option>
              </select>
            </div>

            <button
              onClick={handlePrintAll}
              className="btn btn-secondary flex items-center gap-2"
              disabled={filteredTransactions.length === 0}
            >
              <Printer className="h-5 w-5" />
              <span>طباعة الكشف</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>النوع</th>
                  <th>التاريخ</th>
                  <th>المادة</th>
                  <th>الكمية</th>
                  <th>الجهة</th>
                  <th>المبلغ</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="font-medium">{transaction.id}</td>
                      <td>
                        <span className={`badge ${
                          transaction.type === 'incoming'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-primary-100 text-primary-800'
                        }`}>
                          {transaction.type === 'incoming' ? 'وارد' : 'صادر'}
                        </span>
                      </td>
                      <td className="text-gray-500">
                        {formatDateTimeArabic(transaction.date)}
                      </td>
                      <td>{transaction.itemName}</td>
                      <td>
                        {transaction.quantity} {transaction.unit}
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">
                            {transaction.type === 'incoming' 
                              ? transaction.supplierName 
                              : transaction.branchName}
                          </div>
                          {transaction.type === 'outgoing' && transaction.representativeName && (
                            <div className="text-sm text-gray-500">
                              {transaction.representativeName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {transaction.type === 'incoming' && transaction.totalPrice
                          ? formatCurrency(transaction.totalPrice)
                          : '-'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDownloadInvoice(transaction)}
                          className="text-primary-600 hover:text-primary-800"
                          title={transaction.type === 'incoming' ? 'تحميل الفاتورة' : 'تحميل إذن الصرف'}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      لا توجد فواتير مطابقة لمعايير البحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchInvoices;