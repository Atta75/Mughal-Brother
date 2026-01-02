
import React, { useState } from 'react';
import { AppState, Transaction, TransactionType, TransactionItem } from '../types';

interface ReturnsProps {
  state: AppState;
  onTransaction: (t: Transaction) => void;
}

const Returns: React.FC<ReturnsProps> = ({ state, onTransaction }) => {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [returningItems, setReturningItems] = useState<TransactionItem[]>([]);

  const handleSearch = () => {
    const tx = state.transactions.find(t => t.id === searchInvoice && (t.type === TransactionType.SALE_RETAIL || t.type === TransactionType.SALE_WHOLESALE));
    if (tx) {
      setSelectedTx(tx);
      setReturningItems([]);
    } else {
      alert('Invoice not found.');
    }
  };

  const toggleItem = (item: TransactionItem) => {
    setReturningItems(prev => {
      const exists = prev.find(i => i.productId === item.productId);
      if (exists) return prev.filter(i => i.productId !== item.productId);
      return [...prev, item];
    });
  };

  const returnTotal = returningItems.reduce((acc, i) => acc + i.total, 0);

  const handleCompleteReturn = () => {
    if (!selectedTx || returningItems.length === 0) return;
    
    const returnTx: Transaction = {
      id: `RET-${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.RETURN,
      items: returningItems,
      subTotal: returnTotal,
      discount: 0,
      total: returnTotal,
      paidAmount: returnTotal, // Assuming full cash back for simplicity
      balance: 0,
      partyId: selectedTx.partyId,
      notes: `Return from invoice ${selectedTx.id}`
    };

    onTransaction(returnTx);
    setSelectedTx(null);
    setReturningItems([]);
    setSearchInvoice('');
    alert('Return processed successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Process Sales Return</h3>
          <div className="flex gap-4">
             <div className="flex-1 relative">
                <i className="fas fa-file-invoice absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder="Enter Invoice ID (e.g., TX-1712...)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                />
             </div>
             <button 
               onClick={handleSearch}
               className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
             >Find Order</button>
          </div>
       </div>

       {selectedTx && (
         <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
               <div>
                  <h4 className="font-bold text-gray-900">Items from Invoice {selectedTx.id}</h4>
                  <p className="text-sm text-gray-500">{new Date(selectedTx.date).toLocaleDateString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">Original Total</p>
                  <p className="font-black text-xl text-slate-800">PKR {selectedTx.total.toLocaleString()}</p>
               </div>
            </div>
            <div className="p-6">
               <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Select items to return</label>
               <div className="space-y-3">
                  {selectedTx.items.map(item => (
                     <div 
                       key={item.productId}
                       onClick={() => toggleItem(item)}
                       className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${returningItems.some(i => i.productId === item.productId) ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:bg-gray-50'}`}
                     >
                        <div className={`w-6 h-6 rounded flex items-center justify-center border ${returningItems.some(i => i.productId === item.productId) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                           {returningItems.some(i => i.productId === item.productId) && <i className="fas fa-check text-white text-[10px]"></i>}
                        </div>
                        <div className="flex-1">
                           <p className="font-bold text-gray-800">{item.name}</p>
                           <p className="text-xs text-gray-500">Qty: {item.quantity} • Rate: PKR {item.price.toLocaleString()}</p>
                        </div>
                        <p className="font-black text-gray-900">PKR {item.total.toLocaleString()}</p>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Refund Amount</p>
                  <p className="text-3xl font-black text-blue-400">PKR {returnTotal.toLocaleString()}</p>
               </div>
               <button 
                 disabled={returningItems.length === 0}
                 onClick={handleCompleteReturn}
                 className="px-10 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
               >Confirm Return</button>
            </div>
         </div>
       )}
    </div>
  );
};

export default Returns;
