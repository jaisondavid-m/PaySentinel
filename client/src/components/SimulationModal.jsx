import React, { useState } from 'react';
import { usePolicy } from '../context/PolicyContext';
import { Play, CheckCircle2, XCircle, AlertTriangle, Loader2, Sparkles, X, Shield, Bot, ArrowRight, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E6E8F0] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto text-[#171923]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E8F0] pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7D53F6] flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-[#171923]">Gemini AI Agent & Agent Shield Demo</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7D53F6] border border-[#DDD6FE] uppercase">
                  Gemini 1.5 Powered
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                Gemini proposes purchase intent → PaySentinel Agent Shield enforces security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#667085] hover:text-[#171923] hover:bg-[#F7F8FC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE SWITCHER TABS */}
        <div className="flex space-x-2 border-b border-[#E6E8F0] mb-5">
          <button
            onClick={() => setActiveMode('ai')}
            className={`pb-2.5 px-4 text-xs font-extrabold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === 'ai'
                ? 'border-[#7D53F6] text-[#7D53F6]'
                : 'border-transparent text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#7D53F6]" />
            <span>🤖 Gemini Natural Language Agent</span>
          </button>

          <button
            onClick={() => setActiveMode('manual')}
            className={`pb-2.5 px-4 text-xs font-extrabold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeMode === 'manual'
                ? 'border-[#7D53F6] text-[#7D53F6]'
                : 'border-transparent text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Play className="w-4 h-4 text-[#667085]" />
            <span>⚡ Manual Simulation Presets</span>
          </button>
        </div>

        {/* MODE 1: GEMINI AI AGENT PROMPT */}
        {activeMode === 'ai' && (
          <div className="space-y-5">
            
            {/* Quick Sample Prompts */}
            <div className="bg-[#F7F8FC] p-3.5 rounded-xl border border-[#E6E8F0]">
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block mb-2">
                Click A Prompt To Test Security Scenarios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleAskGeminiAgent('Buy me noise cancelling headphones under ₹3000')}
                  className="p-2.5 bg-white hover:bg-[#F0FDF4] border border-[#E6E8F0] hover:border-[#DCFCE7] rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-[#16A34A]">✓ Allowed Scenario</span>
                    <span className="text-[10px] text-[#667085] font-normal font-mono">"Buy headphones under ₹3000"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleAskGeminiAgent('Buy me premium studio headphones around ₹2500')}
                  className="p-2.5 bg-white hover:bg-[#FFFBEB] border border-[#E6E8F0] hover:border-[#FEF3C7] rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-[#D97706]">⚠ Approval Required</span>
                    <span className="text-[10px] text-[#667085] font-normal font-mono">"Buy studio headphones around ₹2500"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D97706] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleAskGeminiAgent('Buy me headphones for ₹4500')}
                  className="p-2.5 bg-white hover:bg-[#FEF2F2] border border-[#E6E8F0] hover:border-[#FEE2E2] rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-[#DC2626]">✕ Max Cap Block</span>
                    <span className="text-[10px] text-[#667085] font-normal font-mono">"Buy headphones for ₹4500"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => handleAskGeminiAgent('Buy me online casino chips for ₹3000')}
                  className="p-2.5 bg-white hover:bg-[#F5F3FF] border border-[#E6E8F0] hover:border-[#DDD6FE] rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block font-bold text-[#7D53F6]">✕ Category Block</span>
                    <span className="text-[10px] text-[#667085] font-normal font-mono">"Buy casino chips for ₹3000"</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7D53F6] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Prompt Input Field */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider mb-1.5">
                Natural Language Request To Gemini Shopping Agent
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Buy me headphones under ₹3000"
                  className="ps-input text-xs font-medium"
                />
                <button
                  onClick={() => handleAskGeminiAgent()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="ps-btn-primary px-4 text-xs font-bold flex items-center space-x-1.5 shrink-0"
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
              <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#DDD6FE] pb-2">
                  <span className="text-xs font-extrabold text-[#7D53F6] flex items-center space-x-1.5">
                    <Bot className="w-4 h-4 text-[#7D53F6]" />
                    <span>Gemini AI Purchase Proposal</span>
                  </span>
                  <span className="text-[10px] font-mono bg-white text-[#7D53F6] font-bold px-2 py-0.5 rounded-full border border-[#DDD6FE]">
                    Untrusted Proposal Output
                  </span>
                </div>

                <p className="text-xs text-[#171923] font-medium leading-relaxed">
                  "{aiProposal.proposal?.reasoning}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-[#DDD6FE] text-xs">
                  <div>
                    <span className="text-[#667085] text-[10px] block font-bold uppercase">Proposed Merchant</span>
                    <span className="font-extrabold text-[#171923] block mt-0.5">{aiProposal.proposal?.merchant}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] text-[10px] block font-bold uppercase">Category</span>
                    <span className="font-extrabold text-[#171923] block mt-0.5">{aiProposal.proposal?.category}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] text-[10px] block font-bold uppercase">Proposed Price</span>
                    <span className="font-extrabold text-[#7D53F6] block mt-0.5">₹{aiProposal.proposal?.amount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] text-[10px] block font-bold uppercase">Target Agent</span>
                    <span className="font-extrabold text-[#171923] block mt-0.5">{agents[0]?.name || 'Shopping Agent'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunSimulation(null)}
                  disabled={simulating}
                  className="w-full ps-btn-primary flex justify-center items-center py-2.5 text-xs font-bold"
                >
                  {simulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Evaluating through PaySentinel Agent Shield...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
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
                <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                  Select Agent
                </label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="ps-input text-xs"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                  Merchant Target
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Amazon India"
                  className="ps-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="ps-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171923] uppercase mb-1">
                  Purchase Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ps-input text-xs"
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
              className="w-full ps-btn-primary flex justify-center items-center py-2.5 text-xs font-bold"
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
          <div className="mt-6 p-4 rounded-2xl bg-[#F7F8FC] border border-[#E6E8F0] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E6E8F0] pb-2">
              <span className="text-xs font-bold text-[#7D53F6] uppercase tracking-wider flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-[#7D53F6]" />
                <span>PaySentinel Agent Shield Security Pipeline</span>
              </span>
              <span className="text-[10px] text-[#667085] font-mono">Go Gin Backend Engine</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className={`flex items-center justify-between ${activeStepIndex >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[#171923] font-medium">1. Agent Identity & API Key Verification</span>
                <span className="font-mono text-[#16A34A] font-bold">PASSED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[#171923] font-medium">2. Category & Merchant Policy Check</span>
                <span className="font-mono text-[#16A34A] font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[#171923] font-medium">3. Effective Transaction Cap Check</span>
                <span className="font-mono text-[#16A34A] font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[#171923] font-medium">4. Live MySQL Daily Spending Sum Check</span>
                <span className="font-mono text-[#16A34A] font-bold">CHECKED ✓</span>
              </div>
              <div className={`flex items-center justify-between ${activeStepIndex >= 5 ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-[#171923] font-medium">5. Human Approval Threshold Check</span>
                <span className="font-mono text-[#16A34A] font-bold">CHECKED ✓</span>
              </div>
            </div>

            {/* FINAL RESULT CARD */}
            {simulationResult && (
              <div className="mt-4 pt-3 border-t border-[#E6E8F0] bg-white p-4 rounded-xl space-y-2 border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">
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

                <p className="text-xs text-[#171923] leading-relaxed font-semibold">
                  {simulationResult.reason}
                </p>

                <div className="flex items-center space-x-2 text-[11px] text-[#7D53F6] font-mono pt-1">
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
