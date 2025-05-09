import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, HeadingLevel, BorderStyle, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';
import { formatDateTimeArabic, formatCurrency } from './dateFormatter';
import type { Branch } from '../types/branch';
import type { InventoryTransaction, InventoryItem } from '../types/inventory';
import type { Supplier } from '../types/supplier';

// Convert numbers to Arabic numerals
const toArabicNumbers = (num: number): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, w => arabicNumbers[+w]);
};

export const generateInvoice = async (
  transaction: InventoryTransaction,
  supplier: Supplier,
  item: InventoryItem
): Promise<void> => {
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

    // Invoice Title
    new Paragraph({
      children: [
        new TextRun({
          text: 'فاتورة توريد',
          size: 32,
          bold: true
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),

    // Invoice Info
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
              children: [new Paragraph({ text: 'رقم الفاتورة:', alignment: AlignmentType.RIGHT })],
              width: { size: 30, type: 'pct' }
            }),
            new TableCell({
              children: [new Paragraph({ text: transaction.id, alignment: AlignmentType.RIGHT })],
              width: { size: 70, type: 'pct' }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'التاريخ:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatDateTimeArabic(transaction.date), alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      ]
    }),

    // Supplier Info
    new Paragraph({
      children: [
        new TextRun({
          text: 'معلومات المورد',
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
              children: [new Paragraph({ text: 'اسم المورد:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.name, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'العنوان:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.address, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'رقم الهاتف:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.phone, alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      ]
    }),

    // Items Table
    new Paragraph({
      children: [
        new TextRun({
          text: 'تفاصيل التوريد',
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
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'المادة', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'الكمية', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'سعر الوحدة', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'الإجمالي', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: item.name, alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: `${toArabicNumbers(transaction.quantity)} ${transaction.unit}`, 
                alignment: AlignmentType.RIGHT 
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: formatCurrency(item.price), 
                alignment: AlignmentType.RIGHT 
              })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: formatCurrency(transaction.totalPrice || 0), 
                alignment: AlignmentType.RIGHT 
              })]
            })
          ]
        })
      ]
    }),

    // Payment Info
    new Paragraph({
      children: [
        new TextRun({
          text: 'معلومات الدفع',
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
              children: [new Paragraph({ text: 'المبلغ الإجمالي:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: formatCurrency(transaction.totalPrice || 0), 
                alignment: AlignmentType.RIGHT 
              })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'المبلغ المدفوع:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: formatCurrency(transaction.paidAmount || 0), 
                alignment: AlignmentType.RIGHT 
              })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'المبلغ المتبقي:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: formatCurrency((transaction.totalPrice || 0) - (transaction.paidAmount || 0)), 
                alignment: AlignmentType.RIGHT 
              })]
            })
          ]
        })
      ]
    }),

    // Notes
    ...(transaction.notes ? [
      new Paragraph({
        children: [
          new TextRun({
            text: 'ملاحظات',
            size: 28,
            bold: true,
            color: '3B5998'
          })
        ],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: transaction.notes,
            size: 24
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 }
      })
    ] : []),

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
        rtl: true,
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          }
        }
      },
      children: sections
    }]
  });

  // Generate and save document
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `فاتورة_توريد_${transaction.id}_${new Date().toISOString().split('T')[0]}.docx`);
};

export const generateOutgoingInvoice = async (
  transaction: InventoryTransaction,
  branch: Branch,
  item: InventoryItem
): Promise<void> => {
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

    // Invoice Title
    new Paragraph({
      children: [
        new TextRun({
          text: 'إذن صرف',
          size: 32,
          bold: true
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),

    // Invoice Info
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
              children: [new Paragraph({ text: 'رقم الإذن:', alignment: AlignmentType.RIGHT })],
              width: { size: 30, type: 'pct' }
            }),
            new TableCell({
              children: [new Paragraph({ text: transaction.id, alignment: AlignmentType.RIGHT })],
              width: { size: 70, type: 'pct' }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'التاريخ:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatDateTimeArabic(transaction.date), alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      ]
    }),

    // Branch Info
    new Paragraph({
      children: [
        new TextRun({
          text: 'معلومات الفرع',
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
              children: [new Paragraph({ text: 'اسم الفرع:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: branch.name, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'العنوان:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: branch.location, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'رقم الهاتف:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: branch.phone, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'المندوب المستلم:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: transaction.representativeName || '-', alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      ]
    }),

    // Items Table
    new Paragraph({
      children: [
        new TextRun({
          text: 'تفاصيل الصرف',
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
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'المادة', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'الكمية', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: item.name, alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: `${toArabicNumbers(transaction.quantity)} ${transaction.unit}`, 
                alignment: AlignmentType.RIGHT 
              })]
            })
          ]
        })
      ]
    }),

    // Notes
    ...(transaction.notes ? [
      new Paragraph({
        children: [
          new TextRun({
            text: 'ملاحظات',
            size: 28,
            bold: true,
            color: '3B5998'
          })
        ],
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: transaction.notes,
            size: 24
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 }
      })
    ] : []),

    // Signatures
    new Paragraph({
      children: [
        new TextRun({
          text: 'التوقيعات',
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
              children: [new Paragraph({ text: 'المندوب المستلم:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: '________________', alignment: AlignmentType.CENTER })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'أمين المخزن:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: '________________', alignment: AlignmentType.CENTER })]
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
        rtl: true,
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          }
        }
      },
      children: sections
    }]
  });

  // Generate and save document
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `إذن_صرف_${transaction.id}_${new Date().toISOString().split('T')[0]}.docx`);
};

