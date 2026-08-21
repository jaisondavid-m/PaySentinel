import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Bot, CreditCard, CheckCircle2, XCircle, TrendingUp, Activity, Sparkles, Key, Code2 } from 'lucide-react';

export default function DevOverview({ setActiveTab, onRunSim }) {
  const { agents, transactions } = usePolicy();

  const totalDevAgents = agents.length;
  const totalRequestsToday = transactions.length;
  const approvedRequests = transactions.filter((t) => t.decision === 'ALLOWED').length;
  const rejectedRequests = transactions.filter((t) => t.decision === 'BLOCKED').length;
  const approvalRate = totalRequestsToday > 0 ? ((approvedRequests / totalRequestsToday) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-8 font-sans">
      
      {/* DEVELOPER HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Code2 className="w-4 h-4 mr-1.5 text-emerald-400" />
            <span>Developer Sentinel Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Build AI Agents with Financial Guardrails
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Developers request capabilities. Users authorize limits. PaySentinel securely enforces rules on every single API payment trigger.
          </p>
        </div>

        <button
          onClick={onRunSim}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Test Payment Simulation</span>
        </button>
      </div>

      {/* DEVELOPER OVERVIEW METRICS */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          DEVELOPER PLATFORM TELEMETRY
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deployed Agents</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalDevAgents}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All agents online
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Requests Today</span>
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalRequestsToday}</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Live API triggers
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Rate</span>
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{approvalRate}%</div>
            <p className="text-xs text-purple-700 mt-1 font-medium">
              {approvedRequests} Approved / {rejectedRequests} Blocked
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Keys Status</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">Active</div>
            <p className="text-xs text-slate-500 mt-1 font-mono text-[11px]">
              ps_live_sec_884...
            </p>
          </div>

        </div>
      </div>

      {/* DEVELOPER AGENTS LIST */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Developer Agent Registry</h3>
            <p className="text-xs text-slate-500">Registered agent applications built by your organization</p>
          </div>

          <button
            onClick={() => setActiveTab('my-agents')}
            className="razorpay-btn-primary text-xs py-2 px-3 cursor-pointer"
          >
            + Create New Agent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((ag) => (
            <div key={ag.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">{ag.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {ag.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">Developer Entity: {ag.developer}</p>
              
              {/* CLEAR PERMISSION DISTINCTION */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block uppercase text-[9px] text-amber-700">Developer Requested</span>
                  <span className="font-semibold block">Txn Cap: ₹{ag.requestedTxnLimit?.toLocaleString() || '10,000'}</span>
                </div>

                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold block uppercase text-[9px] text-emerald-700">User Authorized Cap</span>
                  <span className="font-extrabold block">Txn Cap: ₹{ag.userTxnLimit?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
