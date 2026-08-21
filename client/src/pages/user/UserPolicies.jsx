import React, { useState } from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Sliders, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserPolicies() {
  const { agents, updateAgentPolicy } = usePolicy();

  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || 1);
  const [txnLimit, setTxnLimit] = useState('3000');
  const [dailyLimit, setDailyLimit] = useState('7000');
  const [approvalThreshold, setApprovalThreshold] = useState('2000');
  const [unknownMerchantAction, setUnknownMerchantAction] = useState('ask_approval');

  const [categories, setCategories] = useState({
    Electronics: true,
    Groceries: true,
    Travel: true,
    SaaS: true,
    Gambling: false,
    Adult: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentAgent = agents.find((a) => a.id === parseInt(selectedAgentId)) || agents[0];

  const handleSave = (e) => {
    e.preventDefault();
    updateAgentPolicy(selectedAgentId, {
      userTxnLimit: parseFloat(txnLimit),
      userDailyLimit: parseFloat(dailyLimit),
      approvalThreshold: parseFloat(approvalThreshold),
      unknownMerchantPolicy: unknownMerchantAction,
      allowedCategories: Object.keys(categories).filter((k) => categories[k]),
      blockedCategories: Object.keys(categories).filter((k) => !categories[k]),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6 font-sans text-[#171923]">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#171923] flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#7D53F6]" />
            <span>Security & Financial Policy Configuration</span>
          </h2>
          <p className="text-xs text-[#667085] mt-1 font-medium">
            Define exact spending caps, daily allowances, approval thresholds, and allowed category rules.
          </p>
        </div>

        {savedSuccess && (
          <span className="badge-allowed px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#16A34A]" /> Policy Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* AGENT SELECTION CARD */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4">
          <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider">
            Select Agent To Configure Policy
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="ps-input text-xs font-bold text-[#171923]"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                🤖 {a.name} (Dev Cap: ₹10,000 | Current Authorized: ₹{a.userTxnLimit})
              </option>
            ))}
          </select>
        </div>

        {/* FINANCIAL CONTROLS SECTION */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-6">
          <div className="border-b border-[#E6E8F0] pb-3">
            <h3 className="text-base font-extrabold text-[#171923]">Financial Spending Caps</h3>
            <p className="text-xs text-[#667085] mt-0.5 font-medium">
              Configure strict hard limits enforced by PaySentinel Agent Shield on the backend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Max Transaction */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                Maximum Transaction Cap (₹)
              </label>
              <input
                type="number"
                value={txnLimit}
                onChange={(e) => setTxnLimit(e.target.value)}
                className="ps-input font-bold"
                required
              />
              <p className="text-[11px] text-[#667085] mt-1">
                Maximum amount the agent can spend in a single transaction without exceeding your authorization.
              </p>
            </div>

            {/* Daily Limit */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                Daily Spending Limit (₹)
              </label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="ps-input font-bold"
                required
              />
              <p className="text-[11px] text-[#667085] mt-1">
                Total daily allowance for this agent across all purchase transactions.
              </p>
            </div>

            {/* Approval Threshold */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                Automatic Approval Threshold (₹)
              </label>
              <input
                type="number"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(e.target.value)}
                className="ps-input font-bold text-[#D97706]"
                required
              />
              <p className="text-[11px] text-[#667085] mt-1">
                Transactions above this amount require your explicit human approval.
              </p>
            </div>
          </div>
        </div>

        {/* CATEGORY PERMISSIONS SECTION */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4">
          <div className="border-b border-[#E6E8F0] pb-3">
            <h3 className="text-base font-extrabold text-[#171923]">Category Permissions</h3>
            <p className="text-xs text-[#667085] mt-0.5 font-medium">
              Enable or block specific merchant purchase categories for this agent.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(categories).map((cat) => (
              <label
                key={cat}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  categories[cat]
                    ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#16A34A] font-bold'
                    : 'bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626] font-bold'
                }`}
              >
                <span className="text-xs">{cat}</span>
                <input
                  type="checkbox"
                  checked={categories[cat]}
                  onChange={(e) =>
                    setCategories({ ...categories, [cat]: e.target.checked })
                  }
                  className="rounded text-[#7D53F6] focus:ring-[#7D53F6]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* MERCHANT RULES SECTION */}
        <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-4">
          <div className="border-b border-[#E6E8F0] pb-3">
            <h3 className="text-base font-extrabold text-[#171923]">Merchant Rules & Unknown Action</h3>
            <p className="text-xs text-[#667085] mt-0.5 font-medium">
              Define default security action when an agent attempts a transaction at an unknown merchant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
              <span className="text-xs font-bold text-[#171923] block mb-1">Whitelisted Merchants</span>
              <p className="text-xs text-[#667085]">Amazon, Flipkart, Swiggy, Zomato, MakeMyTrip</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                Unknown Merchant Default Security Action
              </label>
              <select
                value={unknownMerchantAction}
                onChange={(e) => setUnknownMerchantAction(e.target.value)}
                className="ps-input text-xs font-bold"
              >
                <option value="ask_approval">⚠ Require Human Approval</option>
                <option value="block">✕ Automatically Block Request</option>
              </select>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="ps-btn-primary flex items-center space-x-2 text-sm px-6 py-3 font-bold"
          >
            <Save className="w-4 h-4" />
            <span>Save Financial Security Policy</span>
          </button>
        </div>

      </form>

    </div>
  );
}
