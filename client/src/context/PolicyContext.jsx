import React, { createContext, useContext, useState } from 'react';
import { INITIAL_AGENTS, INITIAL_TRANSACTIONS, INITIAL_APPROVALS } from '../data/mockData';

const PolicyContext = createContext(null);

export const PolicyProvider = ({ children }) => {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);

  const [protectedBalance] = useState(25000);
  const [overallDailyCap] = useState(7000);

  // Helper to pause/resume an agent
  const toggleAgentStatus = (agentId) => {
    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === agentId
          ? { ...ag, status: ag.status === 'active' ? 'paused' : 'active' }
          : ag
      )
    );
  };

  // Helper to update agent policies
  const updateAgentPolicy = (agentId, updatedFields) => {
    setAgents((prev) =>
      prev.map((ag) => (ag.id === agentId ? { ...ag, ...updatedFields } : ag))
    );
  };

  // Helper to add a new developer agent
  const createAgent = (newAgent) => {
    const created = {
      id: `ag-${Date.now()}`,
      status: 'active',
      spentToday: 0,
      riskLevel: 'Low Risk',
      userTxnLimit: Math.min(newAgent.requestedTxnLimit || 3000, 3000), // Default safe user limit
      userDailyLimit: Math.min(newAgent.requestedDailyLimit || 7000, 7000),
      approvalThreshold: 2000,
      allowedCategories: newAgent.allowedCategories || ['Electronics', 'Groceries'],
      blockedCategories: ['Gambling', 'Gift Cards', 'Crypto'],
      unknownMerchantPolicy: 'ask_approval',
      suspiciousPolicy: 'block',
      lastActivity: 'Just now',
      ...newAgent,
    };
    setAgents((prev) => [created, ...prev]);
    return created;
  };

  // Core PaySentinel Policy Evaluation Engine
  const evaluatePayment = (req) => {
    const { agentId, merchant, amount, category } = req;
    const numericAmount = parseFloat(amount);
    const agent = agents.find((a) => a.id === agentId) || agents[0];

    const pipelineSteps = [
      { step: 1, title: 'Agent Verification', status: 'pending', detail: '' },
      { step: 2, title: 'Category Policy Check', status: 'pending', detail: '' },
      { step: 3, title: 'Transaction Limit Check', status: 'pending', detail: '' },
      { step: 4, title: 'Daily Spending Cap Check', status: 'pending', detail: '' },
      { step: 5, title: 'Human Approval Threshold Check', status: 'pending', detail: '' },
    ];

    let decision = 'ALLOWED';
    let reason = 'Transaction is within user daily spending limit and single purchase cap.';
    let policyEnforced = `User Single Cap: ₹${agent.userTxnLimit.toLocaleString()} | Daily Cap: ₹${agent.userDailyLimit.toLocaleString()}`;

    // Step 1: Agent status
    if (agent.status !== 'active') {
      pipelineSteps[0] = { step: 1, title: 'Agent Verification', status: 'failed', detail: `Agent ${agent.name} is currently PAUSED by user.` };
      decision = 'BLOCKED';
      reason = `Agent "${agent.name}" is currently paused by user. All transactions blocked.`;
      policyEnforced = 'Agent Status: PAUSED';
    } else {
      pipelineSteps[0] = { step: 1, title: 'Agent Verification', status: 'passed', detail: `Agent "${agent.name}" verified & active.` };
    }

    // Step 2: Category Check
    if (decision !== 'BLOCKED') {
      const isBlockedCategory = agent.blockedCategories.some(
        (c) => c.toLowerCase() === category.toLowerCase()
      );
      if (isBlockedCategory) {
        pipelineSteps[1] = { step: 2, title: 'Category Policy Check', status: 'failed', detail: `Category "${category}" is explicitly BLOCKED.` };
        decision = 'BLOCKED';
        reason = `Category "${category}" is explicitly blocked under user security policy.`;
        policyEnforced = `Blocked Category Rule (${category})`;
      } else {
        pipelineSteps[1] = { step: 2, title: 'Category Policy Check', status: 'passed', detail: `Category "${category}" is permitted.` };
      }
    }

    // Step 3: Transaction Limit Check
    if (decision !== 'BLOCKED') {
      if (numericAmount > agent.userTxnLimit) {
        pipelineSteps[2] = {
          step: 3,
          title: 'Transaction Limit Check',
          status: 'failed',
          detail: `Requested ₹${numericAmount.toLocaleString()} exceeds user single limit ₹${agent.userTxnLimit.toLocaleString()}.`,
        };
        decision = 'BLOCKED';
        reason = `Amount (₹${numericAmount.toLocaleString()}) exceeds the maximum user transaction limit of ₹${agent.userTxnLimit.toLocaleString()}.`;
        policyEnforced = `User Transaction Limit Cap: ₹${agent.userTxnLimit.toLocaleString()}`;
      } else {
        pipelineSteps[2] = {
          step: 3,
          title: 'Transaction Limit Check',
          status: 'passed',
          detail: `₹${numericAmount.toLocaleString()} <= ₹${agent.userTxnLimit.toLocaleString()} cap.`,
        };
      }
    }

    // Step 4: Daily Limit Check
    if (decision !== 'BLOCKED') {
      const projectedDaily = agent.spentToday + numericAmount;
      if (projectedDaily > agent.userDailyLimit) {
        pipelineSteps[3] = {
          step: 4,
          title: 'Daily Spending Cap Check',
          status: 'failed',
          detail: `Projected daily spent ₹${projectedDaily.toLocaleString()} exceeds user daily limit ₹${agent.userDailyLimit.toLocaleString()}.`,
        };
        decision = 'BLOCKED';
        reason = `Transaction would breach user daily limit of ₹${agent.userDailyLimit.toLocaleString()} (Spent today: ₹${agent.spentToday.toLocaleString()}).`;
        policyEnforced = `Daily Limit Cap: ₹${agent.userDailyLimit.toLocaleString()}`;
      } else {
        pipelineSteps[3] = {
          step: 4,
          title: 'Daily Spending Cap Check',
          status: 'passed',
          detail: `Projected ₹${projectedDaily.toLocaleString()} within ₹${agent.userDailyLimit.toLocaleString()} daily cap.`,
        };
      }
    }

    // Step 5: Approval Threshold Check
    if (decision === 'ALLOWED') {
      if (numericAmount > agent.approvalThreshold) {
        pipelineSteps[4] = {
          step: 5,
          title: 'Human Approval Threshold Check',
          status: 'warning',
          detail: `₹${numericAmount.toLocaleString()} exceeds approval threshold ₹${agent.approvalThreshold.toLocaleString()}.`,
        };
        decision = 'APPROVAL_REQUIRED';
        reason = `Amount (₹${numericAmount.toLocaleString()}) is within daily cap but exceeds automatic approval threshold (₹${agent.approvalThreshold.toLocaleString()}). Human verification required.`;
        policyEnforced = `Human Approval Threshold: > ₹${agent.approvalThreshold.toLocaleString()}`;
      } else {
        pipelineSteps[4] = {
          step: 5,
          title: 'Human Approval Threshold Check',
          status: 'passed',
          detail: `Within auto-approval limit (<= ₹${agent.approvalThreshold.toLocaleString()}).`,
        };
      }
    }

    // Record new transaction
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      agentId: agent.id,
      agentName: agent.name,
      developer: agent.developer,
      merchant,
      amount: numericAmount,
      category,
      decision,
      reason,
      policyEnforced,
      riskSignals: 'Live PaySentinel Policy Evaluation • HMAC Verification Passed',
      requestedAction: `Automated ${category} payment request via ${agent.name}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // If allowed, update agent spentToday
    if (decision === 'ALLOWED') {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, spentToday: a.spentToday + numericAmount } : a
        )
      );
    }

    // If approval required, push to pending approvals queue
    if (decision === 'APPROVAL_REQUIRED') {
      const newApproval = {
        id: `APP-${Math.floor(100 + Math.random() * 900)}`,
        agentId: agent.id,
        agentName: agent.name,
        developer: agent.developer,
        merchant,
        amount: numericAmount,
        category,
        itemDescription: `Requested ${category} purchase at ${merchant}`,
        agentPromptReason: `Agent initiated payment for ${merchant} under query policy.`,
        policyContext: reason,
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setApprovals((prev) => [newApproval, ...prev]);
    }

    return { decision, reason, policyEnforced, pipelineSteps, newTxn };
  };

  // Handle human approval decision
  const resolveApproval = (approvalId, approved) => {
    const targetApproval = approvals.find((a) => a.id === approvalId);
    setApprovals((prev) => prev.filter((a) => a.id !== approvalId));

    if (targetApproval && approved) {
      // Deduct/Add to spentToday
      setAgents((prev) =>
        prev.map((a) =>
          a.id === targetApproval.agentId
            ? { ...a, spentToday: a.spentToday + targetApproval.amount }
            : a
        )
      );
      // Append approved transaction
      const approvedTxn = {
        id: `TXN-APP-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        agentId: targetApproval.agentId,
        agentName: targetApproval.agentName,
        developer: targetApproval.developer,
        merchant: targetApproval.merchant,
        amount: targetApproval.amount,
        category: targetApproval.category,
        decision: 'ALLOWED',
        reason: 'Human user explicitly APPROVED pending payment request.',
        policyEnforced: 'Manual Human Approval Authorized',
        riskSignals: 'Approved by Account Owner via Security Portal',
        requestedAction: targetApproval.itemDescription,
      };
      setTransactions((prev) => [approvedTxn, ...prev]);
    }
  };

  // Calculated totals
  const totalSpentToday = agents.reduce((acc, curr) => acc + curr.spentToday, 0);
  const pendingApprovalsCount = approvals.length;
  const blockedCountToday = transactions.filter((t) => t.decision === 'BLOCKED').length;

  return (
    <PolicyContext.Provider
      value={{
        agents,
        transactions,
        approvals,
        protectedBalance,
        overallDailyCap,
        totalSpentToday,
        pendingApprovalsCount,
        blockedCountToday,
        toggleAgentStatus,
        updateAgentPolicy,
        createAgent,
        evaluatePayment,
        resolveApproval,
      }}
    >
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error('usePolicy must be used within a PolicyProvider');
  }
  return context;
};
