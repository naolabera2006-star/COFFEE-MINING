import { TransactionRecord } from '../types';

export interface ExportFilterOptions {
  type?: 'all' | 'recharge' | 'withdraw';
  status?: 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'PROCESSING';
  startDate?: string;
  endDate?: string;
}

/**
 * Formats status nicely for human and spreadsheet consumption
 */
export function formatExportStatus(status: TransactionRecord['status']): string {
  switch (status) {
    case 'SUCCESS':
      return 'Approved (SUCCESS)';
    case 'PENDING':
      return 'Pending (PENDING)';
    case 'PROCESSING':
      return 'Processing (PROCESSING)';
    case 'FAILED':
      return 'Rejected (FAILED)';
    default:
      return status;
  }
}

/**
 * Formats bank and account information for recharge & withdrawal
 */
export function formatAccountBankInfo(tx: TransactionRecord): {
  bankName: string;
  accountNumber: string;
  channelDetails: string;
} {
  if (tx.type === 'recharge') {
    const bankName = tx.paymentMethod?.toUpperCase() || tx.verifyBy || 'Telebirr / CBE Bank';
    const accountNumber = tx.senderAccount || tx.userPhone || 'N/A';
    const channelDetails = `Bank/Wallet: ${bankName} | Sender Account: ${accountNumber} | Slip No: ${tx.slipNo || 'N/A'}`;
    return {
      bankName,
      accountNumber,
      channelDetails
    };
  } else if (tx.type === 'withdraw') {
    const bankName = tx.bankName || (tx.payoutMethod === 'telebirr' ? 'Telebirr Wallet' : 'Bank Transfer');
    const accountNumber = tx.accountNumber || tx.upiId || 'N/A';
    const channelDetails = `Bank: ${bankName} | Holder: ${tx.bankHolder || 'N/A'} | Payout Account: ${accountNumber}`;
    return {
      bankName,
      accountNumber,
      channelDetails
    };
  } else {
    return {
      bankName: 'Wallet Internal',
      accountNumber: tx.orderId,
      channelDetails: tx.details || 'Internal Transfer'
    };
  }
}

/**
 * Converts transaction records into standard CSV string (Excel Compatible)
 */
