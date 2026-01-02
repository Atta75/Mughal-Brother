
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onToggleDocs: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, onToggleDocs, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', roles: [UserRole.ADMIN, UserRole.CASHIER, UserRole.SALESMAN] },
    { id: 'pos', label: 'Retail POS', icon: 'fa-cash-register', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'purchases', label: 'Purchases', icon: 'fa-truck-loading', roles: [UserRole.ADMIN, UserRole.SALESMAN] },
    { id: 'returns', label: 'Returns', icon: 'fa-rotate-left', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked', roles: [UserRole.ADMIN, UserRole.SALESMAN] },
    { id: 'ledger', label: 'Ledgers', icon: 'fa-book', roles: [UserRole.ADMIN, UserRole.SALESMAN] },
    { id: 'expenses', label: 'Expenses', icon: 'fa-receipt', roles: [UserRole.ADMIN] },
    { id: 'reports', label: 'Reports', icon: 'fa-file-invoice-dollar', roles: [UserRole.ADMIN] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 shrink-0 no-print">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <i className="fas fa-store text-white text-lg"></i>
        </div>
        <div>
           <span className="text-xl font-black tracking-tight block">Mughal</span>
           <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Enterprise</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
        {menuItems.filter(item => item.roles.includes(role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center text-sm ${activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400 transition-colors'}`}></i>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 space-y-4">
        <button 
          onClick={onToggleDocs}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-white transition-all border border-slate-700/50"
        >
          <i className="fas fa-terminal text-xs"></i>
          <span className="text-xs font-bold uppercase tracking-wider">Dev Specs</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20 group"
        >
          <i className="fas fa-power-off text-xs group-hover:scale-110 transition-transform"></i>
          <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
        </button>

        <div className="flex items-center justify-between px-2">
           <span className="text-[10px] text-slate-500 font-bold uppercase">v2.1.0 (Live)</span>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
