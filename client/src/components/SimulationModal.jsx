import React, { useState } from 'react';
import { usePolicy } from '../context/PolicyContext';
import { Play, CheckCircle2, XCircle, AlertTriangle, Loader2, Sparkles, X, Shield } from 'lucide-react';

export default function SimulationModal({ isOpen, onClose }) {
  const { agents, evaluatePayment } = usePolicy();

  const [agentId, setAgentId] = useState(agents[0]?.id || 1);
  const [merchant, setMerchant] = useState('Amazon India');
  const [amount, setAmount] = useState('1299');
  const [category, setCategory] = useState('Electronics');

  const [simulating, setSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [simulationResult, setSimulationResult] = useState(null);

  if (!isOpen) return null;

  const handleRunSimulation = async (presetReq) => {
    const targetAgentId = presetReq ? presetReq.agentId : agentId;
    const targetMerchant = presetReq ? presetReq.merchant : merchant;
    const targetAmount = presetReq ? presetReq.amount : amount;
    const targetCategory = presetReq ? presetReq.category : category;

    if (presetReq) {
      setAgentId(presetReq.agentId);
      setMerchant(presetReq.merchant);
      setAmount(presetReq.amount);
      setCategory(presetReq.category);
    }

    setSimulating(true);
    setSimulationResult(null);
    setActiveStepIndex(0);

    // Step-by-step pipeline animation
    setTimeout(() => setActiveStepIndex(1), 300);
    setTimeout(() => setActiveStepIndex(2), 600);
    setTimeout(() => setActiveStepIndex(3), 900);
    setTimeout(() => setActiveStepIndex(4), 1200);

    try {
      const res = await evaluatePayment({
        agentId: targetAgentId,
        merchant: targetMerchant,
        amount: targetAmount,
        category: targetCategory,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
      setActiveStepIndex(5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Simulate Agent Payment</h3>
              <p className="text-xs text-slate-500">Test how PaySentinel evaluates AI agent payment triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            ⚡ Quick Test Presets (Instant Demo Scenarios)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() =>
                handleRunSimulation({
                  agentId: agents[0]?.id || 1,
                  merchant: 'Amazon India',
                  amount: '1299',
                  category: 'Electronics',
                })
              }
              className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">✓ Allowed</span>
              <span className="text-[10px] opacity-80">₹1,299 Electronics</span>
            </button>

            <button
              onClick={() =>
                handleRunSimulation({
                  agentId: agents[0]?.id || 1,
                  merchant: 'Amazon India',
                  amount: '2500',
                  category: 'Electronics',
                })
              }
              className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">⚠ Needs Approval</span>
              <span className="text-[10px] opacity-80">₹2,500 Threshold</span>
            </button>

            <button
              onClick={() =>
                handleRunSimulation({
                  agentId: agents[0]?.id || 1,
                  merchant: 'Global Merchant',
                  amount: '4500',
                  category: 'Electronics',
                })
              }
              className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">✕ Limit Block</span>
              <span className="text-[10px] opacity-80">₹4,500 Exceeds Cap</span>
            </button>

            <button
              onClick={() =>
                handleRunSimulation({
                  agentId: agents[0]?.id || 1,
                  merchant: 'Casino Online',
                  amount: '3000',
                  category: 'Gambling',
                })
              }
              className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer"
            >
              <span className="block font-bold">✕ Category Block</span>
              <span className="text-[10px] opacity-80">Gambling Category</span>
            </button>
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Agent
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="razorpay-input text-xs"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Amazon India"
              className="razorpay-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              className="razorpay-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Purchase Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="razorpay-input text-xs"
            >
              <option value="Electronics">Electronics</option>
              <option value="Groceries">Groceries</option>
              <option value="Travel">Travel</option>
              <option value="SaaS">SaaS & Hosting</option>
              <option value="Gambling">Gambling (Blocked)</option>
              <option value="Gift Cards">Gift Cards (Blocked)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleRunSimulation(null)}
          disabled={simulating}
          className="w-full razorpay-btn-primary flex justify-center items-center py-2.5 text-xs font-bold mb-6 cursor-pointer"
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Evaluating PaySentinel Security Policy...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              <span>Evaluate Payment Request</span>
            </>
          )}
        </button>

        {/* PIPELINE EVALUATION ANIMATION */}
        {activeStepIndex >= 0 && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Shield className="w-4 h-4" />
                <span>PaySentinel Policy Evaluation Pipeline</span>
              </span>
              <span className="text-[10px] text-slate-400">Live Backend Engine</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className={`flex items-center justify-between ${activeStepIndex >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <span>1. Agent Verification</span>
                <span className="font-mono text-emerald-400 font-bold">PASSED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <span>2. Category Policy Check</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <span>3. Transaction Cap Check</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                <span>4. Daily Spending Cap</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 5 ? 'opacity-100' : 'opacity-40'}`}>
                <span>5. Human Approval Threshold</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
            </div>

            {/* FINAL RESULT CARD */}
            {simulationResult && (
              <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/80 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">FINAL DECISION RESULT:</span>
                  {simulationResult.decision === 'ALLOWED' && (
                    <span className="badge-allowed px-3 py-1 rounded-full text-xs font-extrabold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ✓ ALLOWED
                    </span>
                  )}
                  {simulationResult.decision === 'BLOCKED' && (
                    <span className="badge-blocked px-3 py-1 rounded-full text-xs font-extrabold flex items-center">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> ✕ BLOCKED
                    </span>
                  )}
                  {simulationResult.decision === 'APPROVAL_REQUIRED' && (
                    <span className="badge-approval px-3 py-1 rounded-full text-xs font-extrabold flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> ⚠ APPROVAL REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium mb-1">
                  {simulationResult.reason}
                </p>
                <p className="text-[11px] text-indigo-400 font-mono">
                  Enforced Policy: {simulationResult.policyEnforced}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