export const generateInventoryReport = async (
  items: InventoryItem[],
  transactions: any[],
  suppliers: Supplier[],
  summary: {
    totalValue: number;
    lowStockCount: number;
    totalBalance: number;
  }
): Promise<void> => {
  try {
    // Create report data structure
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary,
      inventory: items.map(item => ({
        name: item.name,
        quantity: item.currentQuantity,
        unit: item.unit,
        value: item.price * item.currentQuantity,
        minQuantity: item.minQuantity,
        isLowStock: item.currentQuantity <= item.minQuantity
      })),
      suppliers: suppliers.map(supplier => ({
        name: supplier.name,
        totalPurchases: supplier.totalPurchases,
        totalPaid: supplier.totalPaid,
        balance: supplier.balance
      }))
    };

    // Create the report file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const generateBranchReport = async (
  branch: Branch,
  transactions: any[],
  stats: {
    totalItems: number;
    totalTransactions: number;
    totalQuantity: number;
  }
): Promise<void> => {
  try {
    // Create report data structure
    const reportData = {
      generatedAt: new Date().toISOString(),
      branch: {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        manager: branch.manager,
        phone: branch.phone,
        representatives: branch.representatives
      },
      statistics: stats,
      transactions: transactions.map(transaction => ({
        date: transaction.date,
        itemName: transaction.itemName,
        quantity: transaction.quantity,
        unit: transaction.unit,
        representativeName: transaction.representativeName,
        notes: transaction.notes
      }))
    };

    // Create the report file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `branch-report-${branch.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating branch report:', error);
    throw error;
  }
};

export const generateSupplierStatement = async (
  supplier: Supplier,
  transactions: SupplierTransaction[],
  stats: {
    totalPurchases: number;
    totalPaid: number;
    balance: number;
  }
): Promise<void> => {
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

    // Statement Title
    new Paragraph({
      children: [
        new TextRun({
          text: 'كشف حساب مورد',
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

    // Supplier Info
    new Paragraph({
      children: [
        new TextRun({
          text: 'معلومات المورد',
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
              children: [new Paragraph({ text: 'اسم المورد:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.name, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'العنوان:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.address, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'رقم الهاتف:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.phone, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'البريد الإلكتروني:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.email, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'الشخص المسؤول:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.contactPerson, alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'شروط الدفع:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: supplier.paymentTerms, alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      ]
    }),

    // Summary
    new Paragraph({
      children: [
        new TextRun({
          text: 'ملخص الحساب',
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
              children: [new Paragraph({ text: 'إجمالي المشتريات:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(stats.totalPurchases), alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'إجمالي المدفوعات:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(stats.totalPaid), alignment: AlignmentType.RIGHT })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'الرصيد المستحق:', alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(stats.balance), alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      ]
    }),

    // Transactions
    new Paragraph({
      children: [
        new TextRun({
          text: 'تفاصيل المعاملات',
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
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'التاريخ', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'النوع', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'القيمة', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'المدفوع', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'الرصيد', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            }),
            new TableCell({
              children: [new Paragraph({ text: 'ملاحظات', alignment: AlignmentType.RIGHT })],
              ...headerStyle
            })
          ]
        }),
        ...transactions.map(transaction => new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: formatDateTimeArabic(transaction.date), alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: transaction.type === 'purchase' ? 'مشتريات' : 'دفعة', 
                alignment: AlignmentType.RIGHT 
              })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(transaction.amount), alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(transaction.paid), alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatCurrency(Math.abs(transaction.balance)), alignment: AlignmentType.RIGHT })]
            }),
            new TableCell({
              children: [new Paragraph({ text: transaction.notes || '-', alignment: AlignmentType.RIGHT })]
            })
          ]
        }))
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
        rtl: true,
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          }
        }
      },
      children: sections
    }]
  });

  // Generate and save document
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `كشف_حساب_${supplier.name}_${new Date().toISOString().split('T')[0]}.docx`);
};