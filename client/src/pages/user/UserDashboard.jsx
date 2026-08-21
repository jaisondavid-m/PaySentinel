import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Sparkles,
  Sliders
} from 'lucide-react';

export default function UserDashboard({ setActiveTab, onSelectTxn, onRunSim }) {
  const { user } = useAuth();
  const {
    agents,
    transactions,
    protectedBalance,
    totalSpentToday,
    pendingApprovalsCount,
    blockedCountToday,
    toggleAgentStatus,
  } = usePolicy();

  const activeAgentsCount = agents.filter(a => a.status === 'active').length;
  const totalEvaluatedCount = transactions.length;
  const approvalRequiredCount = transactions.filter(t => t.decision === 'APPROVAL_REQUIRED').length;

  return (
    <div className="space-y-6 font-sans text-[#171923]">
      
      {/* GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E8F0] shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#171923] tracking-tight">
            Good evening, {user?.name || 'User'}
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
            Your AI payment security at a glance.
          </p>
        </div>

        <button
          onClick={onRunSim}
          className="ps-btn-primary flex items-center justify-center space-x-2 text-xs font-bold shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>⚡ Run Gemini Agent Simulation</span>
        </button>
      </div>

      {/* FOUR ALIGNED METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Active Agents */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Active Agents</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7D53F6] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#171923]">
              {activeAgentsCount || agents.length}
            </div>
            <p className="text-xs text-[#16A34A] mt-1 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Active in portal
            </p>
          </div>
        </div>

        {/* Protected Today */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Protected Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#171923]">
              ₹{totalSpentToday.toLocaleString()}
            </div>
            <p className="text-xs text-[#667085] mt-1 font-medium">
              Spent under policy limits
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setActiveTab('approvals')}
          className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs hover:border-[#7D53F6] transition-all cursor-pointer flex flex-col justify-between h-36"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#D97706]">
              {pendingApprovalsCount}
            </div>
            <p className="text-xs text-[#D97706] mt-1 font-semibold flex items-center">
              <span>Requires attention</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </p>
          </div>
        </div>

        {/* Blocked Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Blocked Requests</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#DC2626]">
              {blockedCountToday}
            </div>
            <p className="text-xs text-[#DC2626] mt-1 font-semibold">
              Protected by Agent Shield
            </p>
          </div>
        </div>

      </div>

      {/* AGENT SHIELD FEATURE CENTERPIECE CARD (Light Mode Only) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E6E8F0] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7D53F6] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#171923]">🛡 Agent Shield Status</h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Your AI agents are operating within your configured financial policies.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] mr-1.5 animate-pulse"></span>
            ● ACTIVE PROTECTION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
            <span className="text-[#667085] font-bold block text-[10px] uppercase">Evaluated Requests</span>
            <span className="text-xl font-extrabold text-[#171923] block mt-1">
              {totalEvaluatedCount || 24} requests
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
            <span className="text-[#667085] font-bold block text-[10px] uppercase">Auto-Blocked Violations</span>
            <span className="text-xl font-extrabold text-[#DC2626] block mt-1">
              {blockedCountToday || 5} blocked
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
            <span className="text-[#667085] font-bold block text-[10px] uppercase">Human Approval Triggers</span>
            <span className="text-xl font-extrabold text-[#D97706] block mt-1">
              {approvalRequiredCount || 3} approval required
            </span>
          </div>
        </div>
      </div>

      {/* RECENT DECISIONS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E6E8F0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E8F0] flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-[#171923]">Recent Security Decisions</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Live authorization audit feed explaining WHY every payment was allowed, blocked, or queued
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-[#7D53F6] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#667085]">
            <thead className="bg-[#F7F8FC] text-[#171923] font-bold uppercase text-[10px] tracking-wider border-b border-[#E6E8F0]">
              <tr>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Merchant Target</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Security Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0] font-medium">
              {transactions.slice(0, 5).map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => onSelectTxn(txn)}
                  className="hover:bg-[#F7F8FC] transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-extrabold text-[#171923]">{txn.agentName}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#171923]">{txn.merchant}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#F7F8FC] text-[#667085] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E6E8F0]">
                      {txn.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#171923] whitespace-nowrap">
                    ₹{txn.amount?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {txn.decision === 'ALLOWED' && (
                      <span className="badge-allowed px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-[#16A34A]" /> ✓ ALLOWED
                      </span>
                    )}
                    {txn.decision === 'BLOCKED' && (
                      <span className="badge-blocked px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                        <XCircle className="w-3 h-3 mr-1 text-[#DC2626]" /> ✕ BLOCKED
                      </span>
                    )}
                    {txn.decision === 'APPROVAL_REQUIRED' && (
                      <span className="badge-approval px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 text-[#D97706]" /> ⚠ APPROVAL REQUIRED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085] truncate max-w-xs">
                    {txn.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
