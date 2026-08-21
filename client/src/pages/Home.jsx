import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RazorpayLayout from '../components/RazorpayLayout';
import {
  Bot,
  CreditCard,
  PlusCircle,
  Key,
  ShieldCheck,
  Activity,
  CheckCircle,
  Clock,
  Sliders,
  Store,
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  Lock,
  Receipt,
  XCircle,
  TrendingUp,
  BookOpen,
  Webhook,
  FlaskConical,
  Copy,
  Check,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const isDev = user?.role === 'developer';

  // Default active tab per role
  const [activeTab, setActiveTab] = useState(isDev ? 'overview' : 'dashboard');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <RazorpayLayout activeTab={activeTab} setActiveTab={setActiveTab} title={activeTab}>
      <div className="space-y-6">

        {/* Top Greeting Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to PaySentinel
                </h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                  isDev ? 'razorpay-badge-dev' : 'razorpay-badge-user'
                }`}>
                  {isDev ? '⚡ Developer Console' : '👤 User Portal'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Logged in as <span className="font-semibold text-slate-900">{user?.name}</span> ({user?.email})
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {isDev ? (
                <button
                  onClick={() => setActiveTab('my-agents')}
                  className="razorpay-btn-primary text-xs flex items-center space-x-2 py-2 px-4 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Agent</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('my-agents')}
                  className="razorpay-btn-primary text-xs flex items-center space-x-2 py-2 px-4 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TAB CONTENTS BASED ON SELECTION */}

        {/* USER: DASHBOARD / DEVELOPER: OVERVIEW */}
        {(activeTab === 'dashboard' || activeTab === 'overview') && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isDev ? 'Total Agents' : 'Active Agents'}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{isDev ? '3' : '2'}</div>
                <p className="text-xs text-emerald-600 mt-1 flex items-center font-medium">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  {isDev ? 'All agents operational' : 'Authorized for payments'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isDev ? 'Payment Requests' : 'Total Spent'}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {isDev ? '142' : '₹12,450.00'}
                </div>
                <p className="text-xs text-blue-600 mt-1 flex items-center font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +18.4% this month
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isDev ? 'API Call Latency' : 'Pending Approvals'}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    {isDev ? <Activity className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {isDev ? '48 ms' : '1 Pending'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isDev ? 'Avg response time' : 'Requires your approval'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isDev ? 'Success Rate' : 'Security Policy'}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {isDev ? '99.8%' : 'Strict'}
                </div>
                <p className="text-xs text-purple-700 mt-1 font-medium">
                  {isDev ? 'Zero fatal errors' : 'Max ₹25,000 / day cap'}
                </p>
              </div>

            </div>

            {/* Main Action Showcase Card */}
            <div className={`rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
              isDev
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950'
                : 'bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950'
            }`}>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 border bg-white/10 border-white/20">
                  {isDev ? '⚡ Developer Sentinel Engine' : '🛡️ Autonomous Payment Protection'}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {isDev ? 'Build Autonomous Agents for Payments' : 'Manage & Authorize Payment Agents'}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
                  {isDev
                    ? 'Deploy payment agents with custom webhook callbacks, generate HMAC signed API keys, and track real-time agent invocation telemetry.'
                    : 'Set custom spending caps, approve pending agent requests, and monitor all automated payment actions taken on your behalf.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('my-agents')}
                    className="bg-white text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-md flex items-center space-x-2"
                  >
                    <span>View My Agents</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  {isDev ? (
                    <button
                      onClick={() => setActiveTab('api-keys')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>Manage API Keys</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('policies-limits')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Configure Limits</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MY AGENTS TAB */}
        {activeTab === 'my-agents' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>My Registered Payment Agents</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isDev ? 'Manage deployed agents & webhook rules' : 'Active agents allowed to process payments'}
                </p>
              </div>
              <button
                onClick={() => alert('Agent Creation Modal initialized!')}
                className="razorpay-btn-primary text-xs flex items-center space-x-1.5 py-2 px-3 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Agent</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Agent 1 */}
              <div className="p-5 rounded-xl border border-slate-200 hover:border-blue-500 transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-emerald-600" />
                      <span>Sentinel PayBot Alpha</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Automated SaaS subscription renewal & cloud server billing executor.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Max Limit: ₹5,000 / txn</span>
                  <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">ag_live_99a8x</span>
                </div>
              </div>

              {/* Agent 2 */}
              <div className="p-5 rounded-xl border border-slate-200 hover:border-blue-500 transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span>Commerce Sentinel Agent</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    E-commerce checkout autonomous negotiator and cashback validator.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Max Limit: ₹15,000 / txn</span>
                  <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">ag_live_4477z</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TRANSACTIONS / PAYMENT REQUESTS */}
        {(activeTab === 'transactions' || activeTab === 'payment-requests') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>{isDev ? 'Incoming Agent Payment Requests' : 'Transaction History'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time ledger of agent processed transactions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Txn ID</th>
                    <th className="py-3 px-4">Agent Name</th>
                    <th className="py-3 px-4">Merchant Target</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-900">#TXN-90218</td>
                    <td className="py-3 px-4">Sentinel PayBot Alpha</td>
                    <td className="py-3 px-4">AWS Cloud Services</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹3,450.00</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Success
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">12 mins ago</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-900">#TXN-88412</td>
                    <td className="py-3 px-4">Commerce Sentinel Agent</td>
                    <td className="py-3 px-4">Flipkart Merchant</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹8,999.00</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Success
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">2 hours ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API KEYS TAB (DEVELOPER) */}
        {activeTab === 'api-keys' && isDev && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  <span>Developer API Secret Keys</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Use secret keys to authenticate agent server requests</p>
              </div>
              <button
                onClick={() => alert('Generated new secret API key!')}
                className="razorpay-btn-primary text-xs py-2 px-3 cursor-pointer"
              >
                + Create New Key
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">Live Production Key</span>
                <span className="font-mono text-xs text-slate-600 bg-white px-3 py-1 rounded border border-slate-200 inline-block">
                  ps_live_sec_8849f9910ab33x99182a0
                </span>
              </div>
              <button
                onClick={() => handleCopyKey('ps_live_sec_8849f9910ab33x99182a0')}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* WEBHOOKS TAB (DEVELOPER) */}
        {activeTab === 'webhooks' && isDev && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Webhook className="w-5 h-5 text-indigo-600" />
                <span>Agent Webhook Callbacks</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Receive payment authorization events in real-time</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Webhook Endpoint URL
                </label>
                <input
                  type="url"
                  defaultValue="https://api.yourdomain.com/v1/paysentinel/webhook"
                  className="razorpay-input font-mono text-xs"
                />
              </div>
              <button className="razorpay-btn-primary text-xs py-2 px-4 cursor-pointer">
                Save Webhook Settings
              </button>
            </div>
          </div>
        )}

        {/* GENERIC PLACEHOLDER FOR OTHER LIST ITEMS */}
        {!['dashboard', 'overview', 'my-agents', 'transactions', 'payment-requests', 'api-keys', 'webhooks'].includes(activeTab) && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-2xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              This section is configured and ready for full production feature binding. All RBAC rules for <span className="font-semibold uppercase text-slate-800">{user?.role}</span> are active.
            </p>
          </div>
        )}

      </div>
    </RazorpayLayout>
  );
}
