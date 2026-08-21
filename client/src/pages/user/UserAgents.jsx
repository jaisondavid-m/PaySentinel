import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Bot, Shield, Pause, Play, Trash2, CheckCircle2, Lock, Tag, Clock, Sliders } from 'lucide-react';

export default function UserAgents({ setActiveTab }) {
  const { agents, toggleAgentStatus } = usePolicy();

  return (
    <div className="space-y-6 font-sans">
      
      {/* PROMINENT SECURITY MESSAGE */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start space-x-3 text-indigo-900">
        <Shield className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-indigo-950">User Authorization Control Active</h4>
          <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed font-medium">
            "Agents can only spend within the permissions you authorize." Developers cannot override these limits.
          </p>
        </div>
      </div>

      {/* AGENTS LIST */}
      <div className="space-y-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-slate-900">{agent.name}</h3>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        agent.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {agent.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {agent.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Developed by <span className="font-semibold text-slate-700">{agent.developer}</span> • Last activity: {agent.lastActivity}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('policies-limits')}
                  className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>View Permissions</span>
                </button>

                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    agent.status === 'active'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => alert(`Revoked agent ${agent.name}`)}
                  className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke</span>
                </button>
              </div>

            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Spent Today</span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                  ₹{agent.spentToday.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Transaction Limit</span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                  ₹{agent.userTxnLimit.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Daily Limit</span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                  ₹{agent.userDailyLimit.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Approval Above</span>
                <span className="text-base font-extrabold text-amber-700 block mt-0.5">
                  ₹{agent.approvalThreshold.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ALLOWED CATEGORIES TAGS */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Allowed Categories:</span>
              <div className="flex flex-wrap gap-1.5">
                {agent.allowedCategories.map((cat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    ✓ {cat}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
