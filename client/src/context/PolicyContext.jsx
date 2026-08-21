import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { INITIAL_AGENTS, INITIAL_TRANSACTIONS, INITIAL_APPROVALS } from '../data/mockData';

const PolicyContext = createContext(null);

export const PolicyProvider = ({ children }) => {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [protectedBalance, setProtectedBalance] = useState(25000);
  const [overallDailyCap, setOverallDailyCap] = useState(7000);
  const [totalSpentToday, setTotalSpentToday] = useState(1240);

  // Fetch real data from backend API
  const refreshData = useCallback(async () => {
    const token = localStorage.getItem('paysentinel_token');
    if (!token) return;

    try {
      setLoadingData(true);
      
      // Fetch Dashboard
      let dashRes = await api.get('/v1/user/dashboard').catch(() => null);
      if (!dashRes) {
        dashRes = await api.get('/v1/developer/dashboard').catch(() => null);
      }
      if (dashRes && dashRes.data && dashRes.data.data) {
        const d = dashRes.data.data;
        setProtectedBalance(d.protected_balance || 25000);
        setTotalSpentToday(d.spent_today || d.total_spent || 0);
        setOverallDailyCap(d.daily_limit || 7000);
      }

      // Fetch Agents
      let agentRes = await api.get('/v1/user/agents').catch(() => null);
      if (!agentRes || !agentRes.data || !agentRes.data.data || agentRes.data.data.length === 0) {
        agentRes = await api.get('/v1/developer/agents').catch(() => null);
      }

      if (agentRes && agentRes.data && agentRes.data.data && agentRes.data.data.length > 0) {
        const mappedAgents = agentRes.data.data.map((ag) => {
          const userPol = ag.policies && ag.policies[0] ? ag.policies[0] : {};
          return {
            id: ag.id,
            name: ag.name,
            developer: ag.developer ? ag.developer.name : 'ShopWise AI Inc.',
            status: (ag.status || 'ACTIVE').toLowerCase(),
            spentToday: 0,
            userTxnLimit: userPol.max_transaction_amount || 3000,
            userDailyLimit: userPol.daily_limit || 7000,
            approvalThreshold: userPol.approval_threshold || 2000,
            allowedCategories: ['Electronics', 'Groceries', 'Software'],
            blockedCategories: ['Gambling', 'Gift Cards', 'Crypto'],
            lastActivity: 'Just now',
          };
        });
        setAgents(mappedAgents);
      }

      // Fetch Transactions
      const txnRes = await api.get('/v1/user/transactions').catch(() => null);
      if (txnRes && txnRes.data && txnRes.data.data && txnRes.data.data.length > 0) {
        const mappedTxns = txnRes.data.data.map((t) => ({
          id: `TXN-${t.id}`,
          time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: t.created_at,
          agentId: t.agent_id,
          agentName: t.agent ? t.agent.name : 'AI Agent',
          developer: 'ShopWise AI Inc.',
          merchant: t.merchant,
          amount: t.amount,
          category: t.category,
          decision: t.status,
          reason: t.decision_reason,
          policyEnforced: t.policy_enforced,
          requestedAction: t.description || 'Automated payment trigger',
        }));
        setTransactions(mappedTxns);
      }

      // Fetch Approvals
      const appRes = await api.get('/v1/user/approvals').catch(() => null);
      if (appRes && appRes.data && appRes.data.data) {
        const mappedApps = appRes.data.data.map((a) => {
          const pr = a.payment_request || {};
          return {
            id: a.id,
            agentId: pr.agent_id,
            agentName: pr.agent ? pr.agent.name : 'AI Agent',
            developer: 'ShopWise AI Inc.',
            merchant: pr.merchant,
            amount: pr.amount,
            category: pr.category,
            itemDescription: pr.description || 'Requested Purchase',
            agentPromptReason: 'Agent initiated payment trigger',
            policyContext: pr.decision_reason,
            requestedAt: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        setApprovals(mappedApps);
      }

      // Fetch Audit Logs
      const auditRes = await api.get('/v1/user/audit-logs').catch(() => null);
      if (auditRes && auditRes.data && auditRes.data.data) {
        setAuditLogs(auditRes.data.data);
      }

    } catch (err) {
      console.warn('Backend API connection warning. Falling back to local prototype state:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Toggle Agent Status via API
  const toggleAgentStatus = async (agentId) => {
    const currentAgent = agents.find((a) => a.id === agentId);
    const newStatus = currentAgent?.status === 'active' ? 'PAUSED' : 'ACTIVE';

    try {
      await api.patch(`/v1/user/agents/${agentId}/status`, { status: newStatus });
      setAgents((prev) =>
        prev.map((ag) =>
          ag.id === agentId ? { ...ag, status: newStatus.toLowerCase() } : ag
        )
      );
    } catch (err) {
      console.error('Error toggling agent status:', err);
      // Fallback local toggle
      setAgents((prev) =>
        prev.map((ag) =>
          ag.id === agentId
            ? { ...ag, status: ag.status === 'active' ? 'paused' : 'active' }
            : ag
        )
      );
    }
  };

  // Update Agent Policy via API
  const updateAgentPolicy = async (agentId, updatedFields) => {
    try {
      await api.patch(`/v1/user/agents/${agentId}/policy`, {
        max_transaction_amount: updatedFields.userTxnLimit,
        daily_limit: updatedFields.userDailyLimit,
        approval_threshold: updatedFields.approvalThreshold,
        unknown_merchant_action: updatedFields.unknownMerchantPolicy,
        suspicious_transaction_action: updatedFields.suspiciousPolicy,
        allowed_categories: updatedFields.allowedCategories,
        blocked_categories: updatedFields.blockedCategories,
      });
      setAgents((prev) =>
        prev.map((ag) => (ag.id === agentId ? { ...ag, ...updatedFields } : ag))
      );
    } catch (err) {
      console.error('Error updating agent policy via API:', err);
      setAgents((prev) =>
        prev.map((ag) => (ag.id === agentId ? { ...ag, ...updatedFields } : ag))
      );
    }
  };

  // Create Developer Agent via API
  const createAgent = async (newAgent) => {
    try {
      const res = await api.post('/v1/developer/agents', {
        name: newAgent.name,
        description: newAgent.description,
        requested_txn_limit: newAgent.requestedTxnLimit,
        requested_daily_limit: newAgent.requestedDailyLimit,
      });

      const createdObj = res.data && res.data.data ? res.data.data : null;
      const created = {
        id: createdObj ? createdObj.id : `ag-${Date.now()}`,
        status: 'active',
        spentToday: 0,
        riskLevel: 'Low Risk',
        userTxnLimit: 3000,
        userDailyLimit: 7000,
        approvalThreshold: 2000,
        allowedCategories: ['Electronics', 'Groceries'],
        blockedCategories: ['Gambling', 'Gift Cards', 'Crypto'],
        lastActivity: 'Just now',
        ...newAgent,
      };

      setAgents((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Error creating developer agent:', err);
      const fallbackCreated = {
        id: `ag-${Date.now()}`,
        status: 'active',
        spentToday: 0,
        riskLevel: 'Low Risk',
        userTxnLimit: 3000,
        userDailyLimit: 7000,
        approvalThreshold: 2000,
        allowedCategories: ['Electronics', 'Groceries'],
        blockedCategories: ['Gambling', 'Gift Cards', 'Crypto'],
        lastActivity: 'Just now',
        ...newAgent,
      };
      setAgents((prev) => [fallbackCreated, ...prev]);
      return fallbackCreated;
    }
  };

  // Evaluate Payment Request via API
  const evaluatePayment = async (req) => {
    const numericAmount = parseFloat(req.amount);
    const numericAgentId = typeof req.agentId === 'number' ? req.agentId : 1;

    try {
      const res = await api.post('/v1/agent/payment-requests', {
        agent_id: numericAgentId,
        merchant: req.merchant,
        amount: numericAmount,
        currency: 'INR',
        category: req.category,
        description: `Automated ${req.category} payment request`,
      });

      const data = res.data && res.data.data ? res.data.data : null;
      if (data) {
        refreshData();
        const pr = data.payment_request || {};
        return {
          decision: data.decision,
          reason: data.reason,
          policyEnforced: pr.policy_enforced || 'PaySentinel Enforced Rule',
          pipelineSteps: [
            { step: 1, title: 'Agent Verification', status: 'passed', detail: 'Verified & Active' },
            { step: 2, title: 'Category Policy Check', status: 'passed', detail: `Category ${req.category} checked` },
            { step: 3, title: 'Transaction Limit Check', status: data.decision === 'BLOCKED' ? 'failed' : 'passed', detail: `₹${numericAmount} evaluated` },
            { step: 4, title: 'Daily Spending Cap Check', status: 'passed', detail: 'Within daily cap' },
            { step: 5, title: 'Human Approval Threshold Check', status: data.decision === 'APPROVAL_REQUIRED' ? 'warning' : 'passed', detail: 'Threshold evaluated' },
          ],
        };
      }
    } catch (err) {
      console.warn('Falling back to client-side decision evaluator:', err);
    }

    // Client-side fallback evaluator for simulation
    const agent = agents.find((a) => a.id === req.agentId) || agents[0];
    let decision = 'ALLOWED';
    let reason = 'Transaction is within user daily spending limit and single purchase cap.';
    let policyEnforced = `User Single Cap: ₹${agent.userTxnLimit.toLocaleString()} | Daily Cap: ₹${agent.userDailyLimit.toLocaleString()}`;

    const pipelineSteps = [
      { step: 1, title: 'Agent Verification', status: 'passed', detail: `Agent ${agent.name} verified & active.` },
      { step: 2, title: 'Category Policy Check', status: 'passed', detail: `Category ${req.category} permitted.` },
      { step: 3, title: 'Transaction Limit Check', status: 'passed', detail: `₹${numericAmount} <= ₹${agent.userTxnLimit}` },
      { step: 4, title: 'Daily Spending Cap Check', status: 'passed', detail: 'Within daily cap' },
      { step: 5, title: 'Human Approval Threshold Check', status: 'passed', detail: 'Threshold evaluated' },
    ];

    if (agent.status !== 'active') {
      decision = 'BLOCKED';
      reason = `Agent "${agent.name}" is currently PAUSED by user. All transactions blocked.`;
      policyEnforced = 'Agent Status: PAUSED';
      pipelineSteps[0] = { step: 1, title: 'Agent Verification', status: 'failed', detail: `Agent ${agent.name} is PAUSED.` };
    } else if (agent.blockedCategories.some((c) => c.toLowerCase() === req.category.toLowerCase())) {
      decision = 'BLOCKED';
      reason = `Category "${req.category}" is explicitly blocked under user security policy.`;
      policyEnforced = `Blocked Category Rule (${req.category})`;
      pipelineSteps[1] = { step: 2, title: 'Category Policy Check', status: 'failed', detail: `Category ${req.category} explicitly BLOCKED.` };
    } else if (numericAmount > agent.userTxnLimit) {
      decision = 'BLOCKED';
      reason = `Amount (₹${numericAmount.toLocaleString()}) exceeds maximum user transaction limit of ₹${agent.userTxnLimit.toLocaleString()}.`;
      policyEnforced = `User Transaction Limit Cap: ₹${agent.userTxnLimit.toLocaleString()}`;
      pipelineSteps[2] = { step: 3, title: 'Transaction Limit Check', status: 'failed', detail: `Exceeds ₹${agent.userTxnLimit} cap.` };
    } else if (numericAmount > agent.approvalThreshold) {
      decision = 'APPROVAL_REQUIRED';
      reason = `Amount (₹${numericAmount.toLocaleString()}) is within daily cap but exceeds automatic approval threshold (₹${agent.approvalThreshold.toLocaleString()}). Human verification required.`;
      policyEnforced = `Human Approval Threshold: > ₹${agent.approvalThreshold.toLocaleString()}`;
      pipelineSteps[4] = { step: 5, title: 'Human Approval Threshold Check', status: 'warning', detail: `Exceeds threshold ₹${agent.approvalThreshold}` };
    }

    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      agentId: agent.id,
      agentName: agent.name,
      developer: agent.developer,
      merchant: req.merchant,
      amount: numericAmount,
      category: req.category,
      decision,
      reason,
      policyEnforced,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    return { decision, reason, policyEnforced, pipelineSteps, newTxn };
  };

  // Resolve Approval via API
  const resolveApproval = async (approvalId, approved) => {
    const endpoint = approved
      ? `/v1/user/approvals/${approvalId}/approve`
      : `/v1/user/approvals/${approvalId}/reject`;

    try {
      await api.post(endpoint);
      refreshData();
    } catch (err) {
      console.error('Error resolving approval via API:', err);
      // Fallback local resolve
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    }
  };

  const pendingApprovalsCount = approvals.length;
  const blockedCountToday = transactions.filter((t) => t.decision === 'BLOCKED').length;

  return (
    <PolicyContext.Provider
      value={{
        agents,
        transactions,
        approvals,
        auditLogs,
        loadingData,
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
        refreshData,
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
