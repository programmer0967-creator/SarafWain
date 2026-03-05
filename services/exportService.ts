// Export service for generating CSV and PDF reports
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MailComposer from 'expo-mail-composer';
import { format } from 'date-fns';
import { Transaction, Category, ExportOptions, ExportResult, FinancialAnalysis } from '../types';

export const exportService = {
  // Generate CSV from transactions
  generateCSV(
    transactions: Transaction[],
    categories: Category[],
    analysis?: FinancialAnalysis,
    options?: ExportOptions
  ): string {
    let csv = '';

    // Add header
    if (options?.includeAnalytics && analysis) {
      csv += `Financial Summary\n`;
      csv += `Total Income,${analysis.totalIncome}\n`;
      csv += `Total Expenses,${analysis.totalExpenses}\n`;
      csv += `Current Balance,${analysis.currentBalance}\n`;
      csv += `Savings Rate,${analysis.savingsRate}%\n`;
      csv += `Average Daily Spending,${analysis.avgDailySpending}\n`;
      csv += `Financial Health,${analysis.financialHealth}\n\n`;
    }

    // Category breakdown
    if (options?.includeCategoryBreakdown && analysis) {
      csv += `Category Breakdown\n`;
      csv += `Category,Amount,Percentage\n`;
      analysis.topExpenseCategories.forEach(cat => {
        csv += `${cat.category},${cat.amount},${cat.percentage}%\n`;
      });
      csv += `\n`;
    }

    // Transactions
    if (options?.includeTransactions) {
      csv += `Transactions\n`;
      csv += `Date,Type,Category,Amount,Note\n`;
      
      transactions.forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category);
        const dateStr = format(new Date(transaction.date), 'yyyy-MM-dd');
        const note = (transaction.note || '').replace(/,/g, ';').replace(/\n/g, ' ');
        
        csv += `${dateStr},${transaction.type},${category?.name || 'Unknown'},${transaction.amount},"${note}"\n`;
      });
    }

    return csv;
  },

  // Generate HTML for PDF
  generateHTML(
    transactions: Transaction[],
    categories: Category[],
    analysis: FinancialAnalysis,
    options: ExportOptions,
    userName: string,
    currency: string
  ): string {
    const dateRange = options.dateFrom && options.dateTo
      ? `${format(new Date(options.dateFrom), 'MMM dd, yyyy')} - ${format(new Date(options.dateTo), 'MMM dd, yyyy')}`
      : 'All Time';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            background: #ffffff;
            color: #000000;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4F46E5;
          }
          .header h1 {
            font-size: 32px;
            color: #4F46E5;
            margin-bottom: 8px;
          }
          .header p {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin-bottom: 32px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #E5E7EB;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .summary-card {
            background: #F9FAFB;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #4F46E5;
          }
          .summary-card.income { border-left-color: #10B981; }
          .summary-card.expense { border-left-color: #EF4444; }
          .summary-label {
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 4px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: 700;
            color: #1F2937;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th {
            background: #F3F4F6;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #E5E7EB;
          }
          td {
            padding: 10px 12px;
            font-size: 13px;
            border-bottom: 1px solid #E5E7EB;
          }
          tr:hover {
            background: #F9FAFB;
          }
          .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          .type-income {
            background: #D1FAE5;
            color: #065F46;
          }
          .type-expense {
            background: #FEE2E2;
            color: #991B1B;
          }
          .amount-positive {
            color: #10B981;
            font-weight: 600;
          }
          .amount-negative {
            color: #EF4444;
            font-weight: 600;
          }
          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
          }
          .category-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 16px;
          }
          .category-item {
            background: #F9FAFB;
            padding: 12px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .category-name {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }
          .category-amount {
            font-size: 14px;
            font-weight: 700;
            color: #1F2937;
          }
          .health-indicator {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .health-healthy {
            background: #D1FAE5;
            color: #065F46;
          }
          .health-warning {
            background: #FEF3C7;
            color: #92400E;
          }
          .health-critical {
            background: #FEE2E2;
            color: #991B1B;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SarafWain – صرف وين؟</h1>
          <p>${userName} • ${dateRange}</p>
          <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
    `;

    // Analytics Summary
    if (options.includeAnalytics) {
      html += `
        <div class="section">
          <h2 class="section-title">Financial Summary</h2>
          <div class="summary-grid">
            <div class="summary-card income">
              <div class="summary-label">Total Income</div>
              <div class="summary-value">${currency}${analysis.totalIncome.toFixed(2)}</div>
            </div>
            <div class="summary-card expense">
              <div class="summary-label">Total Expenses</div>
              <div class="summary-value">${currency}${analysis.totalExpenses.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Current Balance</div>
              <div class="summary-value">${currency}${analysis.currentBalance.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Savings Rate</div>
              <div class="summary-value">${analysis.savingsRate.toFixed(1)}%</div>
            </div>
          </div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Average Daily Spending</div>
              <div class="summary-value">${currency}${analysis.avgDailySpending.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Financial Health</div>
              <div class="summary-value">
                <span class="health-indicator health-${analysis.financialHealth}">
                  ${analysis.financialHealth}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Category Breakdown
    if (options.includeCategoryBreakdown && analysis.topExpenseCategories.length > 0) {
      html += `
        <div class="section">
          <h2 class="section-title">Category Breakdown</h2>
          <div class="category-grid">
      `;
      analysis.topExpenseCategories.forEach(cat => {
        html += `
          <div class="category-item">
            <span class="category-name">${cat.category}</span>
            <span class="category-amount">${currency}${cat.amount.toFixed(2)} (${cat.percentage}%)</span>
          </div>
        `;
      });
      html += `
          </div>
        </div>
      `;
    }

    // Transactions
    if (options.includeTransactions && transactions.length > 0) {
      html += `
        <div class="section">
          <h2 class="section-title">Transactions (${transactions.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      transactions.forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category);
        const dateStr = format(new Date(transaction.date), 'MMM dd, yyyy');
        const amountClass = transaction.type === 'income' ? 'amount-positive' : 'amount-negative';
        const typeClass = transaction.type === 'income' ? 'type-income' : 'type-expense';
        
        html += `
          <tr>
            <td>${dateStr}</td>
            <td><span class="type-badge ${typeClass}">${transaction.type.toUpperCase()}</span></td>
            <td>${category?.name || 'Unknown'}</td>
            <td class="${amountClass}">${currency}${transaction.amount.toFixed(2)}</td>
            <td>${transaction.note || '-'}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p>Generated by SarafWain - Personal Finance Tracker</p>
          <p>This report is for personal use only</p>
        </div>
      </body>
      </html>
    `;

    return html;
  },

  // Export as CSV
  async exportCSV(
    transactions: Transaction[],
    categories: Category[],
    analysis?: FinancialAnalysis,
    options?: ExportOptions
  ): Promise<ExportResult> {
    try {
      const csv = this.generateCSV(transactions, categories, analysis, options);
      const fileName = `sarafwain_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return { success: true, uri: fileUri };
    } catch (error) {
      console.error('CSV export error:', error);
      return { success: false, error: 'Failed to generate CSV' };
    }
  },

  // Export as PDF
  async exportPDF(
    transactions: Transaction[],
    categories: Category[],
    analysis: FinancialAnalysis,
    options: ExportOptions,
    userName: string,
    currency: string
  ): Promise<ExportResult> {
    try {
      const html = this.generateHTML(transactions, categories, analysis, options, userName, currency);
      const fileName = `sarafwain_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Move to a permanent location
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      return { success: true, uri: newUri };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: 'Failed to generate PDF' };
    }
  },

  // Share file
  async shareFile(uri: string): Promise<boolean> {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return false;
      }
      await Sharing.shareAsync(uri);
      return true;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  },

  // Share via email
  async shareViaEmail(uri: string, subject: string): Promise<boolean> {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        return false;
      }

      await MailComposer.composeAsync({
        subject,
        body: 'Please find attached your SarafWain financial report.',
        attachments: [uri],
      });

      return true;
    } catch (error) {
      console.error('Email share error:', error);
      return false;
    }
  },

  // Filter transactions by date range
  filterByDateRange(
    transactions: Transaction[],
    dateFrom?: string,
    dateTo?: string
  ): Transaction[] {
    let filtered = [...transactions];

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(t => new Date(t.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter(t => new Date(t.date) <= toDate);
    }

    return filtered;
  },
};
