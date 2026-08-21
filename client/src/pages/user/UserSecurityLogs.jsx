import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { ShieldCheck, FileText, CheckCircle2, XCircle, ArrowDown, Lock, Bot } from 'lucide-react';

export default function UserSecurityLogs() {
  const { transactions } = usePolicy();

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          <span>Security Audit Trail & Decision Chains</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          PaySentinel acts as a strict authorization firewall between AI agents and your bank account.
        </p>
      </div>

      {/* VISUAL PIPELINE CHAIN DEMONSTRATION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">
              Authorization Architecture
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              PaySentinel Authorization Pipeline Diagram
            </h3>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            Real-Time Policy Enforcement
          </span>
        </div>

        {/* STEP BY STEP DIAGRAM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 text-center">
          
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1</span>
            <span className="text-xs font-bold text-white mt-1">Agent Request</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Payment Trigger</span>
          </div>

          <div className="hidden md:flex justify-center items-center text-indigo-400">
            <span className="text-lg font-bold">→</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Step 2</span>
            <span className="text-xs font-bold text-white mt-1">Identity Check</span>
            <span className="text-[10px] text-emerald-400 mt-0.5">HMAC Verified ✓</span>
          </div>

          <div className="hidden md:flex justify-center items-center text-indigo-400">
            <span className="text-lg font-bold">→</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Step 3</span>
            <span className="text-xs font-bold text-white mt-1">User Policy</span>
            <span className="text-[10px] text-emerald-400 mt-0.5">Category Check ✓</span>
          </div>

          <div className="hidden md:flex justify-center items-center text-indigo-400">
            <span className="text-lg font-bold">→</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-900/80 border border-indigo-700 flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-indigo-300 uppercase">Step 4</span>
            <span className="text-xs font-bold text-white mt-1">Final Decision</span>
            <span className="text-[10px] text-indigo-200 mt-0.5">Enforce & Execute</span>
          </div>

        </div>
      </div>

      {/* AUDIT LOG ENTRIES */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Complete Audit Logs
        </h3>

        <div className="space-y-3">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-slate-500 font-bold">{txn.id} • {txn.timestamp}</span>
                <span className={`font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                  txn.decision === 'ALLOWED' ? 'badge-allowed' : txn.decision === 'BLOCKED' ? 'badge-blocked' : 'badge-approval'
                }`}>
                  {txn.decision}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-slate-800 font-medium">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>{txn.agentName}</span>
                <span>→</span>
                <span>{txn.merchant}</span>
                <span className="font-bold text-slate-900">₹{txn.amount?.toLocaleString()}</span>
              </div>

              <p className="text-slate-600 bg-white p-2 rounded border border-slate-200/80 font-mono text-[11px]">
                {txn.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
