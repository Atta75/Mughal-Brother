
import React, { useState } from 'react';
import { AppState, Product, Transaction, TransactionType, TransactionItem, Party } from '../types';

interface PurchasesProps {
  state: AppState;
  onTransaction: (t: Transaction) => void;
}

const Purchases: React.FC<PurchasesProps> = ({ state, onTransaction }) => {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('s1');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const suppliers = state.parties.filter(p => p.type === 'SUPPLIER');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.costPrice,
        total: product.costPrice
      }];
    });
  };

  const total = cart.reduce((acc, item) => acc + item.total, 0);
  const balance = total - paidAmount;

  const handleComplete = () => {
    if (cart.length === 0) return;
    const transaction: Transaction = {
      id: `PUR-${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.PURCHASE,
      items: cart,
      subTotal: total,
      discount: 0,
      total,
      paidAmount,
      balance,
      partyId: selectedSupplierId
    };
    onTransaction(transaction);
    setCart([]);
    setPaidAmount(0);
    alert('Purchase recorded successfully. Stock updated.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <h3 className="text-lg font-bold mb-4">Select Products to Restock</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {state.products.map(p => (
                <button 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-4 border border-gray-100 rounded-xl text-left hover:border-blue-500 transition-all bg-gray-50/50"
                >
                  <p className="font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">Current Stock: <span className="font-bold text-slate-700">{p.stock}</span></p>
                  <p className="text-sm font-black text-blue-600 mt-2">PKR {p.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </button>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Purchase Items</div>
          <table className="w-full">
             <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 font-bold border-b">
                <tr>
                   <th className="px-6 py-3 text-left">Item</th>
                   <th className="px-6 py-3 text-center">Qty</th>
                   <th className="px-6 py-3 text-right">Cost (PKR)</th>
                   <th className="px-6 py-3 text-right">Total (PKR)</th>
                </tr>
             </thead>
             <tbody className="divide-y">
                {cart.map(item => (
                   <tr key={item.productId}>
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">PKR {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right font-bold">PKR {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                   </tr>
                ))}
                {cart.length === 0 && (
                   <tr><td colSpan={4} className="py-10 text-center text-gray-400">Add products to start purchase entry</td></tr>
                )}
             </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl space-y-6 sticky top-24">
           <h3 className="font-bold text-lg border-b pb-4">Supplier & Payment</h3>
           <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Supplier</label>
              <select 
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full p-3 bg-gray-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
              >
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
           </div>
           <div className="space-y-3 pt-4">
              <div className="flex justify-between text-lg">
                 <span>Grand Total</span>
                 <span className="font-black text-2xl">PKR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Paid to Supplier (PKR)</label>
                 <input 
                   type="number" 
                   value={paidAmount}
                   onChange={(e) => setPaidAmount(Number(e.target.value))}
                   className="w-full p-3 bg-gray-50 border rounded-xl font-black text-green-600 text-xl"
                 />
              </div>
              <div className="flex justify-between font-bold text-red-600">
                 <span>Balance Payable</span>
                 <span>PKR {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
           </div>
           <button 
             disabled={cart.length === 0}
             onClick={handleComplete}
             className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg disabled:bg-gray-200"
           >
             Save Purchase Entry
           </button>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
