
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, Product, Transaction, TransactionType, TransactionItem, Party } from '../types';

interface POSProps {
  state: AppState;
  onTransaction: (t: Transaction) => void;
}

const POS: React.FC<POSProps> = ({ state, onTransaction }) => {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [search, setSearch] = useState('');
  const [saleType, setSaleType] = useState<TransactionType>(TransactionType.SALE_RETAIL);
  const [selectedParty, setSelectedParty] = useState<string>('c1'); // Walk-in by default
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const parties = state.parties.filter(p => p.type === 'CUSTOMER');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const price = saleType === TransactionType.SALE_WHOLESALE ? product.wholesalePrice : product.retailPrice;
      
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * price }
          : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: price,
        total: price
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const total = Math.max(0, subTotal - discount);
  const balance = Math.max(0, total - paidAmount);

  useEffect(() => {
    setPaidAmount(total); // Default to full payment
  }, [total]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toISOString(),
      type: saleType,
      items: cart,
      subTotal,
      discount,
      total,
      paidAmount,
      balance,
      partyId: selectedParty,
      dueDate: balance > 0 ? new Date(Date.now() + 30*24*60*60*1000).toISOString() : undefined
    };

    onTransaction(transaction);
    setLastTransaction(transaction);
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
  };

  const handlePrintReceipt = () => {
    window.print();
    setLastTransaction(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Product Selection */}
      <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden no-print">
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
                onClick={() => setSaleType(TransactionType.SALE_RETAIL)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${saleType === TransactionType.SALE_RETAIL ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
             >Retail</button>
             <button 
                onClick={() => setSaleType(TransactionType.SALE_WHOLESALE)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${saleType === TransactionType.SALE_WHOLESALE ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
             >Wholesale</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col group"
            >
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{product.category}</span>
                <span className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock} in stock
                </span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600">{product.name}</h4>
              <p className="text-xs text-gray-400 mb-3">{product.sku}</p>
              <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-end">
                <div>
                   <p className="text-xs text-gray-400">Price</p>
                   <p className="text-lg font-black text-gray-900">
                    PKR {(saleType === TransactionType.SALE_WHOLESALE ? product.wholesalePrice : product.retailPrice).toLocaleString()}
                   </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <i className="fas fa-plus"></i>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-xl flex flex-col overflow-hidden no-print">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-shopping-cart text-blue-600"></i>
            Current Cart
          </h3>
          <button 
            onClick={() => setCart([])}
            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase"
          >Clear Cart</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map(item => (
            <div key={item.productId} className="flex gap-4 group">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">PKR {item.price.toLocaleString()} / unit</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs hover:bg-gray-200"
                >-</button>
                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs hover:bg-gray-200"
                >+</button>
              </div>
              <div className="text-right w-24">
                <p className="text-sm font-bold text-gray-900">PKR {item.total.toLocaleString()}</p>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 uppercase font-bold transition-all"
                >Remove</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50 py-20">
              <i className="fas fa-cart-plus text-5xl"></i>
              <p className="font-medium">Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
          <div className="space-y-2">
             <div className="flex justify-between text-sm text-gray-600">
               <span>Subtotal</span>
               <span className="font-bold">PKR {subTotal.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-sm text-gray-600">
               <span>Discount (PKR)</span>
               <input 
                 type="number" 
                 className="w-24 text-right bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none p-1 font-bold"
                 value={discount}
                 onChange={(e) => setDiscount(Number(e.target.value))}
               />
             </div>
             <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
               <span className="text-lg font-bold text-gray-900">Total Payable</span>
               <span className="text-xl font-black text-blue-600">PKR {total.toLocaleString()}</span>
             </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase">Customer Details</label>
            <select 
              className="w-full p-2 rounded border border-gray-200 text-sm font-medium"
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
            >
              {parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.subType})</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paid Amount</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-white border border-gray-200 rounded text-sm font-bold"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Balance Due</label>
                <div className={`w-full p-2 bg-gray-100 rounded text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                   PKR {balance.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <i className="fas fa-check-circle"></i>
            Complete Checkout
          </button>
        </div>
      </div>

      {/* SUCCESS DIALOG & RECEIPT PRINT (Overlays main POS) */}
      {lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl print-container">
              <div className="p-8 text-center border-b border-dashed no-print">
                 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fas fa-check"></i>
                 </div>
                 <h2 className="text-2xl font-black text-gray-900">Success!</h2>
                 <p className="text-gray-500 font-medium">Invoice {lastTransaction.id} Generated</p>
              </div>

              {/* Receipt Content */}
              <div className="p-6 font-mono text-sm leading-tight text-gray-800">
                 <div className="text-center mb-6">
                    <h1 className="text-xl font-black tracking-tighter">MUGHAL ENTERPRISE</h1>
                    <p className="text-[10px]">Retail & Wholesale Solutions</p>
                    <p className="text-[10px] mt-1">Date: {new Date(lastTransaction.date).toLocaleString()}</p>
                    <p className="text-[10px]">Ref: {lastTransaction.id}</p>
                 </div>
                 <div className="border-y border-dashed py-3 my-3">
                    {lastTransaction.items.map(item => (
                       <div key={item.productId} className="flex justify-between mb-1">
                          <span className="flex-1">{item.name} x{item.quantity}</span>
                          <span>PKR {item.total.toLocaleString()}</span>
                       </div>
                    ))}
                 </div>
                 <div className="space-y-1 mb-6">
                    <div className="flex justify-between text-xs"><span>Subtotal:</span><span>PKR {lastTransaction.subTotal.toLocaleString()}</span></div>
                    {lastTransaction.discount > 0 && <div className="flex justify-between text-xs"><span>Discount:</span><span>-PKR {lastTransaction.discount.toLocaleString()}</span></div>}
                    <div className="flex justify-between font-black text-lg pt-2 border-t"><span>TOTAL:</span><span>PKR {lastTransaction.total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs"><span>Paid:</span><span>PKR {lastTransaction.paidAmount.toLocaleString()}</span></div>
                    {lastTransaction.balance > 0 && <div className="flex justify-between text-xs font-bold text-red-600"><span>Balance:</span><span>PKR {lastTransaction.balance.toLocaleString()}</span></div>}
                 </div>
                 <div className="text-center no-print">
                    <p className="text-[10px] text-gray-400">Thank you for shopping with us!</p>
                 </div>
              </div>

              <div className="p-6 bg-gray-50 no-print flex gap-3">
                 <button 
                   onClick={handlePrintReceipt}
                   className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                 >
                    <i className="fas fa-print"></i> Print Receipt
                 </button>
                 <button 
                   onClick={() => setLastTransaction(null)}
                   className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl"
                 >Done</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POS;