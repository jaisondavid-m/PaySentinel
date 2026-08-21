import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePolicy } from '../context/PolicyContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Bot,
  CreditCard,
  BellRing,
  Sliders,
  FileText,
  Receipt,
  Activity,
  XCircle,
  LogOut,
  ChevronRight,
  UserCheck,
  Code2,
  Settings,
  HelpCircle,
  Key
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const { pendingApprovalsCount, agents } = usePolicy();
  const isDev = user?.role === 'developer';

  // Navigation Items per Role matching exact user prompt hierarchy
  const userNavigation = [
    {
      group: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'my-agents', label: 'My Agents', icon: Bot, badge: `${agents.length} Active` },
        { 
          id: 'approvals', 
          label: 'Approvals', 
          icon: BellRing, 
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null, 
          badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200' 
        },
        { id: 'transactions', label: 'Transactions', icon: CreditCard },
      ],
    },
    {
      group: 'CONTROL & SECURITY',
      items: [
        { id: 'policies-limits', label: 'Security & Policies', icon: Sliders },
        { id: 'activity-logs', label: 'Audit Logs', icon: FileText },
      ],
    },
  ];

  const devNavigation = [
    {
      group: 'DEVELOPER',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'my-agents', label: 'Agents', icon: Bot, badge: `${agents.length} Agents` },
        { id: 'payment-requests', label: 'Payment Requests', icon: Receipt },
      ],
    },
    {
      group: 'MONITORING',
      items: [
        { id: 'agent-activity', label: 'Analytics', icon: Activity },
        { id: 'rejected-requests', label: 'Audit Logs', icon: XCircle },
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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container - Light mode fixed sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E6E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#E6E8F0] bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#7D53F6] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-[#171923] tracking-tight leading-tight">PaySentinel</span>
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                  Agent Shield Gateway
                </span>
              </div>
            </div>
          </div>

          {/* Role Status Tag */}
          <div className="px-4 py-3 bg-[#F7F8FC] border-b border-[#E6E8F0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDev ? (
                <Code2 className="w-4 h-4 text-[#16A34A]" />
              ) : (
                <UserCheck className="w-4 h-4 text-[#7D53F6]" />
              )}
              <span className="text-xs font-bold text-[#171923]">
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
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)] scrollbar-thin">
            {navigation.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold text-[#667085] uppercase tracking-wider">
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                          isActive
                            ? 'bg-[#F5F3FF] text-[#7D53F6] border border-[#DDD6FE] font-bold'
                            : 'text-[#667085] hover:bg-[#F7F8FC] hover:text-[#171923]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-[#7D53F6]' : 'text-[#667085] group-hover:text-[#171923]'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="w-3.5 h-3.5 text-[#7D53F6]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-3 border-t border-[#E6E8F0] bg-white space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#7D53F6] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-xs font-extrabold text-[#171923] truncate">{user?.name}</span>
                <span className="text-[10px] text-[#667085] truncate">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#667085] hover:text-[#DC2626] hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
