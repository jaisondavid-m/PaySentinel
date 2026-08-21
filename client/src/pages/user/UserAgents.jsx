import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Bot, Shield, Pause, Play, Trash2, Sliders, CheckCircle2 } from 'lucide-react';

export default function UserAgents({ setActiveTab }) {
  const { agents, toggleAgentStatus } = usePolicy();

  return (
    <div className="space-y-6 font-sans text-[#171923]">
      
      {/* SECURITY BANNER */}
      <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-5 flex items-start space-x-3.5 text-[#7D53F6]">
        <Shield className="w-5 h-5 text-[#7D53F6] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm text-[#171923]">User Authorization Control Active</h4>
          <p className="text-xs text-[#667085] mt-0.5 leading-relaxed font-medium">
            "Agents can only spend within the financial limits you authorize." Developers cannot override or inflate these policies.
          </p>
        </div>
      </div>

      {/* AGENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {agents.map((agent) => {
          const spentPct = agent.userDailyLimit > 0 ? Math.min(100, Math.round((agent.spentToday / agent.userDailyLimit) * 100)) : 0;
          return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4 hover:border-[#7D53F6] transition-all flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#E6E8F0] pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] text-[#7D53F6] flex items-center justify-center font-bold">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-extrabold text-[#171923]">{agent.name}</h3>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            agent.status === 'active' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]' : 'bg-amber-50 text-[#D97706] border border-[#FEF3C7]'
                          }`}
                        >
                          ● {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] mt-0.5 font-medium">
                        Created by <span className="font-bold text-[#171923]">{agent.developer}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Limits Summary */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
                    <span className="text-[#667085] font-bold block text-[10px] uppercase">Transaction Limit</span>
                    <span className="text-base font-extrabold text-[#171923] block mt-0.5">
                      ₹{agent.userTxnLimit.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
                    <span className="text-[#667085] font-bold block text-[10px] uppercase">Daily Limit</span>
                    <span className="text-base font-extrabold text-[#171923] block mt-0.5">
                      ₹{agent.userDailyLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Today's Spending */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#667085]">Today's Spending</span>
                    <span className="text-[#171923] font-bold">
                      ₹{agent.spentToday.toLocaleString()} / ₹{agent.userDailyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#E6E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${spentPct > 80 ? 'bg-[#DC2626]' : 'bg-[#7D53F6]'}`}
                      style={{ width: `${spentPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Allowed Categories Tags */}
                <div className="flex items-center space-x-2 text-xs pt-3 border-t border-[#E6E8F0]">
                  <span className="text-[#667085] font-bold text-[10px] uppercase">Allowed Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.allowedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]"
                      >
                        ✓ {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E6E8F0] flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('policies-limits')}
                  className="flex-1 py-2 rounded-xl bg-[#F7F8FC] hover:bg-[#E6E8F0] text-[#171923] text-xs font-bold border border-[#E6E8F0] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#7D53F6]" />
                  <span>Manage Policy</span>
                </button>

                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    agent.status === 'active'
                      ? 'bg-amber-50 hover:bg-amber-100 text-[#D97706] border-[#FEF3C7]'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border-[#DCFCE7]'
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
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
