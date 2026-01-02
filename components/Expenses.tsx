
import React, { useState } from 'react';
import { AppState, Expense } from '../types';

interface ExpensesProps {
  state: AppState;
  onAddExpense: (e: Expense) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ state, onAddExpense }) => {
  const [formData, setFormData] = useState({ category: 'Rent', description: '', amount: 0 });

  const categories = ['Rent', 'Electricity', 'Salaries', 'Maintenance', 'Marketing', 'Others'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    
    const expense: Expense = {
      id: `EXP-${Date.now()}`,
      date: new Date().toISOString(),
      ...formData
    };
    
    onAddExpense(expense);
    setFormData({ category: 'Rent', description: '', amount: 0 });
    alert('Expense recorded.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-fit no-print">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
             <i className="fas fa-plus-circle text-blue-600"></i>
             Record New Expense
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                <select 
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g., Monthly electricity bill"
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Amount (PKR)</label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                />
             </div>
             <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4">
                Add Expense
             </button>
          </form>
       </div>

       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print-container lg:col-span-1">
          {/* Print Header */}
          <div className="print-header">
             <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900">MUGHAL ENTERPRISE</h1>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Operational Expense Report</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">Reporting Period</p>
                  <p className="text-xs text-gray-400">Printed: {new Date().toLocaleDateString()}</p>
                </div>
             </div>
          </div>

          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex justify-between items-center no-print">
             <span>Recent Expenses</span>
             <button 
               onClick={handlePrint}
               className="text-xs font-bold bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 flex items-center gap-1 transition-all"
             >
               <i className="fas fa-print"></i> Print List
             </button>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto print:max-h-none print:overflow-visible">
             {state.expenses.map(exp => (
                <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                   <div>
                      <p className="font-bold text-gray-800">{exp.description || exp.category}</p>
                      <p className="text-xs text-gray-400">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                   </div>
                   <p className="font-black text-red-600">PKR {exp.amount.toLocaleString()}</p>
                </div>
             ))}
             {state.expenses.length === 0 && (
                <div className="py-20 text-center text-gray-300 flex flex-col items-center gap-2 no-print">
                   <i className="fas fa-receipt text-4xl opacity-20"></i>
                   <p className="font-medium italic">No expenses recorded yet.</p>
                </div>
             )}
          </div>
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:bg-gray-100 print:text-black print:border-t">
             <span className="font-bold">Total Expenses</span>
             <span className="font-black text-xl">PKR {state.expenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</span>
          </div>
       </div>
    </div>
  );
};

export default Expenses;
