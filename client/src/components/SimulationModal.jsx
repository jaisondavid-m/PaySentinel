import React, { useState } from 'react';
import { usePolicy } from '../context/PolicyContext';
import { Play, CheckCircle2, XCircle, AlertTriangle, Loader2, Sparkles, X, Shield, Bot, Send, ArrowRight, Lock } from 'lucide-react';

export default function SimulationModal({ isOpen, onClose }) {
  const { agents, evaluatePayment, generateAIPurchaseProposal } = usePolicy();

  const [activeMode, setActiveMode] = useState('ai'); // 'ai' | 'manual'
  const [aiPrompt, setAiPrompt] = useState('Buy me noise cancelling headphones under ₹3000');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState(null);

  const [agentId, setAgentId] = useState(agents[0]?.id || 1);
  const [merchant, setMerchant] = useState('Amazon India');
  const [amount, setAmount] = useState('1299');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('Noise cancelling headphones');

  const [simulating, setSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [simulationResult, setSimulationResult] = useState(null);

  if (!isOpen) return null;

  // Handle Gemini AI Agent Reasoning Proposal Generation
  const handleAskGeminiAgent = async (customPrompt) => {
    const promptToUse = customPrompt !== undefined ? customPrompt : aiPrompt;
    if (customPrompt !== undefined) setAiPrompt(customPrompt);

    try {
      setAiLoading(true);
      setSimulationResult(null);
      setActiveStepIndex(-1);
      const res = await generateAIPurchaseProposal(promptToUse);
      if (res && res.proposal) {
        setAiProposal(res);
        setMerchant(res.proposal.merchant || 'Amazon');
        setCategory(res.proposal.category || 'Electronics');
        setAmount((res.proposal.amount || 1299).toString());
        setDescription(res.proposal.description || 'AI Agent Purchase Proposal');
      }
    } catch (err) {
      console.error('Error getting AI proposal:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Execute Agent Payment Request through PaySentinel Agent Shield
  const handleRunSimulation = async (presetReq) => {
    const targetAgentId = presetReq ? presetReq.agentId : agentId;
    const targetMerchant = presetReq ? presetReq.merchant : merchant;
    const targetAmount = presetReq ? presetReq.amount : amount;
    const targetCategory = presetReq ? presetReq.category : category;
    const targetDesc = presetReq ? presetReq.description : description;

    if (presetReq) {
      setAgentId(presetReq.agentId);
      setMerchant(presetReq.merchant);
      setAmount(presetReq.amount);
      setCategory(presetReq.category);
      if (presetReq.description) setDescription(presetReq.description);
    }

    setSimulating(true);
    setSimulationResult(null);
    setActiveStepIndex(0);

    // Pipeline step animation
    setTimeout(() => setActiveStepIndex(1), 250);
    setTimeout(() => setActiveStepIndex(2), 500);
    setTimeout(() => setActiveStepIndex(3), 750);
    setTimeout(() => setActiveStepIndex(4), 1000);

    try {
      const res = await evaluatePayment({
        agentId: targetAgentId,
        merchant: targetMerchant,
        amount: targetAmount,
        category: targetCategory,
        description: targetDesc,
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
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-slate-900">Gemini AI Agent & Agent Shield Demo</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                  Gemini 1.5 Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gemini proposes purchase intent → PaySentinel Agent Shield enforces security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE SWITCHER TABS */}
        <div className="flex space-x-2 border-b border-slate-200 mb-5">
          <button
            onClick={() => setActiveMode('ai')}
            className={`pb-2.5 px-4 text-xs font-extrabold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === 'ai'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>🤖 Gemini Natural Language Agent</span>
          </button>

          <button
            onClick={() => setActiveMode('manual')}
            className={`pb-2.5 px-4 text-xs font-extrabold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === 'manual'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Play className="w-4 h-4 text-slate-500" />
            <span>⚡ Manual Simulation Presets</span>
          </button>
        </div>

        {/* MODE 1: GEMINI AI AGENT PROMPT */}
        {activeMode === 'ai' && (
          <div className="space-y-5">
            
            {/* Quick Sample Prompts */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Click A Prompt To Test Security Scenarios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleAskGeminiAgent('Buy me noise cancelling headphones under ₹3000')}
                  className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-emerald-800">✓ Allowed Scenario</span>
                    <span className="text-[10px] text-slate-500 font-normal font-mono">"Buy headphones under ₹3000"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleAskGeminiAgent('Buy me premium studio headphones around ₹2500')}
                  className="p-2.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-amber-800">⚠ Approval Required</span>
                    <span className="text-[10px] text-slate-500 font-normal font-mono">"Buy studio headphones around ₹2500"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleAskGeminiAgent('Buy me headphones for ₹4500')}
                  className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-rose-800">✕ Max Cap Block</span>
                    <span className="text-[10px] text-slate-500 font-normal font-mono">"Buy headphones for ₹4500"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleAskGeminiAgent('Buy me online casino chips for ₹3000')}
                  className="p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-purple-800">✕ Category Block</span>
                    <span className="text-[10px] text-slate-500 font-normal font-mono">"Buy casino chips for ₹3000"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Prompt Input Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Natural Language Request To Gemini Shopping Agent
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Buy me headphones under ₹3000"
                  className="razorpay-input text-xs font-medium"
                />
                <button
                  onClick={() => handleAskGeminiAgent()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ask Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI PROPOSAL CARD */}
            {aiProposal && (
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                  <span className="text-xs font-extrabold text-purple-950 flex items-center space-x-1.5">
                    <Bot className="w-4 h-4 text-purple-700" />
                    <span>Gemini AI Purchase Proposal</span>
                  </span>
                  <span className="text-[10px] font-mono bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    Untrusted Proposal Output
                  </span>
                </div>

                <p className="text-xs text-purple-900 font-medium leading-relaxed">
                  "{aiProposal.proposal?.reasoning}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-purple-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Proposed Merchant</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{aiProposal.proposal?.merchant}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Category</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{aiProposal.proposal?.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Proposed Price</span>
                    <span className="font-extrabold text-indigo-700 block mt-0.5">₹{aiProposal.proposal?.amount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Target Agent</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{agents[0]?.name || 'Shopping Agent'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunSimulation(null)}
                  disabled={simulating}
                  className="w-full razorpay-btn-primary flex justify-center items-center py-2.5 text-xs font-bold cursor-pointer"
                >
                  {simulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Evaluating through PaySentinel Agent Shield...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2 text-emerald-400" />
                      <span>Send Proposal to PaySentinel Agent Shield</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}

        {/* MODE 2: MANUAL PRESETS */}
        {activeMode === 'manual' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                  Merchant Target
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

            <button
              onClick={() => handleRunSimulation(null)}
              disabled={simulating}
              className="w-full razorpay-btn-primary flex justify-center items-center py-2.5 text-xs font-bold cursor-pointer"
            >
              {simulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Evaluating PaySentinel Security Policy...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  <span>Evaluate Manual Payment Request</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AGENT SHIELD LIVE EVALUATION PIPELINE */}
        {activeStepIndex >= 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>PaySentinel Agent Shield Security Pipeline</span>
              </span>
              <span className="text-[10px] text-slate-400">Go Gin Backend Engine</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className={`flex items-center justify-between ${activeStepIndex >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <span>1. Agent Identity & API Key Verification</span>
                <span className="font-mono text-emerald-400 font-bold">PASSED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <span>2. Category & Merchant Policy Check</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <span>3. Effective Transaction Cap Check</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                <span>4. Live MySQL Daily Spending Sum Check</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 5 ? 'opacity-100' : 'opacity-40'}`}>
                <span>5. Human Approval Threshold Check</span>
                <span className="font-mono text-emerald-400 font-bold">CHECKED ✓</span>
              </div>
            </div>

            {/* FINAL RESULT CARD */}
            {simulationResult && (
              <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/90 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    FINAL SECURITY DECISION:
                  </span>
                  {simulationResult.decision === 'ALLOWED' && (
                    <span className="badge-allowed px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ✓ ALLOWED
                    </span>
                  )}
                  {simulationResult.decision === 'BLOCKED' && (
                    <span className="badge-blocked px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> ✕ BLOCKED
                    </span>
                  )}
                  {simulationResult.decision === 'APPROVAL_REQUIRED' && (
                    <span className="badge-approval px-3 py-1 rounded-full text-xs font-extrabold flex items-center shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> ⚠ APPROVAL REQUIRED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {simulationResult.reason}
                </p>

                <div className="flex items-center space-x-2 text-[11px] text-indigo-400 font-mono pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enforced Rule: {simulationResult.policyEnforced}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