export function generateTransactionsCSV(
  transactions: TransactionRecord[],
  reportTitle: string = 'Transaction_Records'
): string {
  const headers = [
    'Order / Transaction ID',
    'Date & Time',
    'Transaction Type',
    'User Logged Email',
    'User Logged Phone',
    'User ID No',
    'Amount (ETB)',
    'Status',
    'Bank / Wallet Name',
    'Account Deposited / Transferred',
    'Slip / Reference No',
    'Transaction Details',
    'Admin Verification Note'
  ];

  const escapeCSV = (value: any): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((tx) => {
    const { bankName, accountNumber } = formatAccountBankInfo(tx);
    const statusText = formatExportStatus(tx.status);
    const txType = tx.type === 'recharge' ? 'Recharge (Deposit)' : tx.type === 'withdraw' ? 'Withdrawal (Payout)' : tx.type.toUpperCase();

    return [
      escapeCSV(tx.orderId || tx.id),
      escapeCSV(tx.date || new Date(tx.timestamp).toLocaleString()),
      escapeCSV(txType),
      escapeCSV(tx.userEmail || 'N/A'),
      escapeCSV(tx.userPhone || 'N/A'),
      escapeCSV(tx.userId || 'N/A'),
      escapeCSV((tx.amount || 0).toFixed(2)),
      escapeCSV(statusText),
      escapeCSV(bankName),
      escapeCSV(accountNumber),
      escapeCSV(tx.slipNo || tx.utrNumber || 'N/A'),
      escapeCSV(tx.details || ''),
      escapeCSV(tx.adminNote || tx.rejectReason || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser file download of CSV content (Excel)
 */
export function downloadCSVFile(csvContent: string, fileName: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a styled Microsoft Word Document (.doc format)
 */
export function downloadWordDocFile(
  transactions: TransactionRecord[],
  reportTitle: string = 'MY COFFEE VIP Financial Report',
  fileName: string = 'Transaction_Report'
): void {
  const generatedAt = new Date().toLocaleString();
  const totalAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const approvedCount = transactions.filter(t => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;
  const rejectedCount = transactions.filter(t => t.status === 'FAILED').length;

  let tableRows = transactions.map((tx, idx) => {
    const { bankName, accountNumber } = formatAccountBankInfo(tx);
    const statusText = formatExportStatus(tx.status);
    const isSuccess = tx.status === 'SUCCESS';
    const isPending = tx.status === 'PENDING' || tx.status === 'PROCESSING';
    const statusColor = isSuccess ? '#059669' : isPending ? '#d97706' : '#dc2626';

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${tx.orderId || tx.id}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${tx.date || new Date(tx.timestamp).toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${tx.type.toUpperCase()}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${tx.userEmail || tx.userPhone || 'N/A'}<br/><span style="color:#64748b; font-size:10px;">ID: ${tx.userId || 'N/A'}</span></td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 12px; color: #047857;">ETB ${(tx.amount || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${statusColor};">${statusText}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${bankName}<br/><span style="color:#475569; font-size:10px;">Acc: ${accountNumber}</span></td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 10px; font-family: monospace;">${tx.slipNo || tx.utrNumber || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 10px; color: #475569;">${tx.details || tx.adminNote || 'Verified'}</td>
      </tr>
    `;
  }).join('');

  const wordHTML = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${reportTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; color: #0f172a; }
        h1 { color: #065f46; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        .summary-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
        .summary-item { display: inline-block; margin-right: 25px; font-size: 12px; }
        .summary-label { color: #475569; font-size: 11px; text-transform: uppercase; }
        .summary-value { font-weight: bold; font-size: 14px; color: #065f46; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background-color: #047857; color: #ffffff; padding: 10px 8px; border: 1px solid #065f46; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { border: 1px solid #cbd5e1; }
        .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${reportTitle}</h1>
      <p class="subtitle">Generated automatically on ${generatedAt} | Official Administrative & Financial Statement</p>
      
      <div class="summary-box">
        <div class="summary-item">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${transactions.length} Records</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Volume (ETB)</div>
          <div class="summary-value">ETB ${totalAmount.toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Approved (SUCCESS)</div>
          <div class="summary-value" style="color: #059669;">${approvedCount}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Pending / Processing</div>
          <div class="summary-value" style="color: #d97706;">${pendingCount}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Rejected (FAILED)</div>
          <div class="summary-value" style="color: #dc2626;">${rejectedCount}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date & Time</th>
            <th>Type</th>
            <th>User Credentials (Email/Phone/ID)</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Bank & Account Deposited</th>
            <th>Slip / Ref No</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        MY COFFEE VIP • Verified Financial System • Confidential & Protected
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + wordHTML], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.doc') ? fileName : `${fileName}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers interactive Print-to-PDF / PDF View with styled layout
 */
export function printPDFReport(
  transactions: TransactionRecord[],
  reportTitle: string = 'MY COFFEE VIP Financial Statement'
): void {
  const generatedAt = new Date().toLocaleString();
  const totalAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const approvedCount = transactions.filter(t => t.status === 'SUCCESS').length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;

  let tableRows = transactions.map((tx, idx) => {
    const { bankName, accountNumber } = formatAccountBankInfo(tx);
    const statusText = formatExportStatus(tx.status);
    const isSuccess = tx.status === 'SUCCESS';
    const isPending = tx.status === 'PENDING' || tx.status === 'PROCESSING';
    const statusColor = isSuccess ? '#059669' : isPending ? '#d97706' : '#dc2626';

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px;">${tx.orderId || tx.id}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10.5px;">${tx.date || new Date(tx.timestamp).toLocaleString()}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 10.5px;">${tx.type.toUpperCase()}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10.5px;">${tx.userEmail || tx.userPhone || 'N/A'} (ID: <strong>${tx.userId || 'N/A'}</strong>)</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 11px; color: #047857;">ETB ${(tx.amount || 0).toFixed(2)}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 10.5px; color: ${statusColor};">${statusText}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px;"><strong>${bankName}</strong><br/>Acc: ${accountNumber}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px; font-family: monospace;">${tx.slipNo || tx.utrNumber || 'N/A'}</td>
      </tr>
    `;
  }).join('');

  const printableHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${reportTitle}</title>
      <style>
        @page { size: landscape; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 10px; font-size: 11px; }
        .header-wrap { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 12px; }
        h1 { margin: 0; font-size: 20px; color: #065f46; }
        .meta { color: #64748b; font-size: 10.5px; }
        .stats-grid { display: flex; gap: 12px; margin-bottom: 15px; }
        .stat-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 8px 12px; flex: 1; }
        .stat-title { font-size: 9.5px; text-transform: uppercase; color: #475569; font-weight: bold; }
        .stat-val { font-size: 14px; font-weight: bold; color: #065f46; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
        th { background: #047857; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; border: 1px solid #065f46; }
        td { border: 1px solid #cbd5e1; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px; padding: 10px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span><strong>PDF Export Ready:</strong> Use your browser print dialog to "Save as PDF" or Print directly.</span>
        <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
      </div>

      <div class="header-wrap">
        <div>
          <h1>${reportTitle}</h1>
          <div class="meta">Official Financial & Deposit/Payout Verification Report</div>
        </div>
        <div class="meta" style="text-align: right;">
          Generated: ${generatedAt}<br/>
          Status: <strong>Verified Platform Records</strong>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">Total Records</div>
          <div class="stat-val">${transactions.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Total Volume</div>
          <div class="stat-val">ETB ${totalAmount.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Approved</div>
          <div class="stat-val" style="color: #059669;">${approvedCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Pending</div>
          <div class="stat-val" style="color: #d97706;">${pendingCount}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date & Time</th>
            <th>Type</th>
            <th>User Account (Email/Phone/ID)</th>
            <th>Amount (ETB)</th>
            <th>Status</th>
            <th>Bank & Account Deposited</th>
            <th>Slip / Ref No</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          // Auto prompt print
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printableHTML);
    printWindow.document.close();
  } else {
    // Fallback download if popup blocked
    const blob = new Blob([printableHTML], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_statement_${Date.now()}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export Recharge (Deposit) Records with format choice
 */
export function exportRechargeRecordsFile(
  transactions: TransactionRecord[],
  statusFilter: 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' = 'ALL',
  format: 'excel' | 'word' | 'pdf' = 'excel'
): { count: number; fileName: string } {
  let records = transactions.filter((t) => t.type === 'recharge' || !!t.slipNo);
  if (statusFilter !== 'ALL') {
    if (statusFilter === 'PENDING') {
      records = records.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
    } else {
      records = records.filter((t) => t.status === statusFilter);
    }
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `recharge_deposits_${statusFilter.toLowerCase()}_${dateStr}`;

  if (format === 'word') {
    downloadWordDocFile(records, `Recharge & Deposit Statement (${statusFilter})`, `${baseName}.doc`);
    return { count: records.length, fileName: `${baseName}.doc` };
  } else if (format === 'pdf') {
    printPDFReport(records, `Recharge & Deposit Statement (${statusFilter})`);
    return { count: records.length, fileName: `${baseName}.pdf` };
  } else {
    const csv = generateTransactionsCSV(records, 'Recharge_Deposit_Records');
    downloadCSVFile(csv, `${baseName}.csv`);
    return { count: records.length, fileName: `${baseName}.csv` };
  }
}

/**
 * Export Withdrawal Records with format choice
 */
export function exportWithdrawalRecordsFile(
  transactions: TransactionRecord[],
  statusFilter: 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' = 'ALL',
  format: 'excel' | 'word' | 'pdf' = 'excel'
): { count: number; fileName: string } {
  let records = transactions.filter((t) => t.type === 'withdraw');
  if (statusFilter !== 'ALL') {
    if (statusFilter === 'PENDING') {
      records = records.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
    } else {
      records = records.filter((t) => t.status === statusFilter);
    }
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `withdrawal_payouts_${statusFilter.toLowerCase()}_${dateStr}`;

  if (format === 'word') {
    downloadWordDocFile(records, `Withdrawal & Payout Statement (${statusFilter})`, `${baseName}.doc`);
    return { count: records.length, fileName: `${baseName}.doc` };
  } else if (format === 'pdf') {
    printPDFReport(records, `Withdrawal & Payout Statement (${statusFilter})`);
    return { count: records.length, fileName: `${baseName}.pdf` };
  } else {
    const csv = generateTransactionsCSV(records, 'Withdrawal_Payout_Records');
    downloadCSVFile(csv, `${baseName}.csv`);
    return { count: records.length, fileName: `${baseName}.csv` };
  }
}

/**
 * Export Mining Orders History (Excel/CSV, Word, PDF)
 */
export function exportOrdersRecordsFile(
  orders: {
    id: string;
    title: string;
    planId: string;
    price: number;
    dailyIncome: number;
    totalEarnedSoFar: number;
    daysCompleted: number;
    cycleDays: number;
    purchaseDate: string;
    status: string;
  }[],
  format: 'excel' | 'word' | 'pdf' = 'excel'
): { count: number; fileName: string } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `mining_orders_history_${dateStr}`;

  const escapeCSV = (value: any): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  if (format === 'word') {
    const tableRows = orders.map((o, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${o.id}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: bold;">${o.title} (${o.planId})</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 11px; color: #047857;">ETB ${(o.price || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-size: 11px; color: #059669;">+ETB ${(o.dailyIncome || 0).toFixed(2)}/d</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 11px; color: #d97706;">ETB ${(o.totalEarnedSoFar || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${o.daysCompleted}/${o.cycleDays} Days</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; color: #059669;">${o.status}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 10px;">${o.purchaseDate}</td>
      </tr>
    `).join('');

    const wordHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>Mining Orders Statement</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:20px;color:#0f172a;} h1{color:#065f46;font-size:20px;} table{width:100%;border-collapse:collapse;margin-top:15px;font-size:11px;} th{background:#047857;color:#fff;padding:8px;border:1px solid #065f46;text-align:left;} td{border:1px solid #cbd5e1;}</style>
      </head><body>
      <h1>Mining Orders Statement & Contracts History</h1>
      <p style="color:#64748b;font-size:11px;">Generated on ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Order ID</th><th>Plan Machine</th><th>Capital (ETB)</th><th>Daily Yield</th><th>Total Earned</th><th>Progress</th><th>Status</th><th>Purchased</th></tr></thead><tbody>${tableRows}</tbody></table>
      </body></html>
    `;
    const blob = new Blob(['\uFEFF' + wordHTML], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    return { count: orders.length, fileName: `${baseName}.doc` };
  } else if (format === 'pdf') {
    const tableRows = orders.map((o, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px;">${o.id}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10.5px; font-weight: bold;">${o.title}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 11px; color: #047857;">ETB ${(o.price || 0).toFixed(2)}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-size: 10.5px; color: #059669;">+ETB ${(o.dailyIncome || 0).toFixed(2)}/d</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 11px; color: #d97706;">ETB ${(o.totalEarnedSoFar || 0).toFixed(2)}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10.5px;">${o.daysCompleted}/${o.cycleDays} Days</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px; font-weight: bold; color: #059669;">${o.status}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px;">${o.purchaseDate}</td>
      </tr>
    `).join('');

    const printableHTML = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Mining Orders Report</title>
      <style>@page{size:landscape;margin:12mm;} body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f172a;margin:0;padding:10px;font-size:11px;} h1{margin:0;font-size:18px;color:#065f46;} table{width:100%;border-collapse:collapse;margin-top:12px;} th{background:#047857;color:white;padding:7px;border:1px solid #065f46;text-align:left;font-size:10px;} td{border:1px solid #cbd5e1;}</style>
      </head><body>
      <h1>Mining Orders & Contracts Statement</h1>
      <p style="color:#64748b;font-size:10px;">Generated: ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Order ID</th><th>Machine Plan</th><th>Invested Capital</th><th>Daily Yield</th><th>Total Earned</th><th>Cycle Progress</th><th>Status</th><th>Purchase Date</th></tr></thead><tbody>${tableRows}</tbody></table>
      <script>window.onload=function(){window.print();};</script>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printableHTML);
      printWindow.document.close();
    }
    return { count: orders.length, fileName: `${baseName}.pdf` };
  } else {
    const headers = ['Order ID', 'Plan Title', 'Plan Tier', 'Invested Capital (ETB)', 'Daily Income (ETB)', 'Total Earned So Far (ETB)', 'Days Completed', 'Cycle Days', 'Purchase Date', 'Status'];
    const rows = orders.map(o => [
      escapeCSV(o.id),
      escapeCSV(o.title),
      escapeCSV(o.planId),
      escapeCSV((o.price || 0).toFixed(2)),
      escapeCSV((o.dailyIncome || 0).toFixed(2)),
      escapeCSV((o.totalEarnedSoFar || 0).toFixed(2)),
      escapeCSV(o.daysCompleted),
      escapeCSV(o.cycleDays),
      escapeCSV(o.purchaseDate),
      escapeCSV(o.status)
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    downloadCSVFile(csv, `${baseName}.csv`);
    return { count: orders.length, fileName: `${baseName}.csv` };
  }
}

/**
 * Export Plan Range & Portfolio Analysis
 */
export function exportPlanRangeAnalysisFile(
  analysis: {
    plan: { id: string; title: string; price: number; dailyIncome: number; coffeeType: string; powerRating: string };
    tierGroup: string;
    count: number;
    totalInvestedInPlan: number;
    totalDailyPayout: number;
    sharePercentage: number;
    dailyReturnPercent: string;
  }[],
  format: 'excel' | 'word' | 'pdf' = 'excel'
): { count: number; fileName: string } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `plan_range_portfolio_${dateStr}`;

  const escapeCSV = (value: any): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  if (format === 'word') {
    const tableRows = analysis.map((item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${item.plan.title}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${item.tierGroup}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">ETB ${(item.plan?.price || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #059669;">+${item.dailyReturnPercent}%/d</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.count} units</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #047857;">ETB ${(item.totalInvestedInPlan || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #059669;">ETB ${(item.totalDailyPayout || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${(item.sharePercentage || 0).toFixed(1)}%</td>
      </tr>
    `).join('');

    const wordHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>Mining Plans Portfolio Analysis</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:20px;color:#0f172a;} h1{color:#065f46;font-size:20px;} table{width:100%;border-collapse:collapse;margin-top:15px;font-size:11px;} th{background:#047857;color:#fff;padding:8px;border:1px solid #065f46;text-align:left;} td{border:1px solid #cbd5e1;}</style>
      </head><body>
      <h1>Mining Plans Portfolio & Range Analysis</h1>
      <p style="color:#64748b;font-size:11px;">Generated on ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Plan Type</th><th>Tier Group</th><th>Price (ETB)</th><th>Daily %</th><th>Active Units</th><th>Total Capital</th><th>Daily Yield</th><th>Portfolio Share</th></tr></thead><tbody>${tableRows}</tbody></table>
      </body></html>
    `;
    const blob = new Blob(['\uFEFF' + wordHTML], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    return { count: analysis.length, fileName: `${baseName}.doc` };
  } else if (format === 'pdf') {
    const tableRows = analysis.map((item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 10.5px;">${item.plan.title}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px;">${item.tierGroup}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 10.5px;">ETB ${(item.plan?.price || 0).toFixed(2)}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-size: 10.5px; color: #059669;">+${item.dailyReturnPercent}%/d</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 10.5px;">${item.count} units</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 11px; color: #047857;">ETB ${(item.totalInvestedInPlan || 0).toFixed(2)}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-size: 10.5px; color: #059669;">ETB ${(item.totalDailyPayout || 0).toFixed(2)}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; font-size: 10.5px;">${(item.sharePercentage || 0).toFixed(1)}%</td>
      </tr>
    `).join('');

    const printableHTML = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Mining Plans Portfolio Analysis</title>
      <style>@page{size:landscape;margin:12mm;} body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#0f172a;margin:0;padding:10px;font-size:11px;} h1{margin:0;font-size:18px;color:#065f46;} table{width:100%;border-collapse:collapse;margin-top:12px;} th{background:#047857;color:white;padding:7px;border:1px solid #065f46;text-align:left;font-size:10px;} td{border:1px solid #cbd5e1;}</style>
      </head><body>
      <h1>Mining Plans Portfolio & Range Analysis</h1>
      <p style="color:#64748b;font-size:10px;">Generated: ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Plan Type</th><th>Category Tier</th><th>Price Tier</th><th>Daily Return</th><th>Active Units</th><th>Total Capital</th><th>Daily Yield</th><th>Portfolio Share</th></tr></thead><tbody>${tableRows}</tbody></table>
      <script>window.onload=function(){window.print();};</script>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printableHTML);
      printWindow.document.close();
    }
    return { count: analysis.length, fileName: `${baseName}.pdf` };
  } else {
    const headers = ['Plan Title', 'Plan ID', 'Category Tier', 'Price Tier (ETB)', 'Daily Return %', 'Active Units', 'Total Capital Invested (ETB)', 'Daily Yield Volume (ETB)', 'Portfolio Share %', 'Coffee Bean Type', 'Power Rating'];
    const rows = analysis.map(item => [
      escapeCSV(item.plan.title),
      escapeCSV(item.plan.id),
      escapeCSV(item.tierGroup),
      escapeCSV((item.plan?.price || 0).toFixed(2)),
      escapeCSV(item.dailyReturnPercent),
      escapeCSV(item.count),
      escapeCSV((item.totalInvestedInPlan || 0).toFixed(2)),
      escapeCSV((item.totalDailyPayout || 0).toFixed(2)),
      escapeCSV((item.sharePercentage || 0).toFixed(2)),
      escapeCSV(item.plan?.coffeeType || 'Ethiopian Arabica'),
      escapeCSV(item.plan?.powerRating || '100%')
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    downloadCSVFile(csv, `${baseName}.csv`);
    return { count: analysis.length, fileName: `${baseName}.csv` };
  }
}

/**
 * Export Statement & Reports Master Financial Records
 */
export function exportStatementRecordsFile(
  records: TransactionRecord[],
  filterName: string = 'ALL',
  format: 'excel' | 'word' | 'pdf' = 'excel'
): { count: number; fileName: string } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `financial_statement_report_${filterName.toLowerCase()}_${dateStr}`;

  if (format === 'word') {
    downloadWordDocFile(records, `Official Financial Statement & Reports (${filterName})`, `${baseName}.doc`);
    return { count: records.length, fileName: `${baseName}.doc` };
  } else if (format === 'pdf') {
    printPDFReport(records, `Official Financial Statement & Reports (${filterName})`);
    return { count: records.length, fileName: `${baseName}.pdf` };
  } else {
    const csv = generateTransactionsCSV(records, `Financial_Statement_${filterName}`);
    downloadCSVFile(csv, `${baseName}.csv`);
    return { count: records.length, fileName: `${baseName}.csv` };
  }
}

/**
 * Export Verified Settlement Records
 */
export function exportVerifiedRecordsFile(
  records: TransactionRecord[],
  format: 'excel' | 'word' | 'pdf' = 'excel'
): { count: number; fileName: string } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `verified_settlements_${dateStr}`;

  if (format === 'word') {
    downloadWordDocFile(records, 'Verified Platform Settlements & Audit Report', `${baseName}.doc`);
    return { count: records.length, fileName: `${baseName}.doc` };
  } else if (format === 'pdf') {
    printPDFReport(records, 'Verified Platform Settlements & Audit Report');
    return { count: records.length, fileName: `${baseName}.pdf` };
  } else {
    const csv = generateTransactionsCSV(records, 'Verified_Settlement_Audit');
    downloadCSVFile(csv, `${baseName}.csv`);
    return { count: records.length, fileName: `${baseName}.csv` };
  }
}


