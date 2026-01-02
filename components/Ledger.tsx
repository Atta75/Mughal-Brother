
import React, { useState } from 'react';
import { Party, Transaction } from '../types';

interface LedgerProps {
  parties: Party[];
  transactions: Transaction[];
  onViewDetail: (tx: Transaction) => void;
}

const Ledger: React.FC<LedgerProps> = ({ parties, transactions, onViewDetail }) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const selectedParty = parties.find(p => p.id === selectedPartyId);
  const partyTransactions = transactions.filter(t => t.partyId === selectedPartyId);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col no-print">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-bold text-gray-800">All Parties</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {parties.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedPartyId(p.id)}
              className={`w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-all ${selectedPartyId === p.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
            >
              <div className="text-left">
                <p className="font-bold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400 uppercase tracking-tight">{p.type} • {p.subType}</p>
              </div>
              <div className={`text-right font-black ${p.balance > 0 ? 'text-red-600' : p.balance < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                PKR {Math.abs(p.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <p className="text-[10px] uppercase font-bold">{p.balance > 0 ? 'Receivable' : p.balance < 0 ? 'Payable' : 'Clear'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {selectedParty ? (
          <div className="print-container bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="print-header">
               <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900">MUGHAL ENTERPRISE</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase">Customer / Supplier Account Statement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black no-print">
                {selectedParty.name[0]}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900">{selectedParty.name}</h3>
                <p className="text-gray-500 font-medium">{selectedParty.phone || 'No phone provided'}</p>
                <div className="flex gap-2 mt-2 justify-center md:justify-start">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">{selectedParty.type}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded uppercase">{selectedParty.subType}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center md:text-right min-w-[200px]">
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Current Balance</p>
                 <p className={`text-3xl font-black ${selectedParty.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    PKR {Math.abs(selectedParty.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </p>
                 <p className="text-[10px] uppercase font-bold text-gray-400">{selectedParty.balance > 0 ? 'Total Receivable' : selectedParty.balance < 0 ? 'Total Payable' : 'Clear'}</p>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 no-print">
               <h4 className="font-bold text-gray-800">Transaction History</h4>
               <button 
                 onClick={handlePrintStatement}
                 className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 uppercase transition-all flex items-center gap-2"
               >
                 <i className="fas fa-print"></i> Print Statement
               </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3 text-right">Balance</th>
                    <th className="px-6 py-3 text-right no-print">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partyTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{t.id}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">{t.type.replace('_', ' ')}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">PKR {t.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm font-black text-right text-red-600">PKR {t.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right no-print">
                        <button 
                          onClick={() => onViewDetail(t)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <i className="fas fa-magnifying-glass-chart"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {partyTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                         No transactions found for this party.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="print-header mt-12 pt-8 border-t border-dashed border-gray-300">
               <div className="flex justify-between">
                  <div className="text-center">
                     <div className="w-32 border-b border-gray-900 mb-2 mx-auto"></div>
                     <p className="text-xs font-bold">Authorized Signature</p>
                  </div>
                  <div className="text-center">
                     <div className="w-32 border-b border-gray-900 mb-2 mx-auto"></div>
                     <p className="text-xs font-bold">Customer Signature</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white h-[300px] flex flex-col items-center justify-center rounded-xl border border-gray-200 text-gray-400 gap-4">
            <i className="fas fa-book-open text-6xl opacity-20"></i>
            <p className="font-bold">Select a party to view their ledger history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
