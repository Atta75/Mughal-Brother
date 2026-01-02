
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, AppState, Product, Transaction, Party, TransactionType, Expense, LoginEvent } from './types';
import { INITIAL_PRODUCTS, INITIAL_PARTIES, SCHEMA_DOCS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Ledger from './components/Ledger';
import Reports from './components/Reports';
import Purchases from './components/Purchases';
import Returns from './components/Returns';
import Expenses from './components/Expenses';
import Login from './components/Login';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    // Attempt to hydrate from localStorage
    const saved = localStorage.getItem('mughal_erp_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          // Ensure base products/parties are always fresh if needed, or keep saved ones
        };
      } catch (e) {
        console.error("Hydration failed", e);
      }
    }
    
    return {
      currentUser: { id: '', name: '', role: UserRole.ADMIN },
      products: INITIAL_PRODUCTS,
      parties: INITIAL_PARTIES,
      transactions: [],
      expenses: [],
      loginLogs: []
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('mughal_erp_isLoggedIn') === 'true';
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDocs, setShowDocs] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Persistence side effect
  useEffect(() => {
    localStorage.setItem('mughal_erp_state', JSON.stringify(state));
    localStorage.setItem('mughal_erp_isLoggedIn', isLoggedIn.toString());
  }, [state, isLoggedIn]);

  const handleLogin = (user: { id: string; name: string; role: UserRole }) => {
    const loginEvent: LoginEvent = {
      id: `LOG-${Date.now()}`,
      userName: user.name,
      role: user.role,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    };

    setState(prev => ({
      ...prev,
      currentUser: user,
      loginLogs: [loginEvent, ...(prev.loginLogs || [])].slice(0, 50) // Keep last 50 logs
    }));
    
    setIsLoggedIn(true);
    if (user.role === UserRole.CASHIER) setActiveTab('pos');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const addTransaction = (transaction: Transaction) => {
    setState(prev => {
      const updatedProducts = prev.products.map(p => {
        const item = transaction.items.find(i => i.productId === p.id);
        if (item) {
          switch (transaction.type) {
            case TransactionType.SALE_RETAIL:
            case TransactionType.SALE_WHOLESALE:
              return { ...p, stock: p.stock - item.quantity };
            case TransactionType.PURCHASE:
            case TransactionType.RETURN:
              return { ...p, stock: p.stock + item.quantity };
            default:
              return p;
          }
        }
        return p;
      });

      const updatedParties = prev.parties.map(party => {
        if (party.id === transaction.partyId) {
          let balanceChange = 0;
          if (transaction.type === TransactionType.SALE_RETAIL || transaction.type === TransactionType.SALE_WHOLESALE) {
            balanceChange = transaction.balance;
          } else if (transaction.type === TransactionType.PURCHASE) {
            balanceChange = -transaction.balance;
          } else if (transaction.type === TransactionType.RETURN) {
            balanceChange = -transaction.total; 
          }
          return { ...party, balance: party.balance + balanceChange };
        }
        return party;
      });

      return {
        ...prev,
        products: updatedProducts,
        parties: updatedParties,
        transactions: [transaction, ...prev.transactions]
      };
    });
  };

  const addExpense = (expense: Expense) => {
    setState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
  };

  const updateProduct = (updatedProduct: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onViewDetail={setSelectedTxDetail} />;
      case 'pos': return <POS state={state} onTransaction={addTransaction} />;
      case 'inventory': return <Inventory products={state.products} onUpdate={updateProduct} />;
      case 'ledger': return <Ledger parties={state.parties} transactions={state.transactions} onViewDetail={setSelectedTxDetail} />;
      case 'purchases': return <Purchases state={state} onTransaction={addTransaction} />;
      case 'returns': return <Returns state={state} onTransaction={addTransaction} />;
      case 'expenses': return <Expenses state={state} onAddExpense={addExpense} />;
      case 'reports': return <Reports state={state} />;
      default: return <Dashboard state={state} onViewDetail={setSelectedTxDetail} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={state.currentUser.role} 
        onToggleDocs={() => setShowDocs(!showDocs)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 no-print">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{state.currentUser.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{state.currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
              {state.currentUser.name[0]}
            </div>
          </div>
        </header>

        <div className="p-8 pb-20">
          {renderContent()}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTxDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 no-print">
             <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                   <h2 className="text-xl font-bold">Transaction Detail</h2>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => window.print()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
                      >
                         <i className="fas fa-print"></i> Print Detail
                      </button>
                      <button 
                        onClick={() => setSelectedTxDetail(null)}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                   </div>
                </div>
                
                <div className="p-8 print-container">
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <h1 className="text-3xl font-black text-gray-900">MUGHAL ENTERPRISE</h1>
                         <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Official Store Invoice</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold text-gray-700">Reference: {selectedTxDetail.id}</p>
                         <p className="text-xs text-gray-400">Date: {new Date(selectedTxDetail.date).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8 mb-8 border-y border-gray-100 py-6">
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Billed To</p>
                         <p className="font-bold text-gray-900">{state.parties.find(p => p.id === selectedTxDetail.partyId)?.name || 'Walk-in Customer'}</p>
                         <p className="text-sm text-gray-500">{state.parties.find(p => p.id === selectedTxDetail.partyId)?.phone || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                         <span className={`text-xs font-black uppercase px-2 py-1 rounded ${selectedTxDetail.balance === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {selectedTxDetail.balance === 0 ? 'Paid' : 'Unpaid/Credit'}
                         </span>
                      </div>
                   </div>

                   <table className="w-full mb-8">
                      <thead>
                         <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-bold text-gray-400">
                            <th className="py-3 text-left">Item Description</th>
                            <th className="py-3 text-center">Qty</th>
                            <th className="py-3 text-right">Price (PK)</th>
                            <th className="py-3 text-right">Total (PK)</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         {selectedTxDetail.items.map((item, idx) => (
                            <tr key={idx} className="text-sm">
                               <td className="py-4 font-bold text-gray-800">{item.name}</td>
                               <td className="py-4 text-center font-medium">{item.quantity}</td>
                               <td className="py-4 text-right font-medium">{item.price.toLocaleString()}</td>
                               <td className="py-4 text-right font-bold">{item.total.toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>

                   <div className="w-full max-w-xs ml-auto space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                         <span>Subtotal</span>
                         <span className="font-bold">PKR {selectedTxDetail.subTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                         <span>Discount</span>
                         <span className="font-bold text-red-600">-PKR {selectedTxDetail.discount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-900">
                         <span className="text-lg font-black uppercase">Grand Total</span>
                         <span className="text-lg font-black text-blue-600">PKR {selectedTxDetail.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-gray-100 text-green-600 font-bold">
                         <span>Paid Amount</span>
                         <span>PKR {selectedTxDetail.paidAmount.toLocaleString()}</span>
                      </div>
                      {selectedTxDetail.balance > 0 && (
                        <div className="flex justify-between text-sm text-red-600 font-bold">
                           <span>Balance Due</span>
                           <span>PKR {selectedTxDetail.balance.toLocaleString()}</span>
                        </div>
                      )}
                   </div>

                   <div className="mt-16 pt-16 border-t border-dashed border-gray-200 flex justify-between">
                      <div className="text-center">
                         <div className="w-40 border-b border-gray-900 mb-2"></div>
                         <p className="text-[10px] font-bold uppercase text-gray-400">Authorized Signatory</p>
                      </div>
                      <div className="text-center">
                         <div className="w-40 border-b border-gray-900 mb-2"></div>
                         <p className="text-[10px] font-bold uppercase text-gray-400">Customer Signature</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Documentation Modal */}
        {showDocs && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm no-print">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-database text-blue-600"></i>
                  System Architecture & Schema
                </h2>
                <button onClick={() => setShowDocs(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-gray-50">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {SCHEMA_DOCS}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
