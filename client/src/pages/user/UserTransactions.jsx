import React, { useState } from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { CreditCard, CheckCircle2, XCircle, AlertTriangle, Search, Filter, ArrowRight } from 'lucide-react';

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
      (t.agentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.merchant || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-[#171923]">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#171923] flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#7D53F6]" />
              <span>Transaction Decision Ledger</span>
            </h2>
            <p className="text-xs text-[#667085] mt-1 font-medium">
              Click any transaction row to inspect the full PaySentinel authorization audit
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search merchant or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-input pl-9 text-xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E8F0]">
          <span className="text-xs font-bold text-[#667085] mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter By:
          </span>

          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#7D53F6] text-white shadow-xs'
                : 'bg-[#F7F8FC] text-[#667085] hover:bg-[#E6E8F0] border border-[#E6E8F0]'
            }`}
          >
            All ({transactions.length})
          </button>

          <button
            onClick={() => setFilter('ALLOWED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'ALLOWED'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
            }`}
          >
            ✓ Allowed ({transactions.filter((t) => t.decision === 'ALLOWED').length})
          </button>

          <button
            onClick={() => setFilter('BLOCKED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'BLOCKED'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]'
            }`}
          >
            ✕ Blocked ({transactions.filter((t) => t.decision === 'BLOCKED').length})
          </button>

          <button
            onClick={() => setFilter('APPROVAL_REQUIRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'APPROVAL_REQUIRED'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]'
            }`}
          >
            ⚠ Approval Required ({transactions.filter((t) => t.decision === 'APPROVAL_REQUIRED').length})
          </button>
        </div>
      </div>

      {/* TABLE LEDGER */}
      <div className="bg-white rounded-2xl border border-[#E6E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#667085]">
            <thead className="bg-[#F7F8FC] text-[#171923] font-bold uppercase text-[10px] tracking-wider border-b border-[#E6E8F0]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Merchant Target</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Security Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0] font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#667085]">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTxn(t)}
                    className="hover:bg-[#F7F8FC] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono text-[#667085] whitespace-nowrap">
                      {t.time}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#171923]">{t.agentName}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#171923]">{t.merchant}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#171923] whitespace-nowrap">
                      ₹{t.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#F7F8FC] text-[#667085] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E6E8F0]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.decision === 'ALLOWED' && (
                        <span className="badge-allowed px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-[#16A34A]" /> ✓ ALLOWED
                        </span>
                      )}
                      {t.decision === 'BLOCKED' && (
                        <span className="badge-blocked px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                          <XCircle className="w-3 h-3 mr-1 text-[#DC2626]" /> ✕ BLOCKED
                        </span>
                      )}
                      {t.decision === 'APPROVAL_REQUIRED' && (
                        <span className="badge-approval px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-[#D97706]" /> ⚠ APPROVAL REQUIRED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#667085] truncate max-w-xs">
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
