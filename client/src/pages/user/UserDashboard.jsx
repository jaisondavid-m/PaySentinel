import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import {
  ShieldCheck,
  Bot,
  CreditCard,
  Clock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function UserDashboard({ setActiveTab, onSelectTxn, onRunSim }) {
  const {
    agents,
    transactions,
    protectedBalance,
    totalSpentToday,
    pendingApprovalsCount,
    blockedCountToday,
    toggleAgentStatus,
  } = usePolicy();

  return (
    <div className="space-y-8 font-sans">
      
      {/* SECURITY THESIS HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-400" />
              <span>AI Agent Authorization & Financial Shield</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              My money is protected even when AI agents act on my behalf.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              AI agents can initiate payment requests, but <span className="font-bold text-white">PaySentinel</span> strictly enforces your financial limits and security policies before a single rupee leaves your account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRunSim}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Live Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          FINANCIAL PROTECTION METRICS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Protected Balance */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Protected Balance</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{protectedBalance.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              100% Policy Guarded
            </p>
          </div>

          {/* Agent Spending Today */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent Spending Today</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{totalSpentToday.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ ₹7,000</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Daily User Cap: ₹7,000 max
            </p>
          </div>

          {/* Pending Approvals */}
          <div
            onClick={() => setActiveTab('approvals')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingApprovalsCount}
            </div>
            <p className="text-xs text-amber-700 mt-1 font-medium flex items-center">
              <span>Requires human authorization</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </p>
          </div>

          {/* Blocked Today */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blocked Today</span>
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {blockedCountToday}
            </div>
            <p className="text-xs text-rose-600 mt-1 font-medium">
              Policy breaches auto-prevented
            </p>
          </div>

        </div>
      </div>

      {/* 2. AGENT PROTECTION OVERVIEW */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span>Agent Protection Overview</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active AI agents authorized by you to process automated payments
            </p>
          </div>

          <button
            onClick={() => setActiveTab('my-agents')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Agents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Bot className={`w-4 h-4 ${agent.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{agent.name}</span>
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      agent.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Spent Today:</span>
                    <span className="font-bold text-slate-900">₹{agent.spentToday.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Single Txn Limit:</span>
                    <span className="font-semibold text-slate-800">₹{agent.userTxnLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Spending Limit:</span>
                    <span className="font-semibold text-slate-800">₹{agent.userDailyLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approval Required Above:</span>
                    <span className="font-semibold text-amber-700">₹{agent.approvalThreshold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">Allowed:</span>
                    <span className="font-medium text-emerald-700 truncate max-w-[140px]">
                      {agent.allowedCategories.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('policies-limits')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-center transition-colors cursor-pointer"
                >
                  View Agent
                </button>
                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    agent.status === 'active'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {agent.status === 'active' ? 'Pause Agent' : 'Resume'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RECENT DECISIONS FEED */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Recent PaySentinel Security Decisions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live authorization feed explaining WHY every payment was allowed, blocked, or required approval
            </p>
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>All Decisions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 4).map((txn) => (
            <div
              key={txn.id}
              onClick={() => onSelectTxn(txn)}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {txn.decision === 'ALLOWED' && (
                    <span className="badge-allowed px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> ✓ ALLOWED
                    </span>
                  )}
                  {txn.decision === 'BLOCKED' && (
                    <span className="badge-blocked px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center">
                      <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> ✕ BLOCKED
                    </span>
                  )}
                  {txn.decision === 'APPROVAL_REQUIRED' && (
                    <span className="badge-approval px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> ⚠ APPROVAL REQUIRED
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{txn.agentName}</span>
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="font-semibold text-slate-800 text-sm">{txn.merchant}</span>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {txn.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    <span className="font-semibold text-slate-900">Why:</span> {txn.reason}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-extrabold text-slate-900">₹{txn.amount?.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">{txn.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
