
import React, { useEffect, useState, useMemo } from 'react';
import { AppState, TransactionType, Transaction, UserRole } from '../types';
import { getAIInsights } from '../geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  onViewDetail: (tx: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onViewDetail }) => {
  const [insights, setInsights] = useState<string>('Analyzing your business data...');
  const isAdmin = state.currentUser.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchInsights = async () => {
      const data = await getAIInsights(state);
      setInsights(data || "No insights available.");
    };
    fetchInsights();
  }, [state]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = state.transactions.filter(t => t.date.startsWith(today));
    
    const revenue = todaysTransactions
      .filter(t => t.type === TransactionType.SALE_RETAIL || t.type === TransactionType.SALE_WHOLESALE)
      .reduce((acc, t) => acc + t.total, 0);
    
    const cashIn = state.transactions
      .filter(t => t.type !== TransactionType.PURCHASE && t.type !== TransactionType.RETURN)
      .reduce((acc, t) => acc + t.paidAmount, 0);
    
    const cashOut = state.expenses.reduce((acc, e) => acc + e.amount, 0) + 
                  state.transactions.filter(t => t.type === TransactionType.PURCHASE).reduce((acc, t) => acc + t.paidAmount, 0);
    
    const netCash = cashIn - cashOut;
    const receivables = state.parties.filter(p => p.type === 'CUSTOMER').reduce((acc, p) => acc + (p.balance > 0 ? p.balance : 0), 0);

    return { revenue, receivables, netCash };
  }, [state]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySales = state.transactions
        .filter(t => t.date.startsWith(date) && (t.type === TransactionType.SALE_RETAIL || t.type === TransactionType.SALE_WHOLESALE))
        .reduce((sum, t) => sum + t.total, 0);
      return { date: date.split('-').slice(1).join('/'), sales: daySales };
    });
  }, [state.transactions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
         <div>
            <h2 className="text-xl font-black text-slate-800">Operational Overview</h2>
            <p className="text-sm text-slate-500">Global metrics & health</p>
         </div>
         <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="bg-white text-slate-900 border border-slate-200 px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
                <i className="fas fa-print"></i> Print Summary
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <StatCard title="Today's Sales" value={`PKR ${metrics.revenue.toLocaleString()}`} icon="fa-chart-line" color="bg-blue-600" />
        <StatCard title="Total Receivables" value={`PKR ${metrics.receivables.toLocaleString()}`} icon="fa-hand-holding-dollar" color="bg-amber-600" />
        <StatCard title="Cash Position" value={`PKR ${metrics.netCash.toLocaleString()}`} icon="fa-wallet" color="bg-emerald-600" />
        <StatCard title="Inventory Valuation" value={`PKR ${state.products.reduce((a,p)=>a+(p.costPrice*p.stock),0).toLocaleString()}`} icon="fa-boxes-stacked" color="bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-slate-800">Sales Velocity (Last 7 Days)</h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border">PKR Figures</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI & Security Column */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <i className="fas fa-sparkles text-yellow-300"></i>
                <h3 className="text-sm font-black uppercase tracking-widest">Gemini Insights</h3>
              </div>
              <div className="text-xs font-medium italic opacity-90 leading-relaxed whitespace-pre-wrap">
                {insights}
              </div>
            </div>
          </div>

          {/* Admin-Only Security Card */}
          {isAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Security Health</h3>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-600">Last Login (Admin)</span>
                     <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-600">Active Sessions</span>
                     <span className="text-xs font-black text-blue-600">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-600">Access Identity</span>
                     <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">Verified</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
           <h3 className="font-black text-slate-800">Transaction Registry</h3>
           <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Full History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase text-slate-400 font-bold tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Account Holder</th>
                <th className="px-6 py-4 text-right">Amount (PKR)</th>
                <th className="px-6 py-4 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {state.transactions.slice(0, 5).map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{tx.id}</p>
                    <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                      tx.type.includes('SALE') ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{state.parties.find(p=>p.id===tx.partyId)?.name || 'General'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <p className="font-black text-slate-900">PKR {tx.total.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                     <button onClick={() => onViewDetail(tx)} className="p-2 text-slate-400 hover:text-blue-600">
                        <i className="fas fa-file-invoice-dollar"></i>
                     </button>
                  </td>
                </tr>
              ))}
              {state.transactions.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-300 italic">No business records today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white text-lg shadow-lg`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
