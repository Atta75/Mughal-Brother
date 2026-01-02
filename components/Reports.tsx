
import React, { useMemo, useState } from 'react';
import { AppState, TransactionType, UserRole } from '../types';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const [activeSubTab, setActiveSubTab] = useState<'financial' | 'security'>('financial');

  const financialData = useMemo(() => {
    const sales = state.transactions
      .filter(t => t.type === TransactionType.SALE_RETAIL || t.type === TransactionType.SALE_WHOLESALE)
      .reduce((acc, t) => acc + t.total, 0);

    const costOfGoods = state.transactions
      .filter(t => t.type === TransactionType.SALE_RETAIL || t.type === TransactionType.SALE_WHOLESALE)
      .reduce((acc, t) => {
        const cost = t.items.reduce((sum, item) => {
          const product = state.products.find(p => p.id === item.productId);
          return sum + (product?.costPrice || 0) * item.quantity;
        }, 0);
        return acc + cost;
      }, 0);

    const grossProfit = sales - costOfGoods;
    const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    const totalInventoryValue = state.products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const totalRetailValue = state.products.reduce((acc, p) => acc + (p.retailPrice * p.stock), 0);

    return { sales, costOfGoods, grossProfit, totalExpenses, netProfit, totalInventoryValue, totalRetailValue };
  }, [state]);

  const handleExport = () => {
    const headers = ["Mughal Store Management - Profit & Loss Statement"];
    const subHeaders = [`Report Generated: ${new Date().toLocaleString()}`, ""];
    const columnHeaders = ["Description", "Category", "Amount (PKR)"];
    
    const rows = [
      ["REVENUE", "", ""],
      ["Net Sales Revenue", "Income", financialData.sales.toFixed(2)],
      ["Cost of Goods Sold (COGS)", "Expense", `-${financialData.costOfGoods.toFixed(2)}`],
      ["GROSS PROFIT", "Subtotal", financialData.grossProfit.toFixed(2)],
      ["", "", ""],
      ["OPERATIONAL EXPENSES", "", ""],
      ...state.expenses.map(e => [e.description || e.category, e.category, `-${e.amount.toFixed(2)}`]),
      ["TOTAL EXPENSES", "Total", `-${financialData.totalExpenses.toFixed(2)}`],
      ["", "", ""],
      ["NET PROFIT / LOSS", "Final", financialData.netProfit.toFixed(2)],
    ];

    const csvContent = [headers, subHeaders, columnHeaders, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Mughal_PNL_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-4 no-print">
         <button 
           onClick={() => setActiveSubTab('financial')}
           className={`px-6 py-2 rounded-xl font-bold transition-all ${activeSubTab === 'financial' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
         >Financial Reports</button>
         <button 
           onClick={() => setActiveSubTab('security')}
           className={`px-6 py-2 rounded-xl font-bold transition-all ${activeSubTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
         >Security & Audit Logs</button>
      </div>

      {activeSubTab === 'financial' ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm print-container">
          {/* Print-Only Header */}
          <div className="print-header">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 leading-tight">MUGHAL ENTERPRISE</h1>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Executive Performance Summary</p>
                  <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                     <span>ID: REP-{Date.now().toString().slice(-6)}</span>
                     <span>Audit Status: Certified</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">Financial Reporting Suite</p>
                  <p className="text-xs text-slate-400">Generated: {new Date().toLocaleString()}</p>
                  <div className="mt-2 bg-slate-900 text-white px-3 py-1 text-[10px] font-black inline-block rounded">CONFIDENTIAL</div>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center mb-10 no-print">
            <div>
              <h3 className="text-2xl font-black text-gray-900">System Reports</h3>
              <p className="text-gray-500 font-medium">Detailed financial and operational breakdown</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
              >
                <i className="fas fa-print"></i> Print Master Report
              </button>
              <button 
                onClick={handleExport}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200"
              >
                <i className="fas fa-file-csv"></i> Download CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Revenue & P&L */}
            <section className="space-y-6">
              <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Profit & Loss Analysis</h4>
                <span className="text-[10px] font-bold text-slate-400">PKR Currency</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium text-sm">Gross Sales Revenue</span>
                  <span className="font-bold text-slate-900">PKR {financialData.sales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium text-sm">Direct Cost of Sales (COGS)</span>
                  <span className="font-bold text-rose-600">({financialData.costOfGoods.toLocaleString()})</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-900 uppercase">Gross Operating Profit</span>
                  <span className="text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-4">PKR {financialData.grossProfit.toLocaleString()}</span>
                </div>
                <div className="space-y-2 mt-6">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Operational Overheads</p>
                   {state.expenses.length > 0 ? (
                     state.expenses.map(e => (
                       <div key={e.id} className="flex justify-between text-xs">
                         <span className="text-slate-500">{e.description || e.category}</span>
                         <span className="font-bold text-slate-700">{e.amount.toLocaleString()}</span>
                       </div>
                     ))
                   ) : (
                     <p className="text-slate-300 italic text-[10px]">No overheads recorded</p>
                   )}
                </div>
                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 uppercase">Net Business Income</span>
                  <span className={`text-xl font-black ${financialData.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    PKR {financialData.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* Asset & Inventory Report */}
            <section className="space-y-6">
               <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2">
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Stock & Asset Valuation</h4>
                 <span className="text-[10px] font-bold text-slate-400">Current Standing</span>
               </div>
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Inventory Cost</p>
                     <p className="text-2xl font-black text-slate-900">PKR {financialData.totalInventoryValue.toLocaleString()}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expected Market Value</p>
                     <p className="text-2xl font-black text-emerald-600">PKR {financialData.totalRetailValue.toLocaleString()}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                     <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Unrealized Margin</span>
                        <span className="text-slate-900">PKR {(financialData.totalRetailValue - financialData.totalInventoryValue).toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inventory Health</h5>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 border rounded-xl bg-white">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Items</p>
                        <p className="text-lg font-black text-slate-900">{state.products.length}</p>
                     </div>
                     <div className="p-3 border rounded-xl bg-white">
                        <p className="text-[10px] font-bold text-rose-400 uppercase">Low Stock</p>
                        <p className="text-lg font-black text-rose-600">{state.products.filter(p => p.stock <= p.minStock).length}</p>
                     </div>
                  </div>
               </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">User Access Audit Logs</h3>
              <span className="text-xs font-bold text-gray-400 uppercase">Security Monitor Active</span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b">
                    <tr>
                       <th className="px-6 py-4">Event ID</th>
                       <th className="px-6 py-4">User</th>
                       <th className="px-6 py-4">Role</th>
                       <th className="px-6 py-4">Timestamp</th>
                       <th className="px-6 py-4">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {state.loginLogs?.map(log => (
                       <tr key={log.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-xs font-mono text-gray-400">{log.id}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{log.userName}</td>
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">{log.role}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                             {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {log.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                    {!state.loginLogs?.length && (
                       <tr>
                          <td colSpan={5} className="py-20 text-center text-gray-300 italic font-medium">
                             No audit logs available for the current session.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
