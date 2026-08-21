import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RazorpayLayout from '../components/RazorpayLayout';
import api from '../api/axios';
import { Code2, UserCheck, PlusCircle, CreditCard, ShieldCheck, Activity, Key, CheckCircle } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        const endpoint = user.role === 'developer' ? '/developer/dashboard' : '/user/dashboard';
        const res = await api.get(endpoint);
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error loading role dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  return (
    <RazorpayLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Title Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Home Screen
                </h1>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                  user?.role === 'developer' ? 'razorpay-badge-dev' : 'razorpay-badge-user'
                }`}>
                  {user?.role === 'developer' ? '⚡ Developer Mode' : '👤 User Mode'}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Welcome back, <span className="font-semibold text-slate-900">{user?.name}</span>! You are authenticated as <span className="font-semibold text-slate-900 uppercase">{user?.role}</span>.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                API Connection Active
              </span>
            </div>
          </div>
        </div>

        {/* Role Specific Overview Cards */}
        {user?.role === 'developer' ? (
          /* DEVELOPER DASHBOARD CARDS */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Active Agents</span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">0</div>
                <p className="text-xs text-slate-500 mt-2">Ready to deploy new payment agents</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Keys</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">1</div>
                <p className="text-xs text-slate-500 mt-2">Primary developer Secret Key active</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Webhook Status</span>
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">Healthy</div>
                <p className="text-xs text-slate-500 mt-2">Listening for agent payment events</p>
              </div>

            </div>

            {/* Developer Action Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium mb-4 border border-emerald-500/30">
                  <Code2 className="w-3.5 h-3.5 mr-1.5" /> Developer Hub Ready
                </div>
                <h3 className="text-2xl font-bold mb-2">Create Your First AI Payment Agent</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  As a developer, you can register new agents with custom webhook endpoints, API authorization rules, and automated execution constraints.
                </p>
                <button
                  onClick={() => alert('Agent creation workflow will be connected next!')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>+ Create Payment Agent</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* USER DASHBOARD CARDS */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executed Payments</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">₹0.00</div>
                <p className="text-xs text-slate-500 mt-2">No agent transactions yet</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Agents</span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">Ready</div>
                <p className="text-xs text-slate-500 mt-2">Connect to developer agents for payments</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Level</span>
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">Protected</div>
                <p className="text-xs text-slate-500 mt-2">JWT Signed Session Active</p>
              </div>

            </div>

            {/* User Action Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-4 border border-blue-500/30">
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" /> User Payment Portal
                </div>
                <h3 className="text-2xl font-bold mb-2">Execute Agent Payment</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  As a user, you can utilize active developer payment agents to authorize automated transactions with Razorpay-standard verification.
                </p>
                <button
                  onClick={() => alert('Agent payment execution workflow will be connected next!')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Execute Payment with Agent</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </RazorpayLayout>
  );
}
