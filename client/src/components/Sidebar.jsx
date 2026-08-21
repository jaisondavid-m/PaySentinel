import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Bot,
  CreditCard,
  BellRing,
  Sliders,
  Store,
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  Key,
  Lock,
  Receipt,
  Activity,
  XCircle,
  TrendingUp,
  BookOpen,
  Webhook,
  FlaskConical,
  LogOut,
  ChevronRight,
  UserCheck,
  Code2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const isDev = user?.role === 'developer';

  // Navigation Items per Role according to exact user specification
  const userNavigation = [
    {
      group: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-agents', label: 'My Agents', icon: Bot, badge: '2 Active' },
        { id: 'transactions', label: 'Transactions', icon: CreditCard },
        { id: 'approvals', label: 'Approvals', icon: BellRing, badge: '1 Pending', badgeColor: 'bg-amber-100 text-amber-700' },
      ],
    },
    {
      group: 'CONTROL',
      items: [
        { id: 'policies-limits', label: 'Policies & Limits', icon: Sliders },
        { id: 'trusted-merchants', label: 'Trusted Merchants', icon: Store },
        { id: 'spending', label: 'Spending', icon: BarChart3 },
      ],
    },
    {
      group: 'SECURITY',
      items: [
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
        { id: 'activity-logs', label: 'Activity Logs', icon: FileText },
      ],
    },
    {
      group: 'ACCOUNT',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const devNavigation = [
    {
      group: 'DEVELOPER',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'my-agents', label: 'My Agents', icon: Bot, badge: '3 Agents' },
        { id: 'api-keys', label: 'API Keys', icon: Key },
        { id: 'agent-permissions', label: 'Agent Permissions', icon: Lock },
        { id: 'payment-requests', label: 'Payment Requests', icon: Receipt },
      ],
    },
    {
      group: 'MONITORING',
      items: [
        { id: 'agent-activity', label: 'Agent Activity', icon: Activity },
        { id: 'rejected-requests', label: 'Rejected Requests', icon: XCircle },
        { id: 'usage-analytics', label: 'Usage & Analytics', icon: TrendingUp },
      ],
    },
    {
      group: 'INTEGRATION',
      items: [
        { id: 'api-docs', label: 'API Docs', icon: BookOpen },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook, badge: 'Live' },
        { id: 'sandbox', label: 'Sandbox', icon: FlaskConical },
      ],
    },
    {
      group: 'ACCOUNT',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const navigation = isDev ? devNavigation : userNavigation;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-tight">PaySentinel</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Autonomous Gateway
                </span>
              </div>
            </div>
          </div>

          {/* Role Status Tag */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDev ? (
                <Code2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <UserCheck className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-xs font-semibold text-slate-700">
                {isDev ? 'Developer Console' : 'User Portal'}
              </span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                isDev ? 'razorpay-badge-dev' : 'razorpay-badge-user'
              }`}
            >
              {isDev ? '⚡ DEV' : '👤 USER'}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-slate-200">
            {navigation.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.group}
                </h3>
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (setIsOpen) setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 shadow-xs border-l-4 border-blue-600 pl-2.5'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-xs font-bold text-slate-800 truncate">{user?.name}</span>
                <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
