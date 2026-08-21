import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PolicyProvider, usePolicy } from '../context/PolicyContext';
import RazorpayLayout from '../components/RazorpayLayout';
import SimulationModal from '../components/SimulationModal';
import TransactionDetailModal from '../components/TransactionDetailModal';

// User Views
import UserDashboard from './user/UserDashboard';
import UserAgents from './user/UserAgents';
import UserPolicies from './user/UserPolicies';
import UserApprovals from './user/UserApprovals';
import UserTransactions from './user/UserTransactions';
import UserSecurityLogs from './user/UserSecurityLogs';

// Dev Views
import DevOverview from './dev/DevOverview';
import DevAgents from './dev/DevAgents';

function HomeContent() {
  const { user } = useAuth();
  const isDev = user?.role === 'developer';

  const [activeTab, setActiveTab] = useState(isDev ? 'overview' : 'dashboard');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [simOpen, setSimOpen] = useState(false);

  return (
    <RazorpayLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={activeTab?.replace('-', ' ')}
    >
      {/* Top Banner Tag line as required in prompt */}
      <div className="mb-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-center text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-extrabold tracking-tight">AI agents can act. PaySentinel decides what they are allowed to do.</span>
        </div>
        <button
          onClick={() => setSimOpen(true)}
          className="mt-2 sm:mt-0 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
        >
          ⚡ Run Simulation Demo
        </button>
      </div>

      {/* RENDER USER VIEWS */}
      {!isDev && (
        <>
          {activeTab === 'dashboard' && (
            <UserDashboard
              setActiveTab={setActiveTab}
              onSelectTxn={(txn) => setSelectedTxn(txn)}
              onRunSim={() => setSimOpen(true)}
            />
          )}

          {activeTab === 'my-agents' && (
            <UserAgents setActiveTab={setActiveTab} />
          )}

          {activeTab === 'policies-limits' && (
            <UserPolicies />
          )}

          {activeTab === 'approvals' && (
            <UserApprovals />
          )}

          {activeTab === 'transactions' && (
            <UserTransactions onSelectTxn={(txn) => setSelectedTxn(txn)} />
          )}

          {(activeTab === 'alerts' || activeTab === 'activity-logs') && (
            <UserSecurityLogs />
          )}

          {!['dashboard', 'my-agents', 'policies-limits', 'approvals', 'transactions', 'alerts', 'activity-logs'].includes(activeTab) && (
            <UserPolicies />
          )}
        </>
      )}

      {/* RENDER DEVELOPER VIEWS */}
      {isDev && (
        <>
          {activeTab === 'overview' && (
            <DevOverview
              setActiveTab={setActiveTab}
              onRunSim={() => setSimOpen(true)}
            />
          )}

          {activeTab === 'my-agents' && (
            <DevAgents />
          )}

          {(activeTab === 'payment-requests' || activeTab === 'agent-activity' || activeTab === 'rejected-requests') && (
            <UserTransactions onSelectTxn={(txn) => setSelectedTxn(txn)} />
          )}

          {!['overview', 'my-agents', 'payment-requests', 'agent-activity', 'rejected-requests'].includes(activeTab) && (
            <DevOverview
              setActiveTab={setActiveTab}
              onRunSim={() => setSimOpen(true)}
            />
          )}
        </>
      )}

      {/* TRANSACTION DETAIL MODAL */}
      <TransactionDetailModal
        txn={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />

      {/* SIMULATION MODAL */}
      <SimulationModal
        isOpen={simOpen}
        onClose={() => setSimOpen(false)}
      />
    </RazorpayLayout>
  );
}

export default function Home() {
  return (
    <PolicyProvider>
      <HomeContent />
    </PolicyProvider>
  );
}
