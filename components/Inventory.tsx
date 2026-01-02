
import React, { useState } from 'react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onUpdate: (p: Product) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
  const [filter, setFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.sku.toLowerCase().includes(filter.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm print-container">
      {/* Print Header */}
      <div className="print-header">
         <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">MUGHAL ENTERPRISE</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Inventory Status & Stock Report</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">Stock Valuation Date</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
         </div>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center no-print">
        <h3 className="text-lg font-bold">Manage Inventory</h3>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Filter by SKU or Name..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={handlePrint}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-all border border-gray-200"
          >
            <i className="fas fa-print"></i> Print
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 whitespace-nowrap">
            <i className="fas fa-plus"></i> New Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">SKU & Product</th>
              <th className="px-6 py-4">Retail (PKR)</th>
              <th className="px-6 py-4">Wholesale (PKR)</th>
              <th className="px-6 py-4">Cost (PKR)</th>
              <th className="px-6 py-4">Margin (%)</th>
              <th className="px-6 py-4">In Stock</th>
              <th className="px-6 py-4 text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => {
              const margin = p.retailPrice > 0 ? ((p.retailPrice - p.costPrice) / p.retailPrice * 100).toFixed(1) : "0.0";
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{p.retailPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{p.wholesalePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-gray-500">{p.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full">{margin}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`font-bold ${p.stock <= p.minStock ? 'text-red-600' : 'text-gray-900'}`}>{p.stock}</span>
                       {p.stock <= p.minStock && <i className="fas fa-triangle-exclamation text-amber-500 text-xs no-print"></i>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <button 
                      onClick={() => setEditingProduct(p)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Edit Product: {editingProduct.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Retail Price (PKR)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={editingProduct.retailPrice}
                  onChange={(e) => setEditingProduct({...editingProduct, retailPrice: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Level</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
               <button 
                 onClick={() => {
                   onUpdate(editingProduct);
                   setEditingProduct(null);
                 }}
                 className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200"
               >Save Changes</button>
               <button 
                 onClick={() => setEditingProduct(null)}
                 className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200"
               >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
