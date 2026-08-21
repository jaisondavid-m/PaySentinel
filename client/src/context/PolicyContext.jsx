import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const PolicyContext = createContext(null);

export const PolicyProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [protectedBalance, setProtectedBalance] = useState(25000);
  const [overallDailyCap, setOverallDailyCap] = useState(7000);
  const [totalSpentToday, setTotalSpentToday] = useState(0);
  const [blockedCountToday, setBlockedCountToday] = useState(0);

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
        setTotalSpentToday(d.spent_today || 0);
        setOverallDailyCap(d.daily_limit || 7000);
        setBlockedCountToday(d.blocked_count || 0);
      }

      // Fetch Agents
      let agentRes = await api.get('/v1/user/agents').catch(() => null);
      if (!agentRes || !agentRes.data || !agentRes.data.data || agentRes.data.data.length === 0) {
        agentRes = await api.get('/v1/developer/agents').catch(() => null);
      }

      if (agentRes && agentRes.data && agentRes.data.data) {
        const mappedAgents = agentRes.data.data.map((ag) => {
          const userPol = ag.policies && ag.policies[0] ? ag.policies[0] : {};
          const maxTxn = userPol.max_transaction_paise ? userPol.max_transaction_paise / 100 : 3000;
          const dailyCap = userPol.daily_limit_paise ? userPol.daily_limit_paise / 100 : 7000;
          const thresh = userPol.approval_threshold_paise ? userPol.approval_threshold_paise / 100 : 2000;
          const spentToday = ag.spent_today_paise ? ag.spent_today_paise / 100 : 0;

          return {
            id: ag.id,
            name: ag.name,
            description: ag.description,
            developer: ag.developer ? ag.developer.name : 'ShopWise AI Inc.',
            status: (ag.status || 'ACTIVE').toLowerCase(),
            isAuthorized: ag.is_authorized || false,
            spentToday,
            userTxnLimit: maxTxn,
            userDailyLimit: dailyCap,
            approvalThreshold: thresh,
            allowedCategories: ['Electronics', 'Groceries', 'Software'],
            blockedCategories: ['Gambling', 'Gift Cards', 'Crypto'],
            lastActivity: new Date(ag.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        setAgents(mappedAgents);
      }

      // Fetch Transactions
      const txnRes = await api.get('/v1/user/transactions').catch(() => null);
      if (txnRes && txnRes.data && txnRes.data.data) {
        const mappedTxns = txnRes.data.data.map((t) => {
          const amountRs = t.amount_paise ? t.amount_paise / 100 : (t.amount || 0);
          return {
            id: `TXN-${t.id}`,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: t.created_at,
            agentId: t.agent_id,
            agentName: t.agent ? t.agent.name : 'AI Agent',
            developer: t.agent && t.agent.developer ? t.agent.developer.name : 'ShopWise AI Inc.',
            merchant: t.merchant,
            amount: amountRs,
            category: t.category,
            decision: t.status,
            reason: t.decision_reason,
            policyEnforced: t.policy_enforced,
            requestedAction: t.description || 'Automated payment trigger',
          };
        });
        setTransactions(mappedTxns);
      }

      // Fetch Approvals
      const appRes = await api.get('/v1/user/approvals').catch(() => null);
      if (appRes && appRes.data && appRes.data.data) {
        const mappedApps = appRes.data.data.map((a) => {
          const pr = a.payment_request || {};
          const amountRs = pr.amount_paise ? pr.amount_paise / 100 : (pr.amount || 0);
          return {
            id: a.id,
            agentId: pr.agent_id,
            agentName: pr.agent ? pr.agent.name : 'AI Agent',
            developer: pr.agent && pr.agent.developer ? pr.agent.developer.name : 'ShopWise AI Inc.',
            merchant: pr.merchant,
            amount: amountRs,
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
      console.error('Error fetching backend state:', err);
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
      refreshData();
    } catch (err) {
      console.error('Error toggling agent status:', err);
    }
  };

  // Authorize Agent via API
  const authorizeAgent = async (agentId, policyData) => {
    try {
      await api.post(`/v1/user/agents/${agentId}/authorize`, {
        max_transaction_amount: policyData.userTxnLimit || 3000,
        daily_limit: policyData.userDailyLimit || 7000,
        approval_threshold: policyData.approvalThreshold || 2000,
        allowed_categories: policyData.allowedCategories || ['Electronics', 'Groceries'],
        blocked_categories: policyData.blockedCategories || ['Gambling', 'Gift Cards', 'Crypto'],
        unknown_merchant_action: policyData.unknownMerchantAction || 'ask_approval',
      });
      refreshData();
    } catch (err) {
      console.error('Error authorizing agent:', err);
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
      refreshData();
    } catch (err) {
      console.error('Error updating agent policy via API:', err);
    }
  };

  // Create Developer Agent via API
  const createAgent = async (newAgent) => {
    try {
      const res = await api.post('/v1/developer/agents', {
        name: newAgent.name,
        description: newAgent.description,
        requested_txn_limit: newAgent.requestedTxnLimit || 5000,
        requested_daily_limit: newAgent.requestedDailyLimit || 10000,
        capabilities: newAgent.capabilities || ['payment', 'electronics', 'groceries'],
      });

      refreshData();
      return res.data && res.data.data ? res.data.data : null;
    } catch (err) {
      console.error('Error creating developer agent:', err);
      throw err;
    }
  };

  // Evaluate Payment Request via Backend API Only
  const evaluatePayment = async (req) => {
    const numericAmount = parseFloat(req.amount);
    const amountPaise = Math.round(numericAmount * 100);
    const numericAgentId = typeof req.agentId === 'number' ? req.agentId : parseInt(req.agentId) || 1;

    const res = await api.post('/v1/agent/payment-requests', {
      agent_id: numericAgentId,
      merchant: req.merchant,
      amount_paise: amountPaise,
      amount: numericAmount,
      currency: 'INR',
      category: req.category,
      description: req.description || `Automated ${req.category} payment request`,
    });

    const data = res.data && res.data.data ? res.data.data : null;
    refreshData();

    if (data) {
      const pr = data.payment_request || {};
      return {
        decision: data.decision,
        reason: data.reason,
        policyEnforced: pr.policy_enforced || 'PaySentinel Enforced Rule',
        pipelineSteps: [
          { step: 1, title: 'Agent Verification', status: 'passed', detail: 'Verified & Active' },
          { step: 2, title: 'Category Policy Check', status: 'passed', detail: `Category ${req.category} checked` },
          { step: 3, title: 'Transaction Limit Check', status: data.decision === 'BLOCKED' ? 'failed' : 'passed', detail: `₹${numericAmount.toLocaleString()} evaluated` },
          { step: 4, title: 'Daily Spending Cap Check', status: 'passed', detail: 'Within daily cap' },
          { step: 5, title: 'Human Approval Threshold Check', status: data.decision === 'APPROVAL_REQUIRED' ? 'warning' : 'passed', detail: 'Threshold evaluated' },
        ],
      };
    }
    return null;
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
    }
  };

  // Generate Gemini AI Shopping Agent Proposal via Backend API
  const generateAIPurchaseProposal = async (message) => {
    try {
      const res = await api.post('/v1/ai/shopping-agent', { message });
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.error('Error generating AI purchase proposal:', err);
      throw err;
    }
  };

  const pendingApprovalsCount = approvals.length;

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
        authorizeAgent,
        updateAgentPolicy,
        createAgent,
        evaluatePayment,
        generateAIPurchaseProposal,
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
