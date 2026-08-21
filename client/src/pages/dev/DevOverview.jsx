import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Bot, CreditCard, CheckCircle2, Activity, Sparkles, Key, Code2 } from 'lucide-react';

export default function DevOverview({ setActiveTab, onRunSim }) {
  const { agents, transactions } = usePolicy();

  const totalDevAgents = agents.length;
  const totalRequestsToday = transactions.length;
  const approvedRequests = transactions.filter((t) => t.decision === 'ALLOWED').length;
  const rejectedRequests = transactions.filter((t) => t.decision === 'BLOCKED').length;
  const approvalRate = totalRequestsToday > 0 ? ((approvedRequests / totalRequestsToday) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6 font-sans text-[#171923]">
      
      {/* DEVELOPER HERO BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] text-[10px] font-bold mb-2 border border-[#DCFCE7]">
            <Code2 className="w-3.5 h-3.5 mr-1" />
            <span>Developer Sentinel Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#171923] tracking-tight">
            Build AI Agents with Financial Guardrails
          </h2>
          <p className="text-xs text-[#667085] mt-1 font-medium max-w-xl">
            Developers request capabilities. Users authorize limits. PaySentinel securely enforces rules on every single API payment trigger.
          </p>
        </div>

        <button
          onClick={onRunSim}
          className="ps-btn-primary flex items-center justify-center space-x-2 text-xs font-bold shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Test Payment Simulation</span>
        </button>
      </div>

      {/* DEVELOPER OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Agents Deployed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7D53F6] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#171923]">{totalDevAgents}</div>
            <p className="text-xs text-[#16A34A] mt-1 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All agents online
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Payment Triggers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#171923]">{totalRequestsToday}</div>
            <p className="text-xs text-[#2563EB] mt-1 font-semibold">
              Live API triggers evaluated
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">Approval Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#171923]">{approvalRate}%</div>
            <p className="text-xs text-[#667085] mt-1 font-medium">
              {approvedRequests} Approved / {rejectedRequests} Blocked
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E8F0] shadow-2xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">API Key Status</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#7D53F6] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#16A34A]">Active</div>
            <p className="text-[11px] font-mono text-[#667085] mt-1">
              ps_live_sec_884...
            </p>
          </div>
        </div>

      </div>

      {/* DEVELOPER AGENTS LIST WITH CLEAR AUTHORITY DISTINCTION */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#E6E8F0] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#171923]">Developer Agent Registry</h3>
            <p className="text-xs text-[#667085] mt-0.5">Registered agent applications built by your organization</p>
          </div>

          <button
            onClick={() => setActiveTab('my-agents')}
            className="ps-btn-primary text-xs py-2 px-4 font-bold cursor-pointer"
          >
            + Create New Agent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((ag) => (
            <div key={ag.id} className="p-4 rounded-xl border border-[#E6E8F0] bg-[#F7F8FC] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-[#171923] text-sm">{ag.name}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                  ● {ag.status}
                </span>
              </div>
              <p className="text-xs text-[#667085] font-medium">Developer Entity: {ag.developer}</p>
              
              {/* CLEAR PERMISSION DISTINCTION */}
              <div className="pt-2 border-t border-[#E6E8F0] grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-amber-50 border border-[#FEF3C7] text-[#D97706]">
                  <span className="font-bold block uppercase text-[9px] text-[#D97706]">Dev Capability</span>
                  <span className="font-extrabold block text-xs mt-0.5">₹10,000</span>
                </div>

                <div className="p-2 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#7D53F6]">
                  <span className="font-bold block uppercase text-[9px] text-[#7D53F6]">User Authorized</span>
                  <span className="font-extrabold block text-xs mt-0.5">₹{ag.userTxnLimit?.toLocaleString()}</span>
                </div>

                <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A]">
                  <span className="font-bold block uppercase text-[9px] text-[#16A34A]">Effective Cap</span>
                  <span className="font-extrabold block text-xs mt-0.5">₹{Math.min(10000, ag.userTxnLimit)?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
