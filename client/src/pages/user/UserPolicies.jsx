import React, { useState } from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Sliders, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Save, Bot } from 'lucide-react';

export default function UserPolicies() {
  const { agents, updateAgentPolicy } = usePolicy();
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || 'ag-1');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const [txnLimit, setTxnLimit] = useState(selectedAgent.userTxnLimit);
  const [dailyLimit, setDailyLimit] = useState(selectedAgent.userDailyLimit);
  const [approvalThreshold, setApprovalThreshold] = useState(selectedAgent.approvalThreshold);
  const [unknownPolicy, setUnknownPolicy] = useState(selectedAgent.unknownMerchantPolicy);
  const [suspiciousPolicy, setSuspiciousPolicy] = useState(selectedAgent.suspiciousPolicy);

  const [allowedCategories, setAllowedCategories] = useState(selectedAgent.allowedCategories);
  const [blockedCategories, setBlockedCategories] = useState(selectedAgent.blockedCategories);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle agent selection change
  const handleSelectAgent = (e) => {
    const id = e.target.value;
    setSelectedAgentId(id);
    const ag = agents.find((a) => a.id === id);
    if (ag) {
      setTxnLimit(ag.userTxnLimit);
      setDailyLimit(ag.userDailyLimit);
      setApprovalThreshold(ag.approvalThreshold);
      setUnknownPolicy(ag.unknownMerchantPolicy);
      setSuspiciousPolicy(ag.suspiciousPolicy);
      setAllowedCategories(ag.allowedCategories);
      setBlockedCategories(ag.blockedCategories);
    }
  };

  const handleSavePolicy = () => {
    updateAgentPolicy(selectedAgentId, {
      userTxnLimit: parseFloat(txnLimit),
      userDailyLimit: parseFloat(dailyLimit),
      approvalThreshold: parseFloat(approvalThreshold),
      unknownMerchantPolicy: unknownPolicy,
      suspiciousPolicy: suspiciousPolicy,
      allowedCategories,
      blockedCategories,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const allCategories = ['Electronics', 'Groceries', 'Books', 'Software', 'Travel', 'Flights', 'Hotels', 'Cab Booking', 'Gambling', 'Gift Cards', 'Crypto'];

  const toggleCategory = (cat) => {
    if (allowedCategories.includes(cat)) {
      setAllowedCategories(allowedCategories.filter((c) => c !== cat));
      if (!blockedCategories.includes(cat)) setBlockedCategories([...blockedCategories, cat]);
    } else {
      setAllowedCategories([...allowedCategories, cat]);
      setBlockedCategories(blockedCategories.filter((c) => c !== cat));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* SUMMARY BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Financial Policy Enforcement
          </div>
          <h2 className="text-2xl font-extrabold">Your agent cannot override these policies.</h2>
          <p className="text-xs text-slate-300 mt-1">
            PaySentinel validates every single AI payment trigger against these exact user-configured constraints.
          </p>
        </div>

        <button
          onClick={handleSavePolicy}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Enforced Policy</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Policy rules saved & actively enforced across all agent transactions!</span>
        </div>
      )}

      {/* POLICY EDITOR CONTAINER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        
        {/* Agent Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span>Select Agent to Configure</span>
            </h3>
            <p className="text-xs text-slate-500">Configure financial spending limits and category permissions</p>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedAgentId}
              onChange={handleSelectAgent}
              className="razorpay-input text-xs font-bold"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LIMIT SLIDERS & CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Single Transaction Limit */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Transaction Limit
              </label>
              <span className="text-base font-extrabold text-indigo-700">₹{parseFloat(txnLimit).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={txnLimit}
              onChange={(e) => setTxnLimit(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Single purchase cap for {selectedAgent.name}. Transactions above this are <span className="font-bold text-rose-600">BLOCKED</span>.
            </p>
          </div>

          {/* Daily Spending Limit */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Daily Spending Limit
              </label>
              <span className="text-base font-extrabold text-indigo-700">₹{parseFloat(dailyLimit).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Maximum total spending per 24 hours across all purchases.
            </p>
          </div>

          {/* Approval Required Above */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Approval Required Above
              </label>
              <span className="text-base font-extrabold text-amber-700">₹{parseFloat(approvalThreshold).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={approvalThreshold}
              onChange={(e) => setApprovalThreshold(e.target.value)}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Purchases above this require <span className="font-bold text-amber-700">HUMAN APPROVAL</span> before payment.
            </p>
          </div>

        </div>

        {/* CATEGORY PERMISSIONS */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
            Category Permissions (Toggle to Allow / Block)
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allCategories.map((cat) => {
              const isAllowed = allowedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isAllowed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                      : 'bg-rose-50 border-rose-200 text-rose-800 opacity-90'
                  }`}
                >
                  <span>{cat}</span>
                  {isAllowed ? (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ ALLOWED
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      ✕ BLOCKED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MERCHANT & ANOMALY RULES */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Unknown Merchant Action
            </label>
            <select
              value={unknownPolicy}
              onChange={(e) => setUnknownPolicy(e.target.value)}
              className="razorpay-input text-xs font-medium"
            >
              <option value="ask_approval">Ask for human approval</option>
              <option value="block">Block transaction immediately</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Suspicious Anomaly Action
            </label>
            <select
              value={suspiciousPolicy}
              onChange={(e) => setSuspiciousPolicy(e.target.value)}
              className="razorpay-input text-xs font-medium"
            >
              <option value="block">Block transaction immediately</option>
              <option value="ask_approval">Ask for human approval</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
}
