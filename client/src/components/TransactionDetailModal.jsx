import React from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Lock, Bot, Store, Tag, Clock } from 'lucide-react';

export default function TransactionDetailModal({ txn, onClose }) {
  if (!txn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Transaction Authorization Audit</h3>
              <p className="text-xs text-slate-500 font-mono">ID: {txn.id} • {txn.time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DECISION SUMMARY BANNER */}
        <div className="mb-6 p-4 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              FINAL SECURITY DECISION
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              ₹{txn.amount?.toLocaleString()} <span className="text-xs font-normal text-slate-500">INR</span>
            </div>
          </div>

          <div>
            {txn.decision === 'ALLOWED' && (
              <span className="badge-allowed px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> ✓ ALLOWED
              </span>
            )}
            {txn.decision === 'BLOCKED' && (
              <span className="badge-blocked px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                <XCircle className="w-4 h-4 mr-1.5 text-rose-600" /> ✕ BLOCKED
              </span>
            )}
            {txn.decision === 'APPROVAL_REQUIRED' && (
              <span className="badge-approval px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" /> ⚠ APPROVAL REQUIRED
              </span>
            )}
          </div>
        </div>

        {/* EXPLAINABLE DECISION REASON BOX */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 space-y-1">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
            💡 WHY PAYSENTINEL MADE THIS DECISION
          </span>
          <p className="text-xs font-medium leading-relaxed">
            {txn.reason}
          </p>
          <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-indigo-600 font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Policy Enforced: {txn.policyEnforced || 'User Controlled Limit Rule'}</span>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="space-y-4 text-xs text-slate-700">
          
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 font-medium block flex items-center space-x-1">
                <Bot className="w-3.5 h-3.5" /> <span>Acting Agent</span>
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">{txn.agentName}</span>
              <span className="text-[10px] text-slate-500">Dev: {txn.developer || 'Registered Developer'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block flex items-center space-x-1">
                <Store className="w-3.5 h-3.5" /> <span>Target Merchant</span>
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">{txn.merchant}</span>
              <span className="text-[10px] text-slate-500">Category: {txn.category}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div>
              <span className="text-slate-400 font-medium block">Requested Agent Action</span>
              <span className="text-slate-800 font-medium block mt-0.5">{txn.requestedAction || 'Auto-payment trigger'}</span>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium block">Risk Signals & Telemetry</span>
              <span className="text-slate-600 font-mono text-[11px] block mt-0.5">
                {txn.riskSignals || 'Verified HMAC • Standard Risk Profile'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer info label */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>User-controlled policy enforced</span>
          <span>PaySentinel Decision Engine v1.0</span>
        </div>

      </div>
    </div>
  );
}
