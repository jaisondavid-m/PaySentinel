import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { BellRing, Check, X, ShieldAlert, Bot, Store, Clock, AlertTriangle } from 'lucide-react';

export default function UserApprovals() {
  const { approvals, resolveApproval } = usePolicy();

  return (
    <div className="max-w-4xl space-y-6 font-sans text-[#171923]">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center font-bold">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#171923]">Pending Approvals</h2>
            <p className="text-xs text-[#667085] mt-0.5 font-medium">
              Review payment requests that require your explicit human authorization.
            </p>
          </div>
        </div>
      </div>

      {/* APPROVAL ITEMS LIST */}
      {approvals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E6E8F0] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#171923]">No Pending Approvals</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            All AI agent transactions are currently operating within your automated policy thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4 hover:border-[#7D53F6] transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8F0] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-[#171923]">{app.agentName}</h3>
                      <span className="badge-approval px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 text-[#D97706]" /> ⚠ APPROVAL REQUIRED
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] mt-0.5 font-medium">
                      Dev: <span className="font-bold text-[#171923]">{app.developer}</span> • Requested at: {app.requestedAt}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-[#171923]">₹{app.amount?.toLocaleString()}</div>
                  <span className="text-[10px] text-[#667085] font-mono">INR</span>
                </div>
              </div>

              {/* REASON & THRESHOLD DETAILS */}
              <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-4 text-xs text-[#D97706] space-y-1">
                <span className="font-extrabold uppercase tracking-wider text-[10px] block">
                  Reason for Human Verification Queue:
                </span>
                <p className="font-semibold text-[#171923] leading-relaxed">
                  {app.policyContext || 'Transaction exceeds automatic approval threshold limit.'}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#D97706]">
                  <span>Requested: ₹{app.amount?.toLocaleString()}</span>
                  <span>Automatic Threshold Limit: ₹2,000.00</span>
                </div>
              </div>

              {/* ACTIONS: [Reject] & [Approve] */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => resolveApproval(app.id, false)}
                  className="px-5 py-2.5 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] hover:bg-red-100 text-[#DC2626] text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject Request
                </button>

                <button
                  onClick={() => resolveApproval(app.id, true)}
                  className="ps-btn-primary px-6 py-2.5 text-xs font-bold flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Payment</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
