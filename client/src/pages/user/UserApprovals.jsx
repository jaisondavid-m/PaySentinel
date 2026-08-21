import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { BellRing, ShieldCheck, CheckCircle2, XCircle, Bot, Store, Clock, Tag, AlertTriangle } from 'lucide-react';

export default function UserApprovals() {
  const { approvals, resolveApproval } = usePolicy();

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BellRing className="w-6 h-6 text-amber-600" />
            <span>Human Approval Checkpoint</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            PaySentinel intercepted these payment requests because they exceed your auto-approval threshold.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          {approvals.length} Pending {approvals.length === 1 ? 'Action' : 'Actions'}
        </span>
      </div>

      {/* APPROVAL CARDS QUEUE */}
      {approvals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">All Approvals Cleared</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no pending payment authorization requests. AI agents are operating within your auto-approval thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200/80 shadow-md space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Human Approval Required
              </div>

              {/* Title & Agent info */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    "{app.agentName}" wants to make a payment
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target: <span className="font-semibold text-slate-800">{app.merchant}</span> • Requested at {app.requestedAt}
                  </p>
                </div>
              </div>

              {/* Amount & Item Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Purchasing Item</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{app.itemDescription}</span>
                  <span className="text-[11px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded font-mono inline-block mt-1">
                    Category: {app.category}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Requested Amount</span>
                  <span className="text-2xl font-extrabold text-slate-900">₹{app.amount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Reason & Policy Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900">
                  <span className="font-bold text-[11px] text-blue-700 block uppercase mb-1">
                    💬 Agent Stated Reason
                  </span>
                  <p className="leading-relaxed font-medium">
                    "{app.agentPromptReason}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900">
                  <span className="font-bold text-[11px] text-amber-800 block uppercase mb-1">
                    🛡️ PaySentinel Security Policy
                  </span>
                  <p className="leading-relaxed font-medium">
                    {app.policyContext}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  onClick={() => resolveApproval(app.id, false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Payment</span>
                </button>

                <button
                  onClick={() => resolveApproval(app.id, true)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Once</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
