import React, { useState } from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { CreditCard, CheckCircle2, XCircle, AlertTriangle, Search, Filter } from 'lucide-react';

export default function UserTransactions({ onSelectTxn }) {
  const { transactions } = usePolicy();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'ALLOWED' && t.decision === 'ALLOWED') ||
      (filter === 'BLOCKED' && t.decision === 'BLOCKED') ||
      (filter === 'APPROVAL_REQUIRED' && t.decision === 'APPROVAL_REQUIRED');

    const matchesSearch =
      t.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              <span>Transaction Decision Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click any transaction row to inspect the full PaySentinel authorization audit
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search merchant or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="razorpay-input pl-9 text-xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter By:
          </span>

          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>

          <button
            onClick={() => setFilter('ALLOWED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALLOWED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            ✓ Allowed ({transactions.filter((t) => t.decision === 'ALLOWED').length})
          </button>

          <button
            onClick={() => setFilter('BLOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'BLOCKED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            ✕ Blocked ({transactions.filter((t) => t.decision === 'BLOCKED').length})
          </button>

          <button
            onClick={() => setFilter('APPROVAL_REQUIRED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'APPROVAL_REQUIRED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            ⚠ Approval Required ({transactions.filter((t) => t.decision === 'APPROVAL_REQUIRED').length})
          </button>
        </div>
      </div>

      {/* TABLE LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Agent Name</th>
                <th className="py-3.5 px-4">Merchant Target</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Decision</th>
                <th className="py-3.5 px-4">Reason / Enforced Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTxn(t)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {t.time}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.agentName}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{t.merchant}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm whitespace-nowrap">
                      ₹{t.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.decision === 'ALLOWED' && (
                        <span className="badge-allowed px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> ✓ ALLOWED
                        </span>
                      )}
                      {t.decision === 'BLOCKED' && (
                        <span className="badge-blocked px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                          <XCircle className="w-3 h-3 mr-1 text-rose-600" /> ✕ BLOCKED
                        </span>
                      )}
                      {t.decision === 'APPROVAL_REQUIRED' && (
                        <span className="badge-approval px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> ⚠ APPROVAL REQUIRED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">
                      {t.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
