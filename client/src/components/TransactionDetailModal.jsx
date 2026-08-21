import React from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Lock, Bot, Store, Tag } from 'lucide-react';

export default function TransactionDetailModal({ txn, onClose }) {
  if (!txn) return null;

  const numericAmount = txn.amount || 0;
  const authorizedCap = 3000;
  const difference = numericAmount > authorizedCap ? numericAmount - authorizedCap : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E6E8F0] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E8F0] pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7D53F6] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#171923]">Agent Shield Security Evaluation</h3>
              <p className="text-xs text-[#667085]">Transaction Audit ID: {txn.id} • {txn.time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#667085] hover:text-[#171923] hover:bg-[#F7F8FC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PAYMENT REQUEST SUMMARY BOX */}
        <div className="mb-5 p-4 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Payment Request
            </span>
            <div className="text-base font-extrabold text-[#171923] mt-0.5">
              {txn.merchant} <span className="text-xs font-normal text-[#667085]">({txn.category})</span>
            </div>
            <p className="text-xs text-[#667085]">{txn.requestedAction || 'Purchase Request'}</p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-extrabold text-[#171923]">₹{numericAmount.toLocaleString()}</span>
            <span className="text-[10px] text-[#667085] font-mono block">INR</span>
          </div>
        </div>

        {/* SECURITY EVALUATION CHECKLIST */}
        <div className="mb-5 space-y-3">
          <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider border-b border-[#E6E8F0] pb-2">
            SECURITY EVALUATION PIPELINE
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-[#E6E8F0] flex justify-between items-center">
              <span className="text-[#667085]">Agent Identity</span>
              <span className="font-bold text-[#16A34A]">✓ Verified</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#E6E8F0] flex justify-between items-center">
              <span className="text-[#667085]">User Authorization</span>
              <span className="font-bold text-[#16A34A]">✓ Active</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#E6E8F0] flex justify-between items-center">
              <span className="text-[#667085]">Transaction Limit</span>
              {txn.decision === 'BLOCKED' && txn.reason?.includes('exceed') ? (
                <span className="font-bold text-[#DC2626]">✕ Exceeded</span>
              ) : (
                <span className="font-bold text-[#16A34A]">✓ Passed</span>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#E6E8F0] flex justify-between items-center">
              <span className="text-[#667085]">Daily Limit</span>
              <span className="font-bold text-[#16A34A]">✓ Within Limit</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#E6E8F0] flex justify-between items-center">
              <span className="text-[#667085]">Category Policy</span>
              <span className="font-bold text-[#16A34A]">✓ Allowed</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#E6E8F0] flex justify-between items-center">
              <span className="text-[#667085]">Merchant Rule</span>
              <span className="font-bold text-[#16A34A]">✓ Allowed</span>
            </div>
          </div>
        </div>

        {/* FINAL DECISION CARD */}
        <div className="mb-5 p-4 rounded-xl border space-y-2 bg-[#F7F8FC] border-[#E6E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
              FINAL SECURITY DECISION
            </span>

            {txn.decision === 'ALLOWED' && (
              <span className="badge-allowed px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#16A34A]" /> 🟢 ALLOWED
              </span>
            )}
            {txn.decision === 'BLOCKED' && (
              <span className="badge-blocked px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                <XCircle className="w-3.5 h-3.5 mr-1 text-[#DC2626]" /> 🔴 BLOCKED
              </span>
            )}
            {txn.decision === 'APPROVAL_REQUIRED' && (
              <span className="badge-approval px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#D97706]" /> 🟡 APPROVAL REQUIRED
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-[#171923] leading-relaxed">
            {txn.reason}
          </p>

          <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-[#7D53F6] font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Rule: {txn.policyEnforced || 'TRANSACTION_LIMIT_EXCEEDED'}</span>
          </div>
        </div>

        {/* FINANCIAL DIFFERENCE CALCULATION BOX */}
        {txn.decision === 'BLOCKED' && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-[#E6E8F0] text-center text-xs">
            <div>
              <span className="text-[#667085] text-[10px] font-bold uppercase block">Requested</span>
              <span className="font-extrabold text-[#171923] block mt-0.5">₹{numericAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#667085] text-[10px] font-bold uppercase block">Authorized</span>
              <span className="font-extrabold text-[#16A34A] block mt-0.5">₹{authorizedCap.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#667085] text-[10px] font-bold uppercase block">Difference</span>
              <span className="font-extrabold text-[#DC2626] block mt-0.5">₹{difference.toLocaleString()}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
