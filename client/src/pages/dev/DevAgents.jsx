import React, { useState } from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { Bot, Code2, PlusCircle, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function DevAgents() {
  const { agents, createAgent } = usePolicy();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('ShopWise AI Inc.');
  const [requestedTxnLimit, setRequestedTxnLimit] = useState('10000');
  const [requestedDailyLimit, setRequestedDailyLimit] = useState('20000');
  
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (!name) return;

    createAgent({
      name,
      description: description || 'AI payment orchestration agent',
      developer,
      requestedTxnLimit: parseFloat(requestedTxnLimit),
      requestedDailyLimit: parseFloat(requestedDailyLimit),
      allowedCategories: ['Electronics', 'Groceries', 'Software'],
    });

    setName('');
    setDescription('');
    setCreatedSuccess(true);
    setTimeout(() => setCreatedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* SECURITY NOTICE */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3 text-amber-900">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-950">Developer Permission Scoping Principle</h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">
            Developers define <span className="font-bold">Requested Capabilities</span>. PaySentinel guarantees that <span className="font-bold">User Authorized Policies</span> strictly govern all actual payment executions. Developers cannot force higher limits on users.
          </p>
        </div>
      </div>

      {createdSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>New AI Agent registered! User authorized policy defaults applied automatically.</span>
        </div>
      )}

      {/* AGENT CREATION FORM */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>Register New AI Payment Agent</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Specify developer requested capabilities for user authorization</p>
        </div>

        <form onSubmit={handleCreateAgent} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Travel & Flight Booking Agent"
                className="razorpay-input text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Developer Organization
              </label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="e.g. ShopWise AI Inc."
                className="razorpay-input text-xs font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Agent Purpose & Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Automated checkout and price-drop execution for user shopping lists"
              className="razorpay-input text-xs font-medium"
            />
          </div>

          {/* REQUESTED LIMITS VS USER AUTHORIZED DEMO BOX */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
              Developer Requested Capabilities vs User Enforced Limits
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">
                  Developer Requested Single Txn Limit (₹)
                </label>
                <input
                  type="number"
                  value={requestedTxnLimit}
                  onChange={(e) => setRequestedTxnLimit(e.target.value)}
                  className="razorpay-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">
                  Developer Requested Daily Limit (₹)
                </label>
                <input
                  type="number"
                  value={requestedDailyLimit}
                  onChange={(e) => setRequestedDailyLimit(e.target.value)}
                  className="razorpay-input text-xs font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              <span className="font-bold block text-emerald-950">🛡️ PaySentinel Security Model:</span>
              Even if developer requests <span className="font-bold">₹{parseFloat(requestedTxnLimit || 0).toLocaleString()}</span>, user authorized default cap (<span className="font-bold">₹3,000</span>) will strictly govern all live transactions until user manually expands limits.
            </div>
          </div>

          <button
            type="submit"
            className="w-full razorpay-btn-primary py-3 text-xs font-bold cursor-pointer"
          >
            Register Agent & Request User Authorization
          </button>
        </form>
      </div>

      {/* REGISTERED AGENTS LIST WITH COMPARISON */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Permission Comparison Matrix
        </h3>

        <div className="space-y-3">
          {agents.map((ag) => (
            <div key={ag.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{ag.name}</span>
                <span className="text-slate-500">{ag.developer}</span>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="text-[9px] font-bold uppercase block text-amber-700">Requested by Dev</span>
                  <span className="font-bold">₹{ag.requestedTxnLimit?.toLocaleString() || '10,000'}</span>
                </div>

                <span className="text-slate-300 font-bold text-lg">→</span>

                <div className="text-right p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="text-[9px] font-bold uppercase block text-emerald-700">Authorized by User</span>
                  <span className="font-extrabold text-emerald-700">₹{ag.userTxnLimit?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
