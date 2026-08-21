import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, Bell, ShieldCheck, LogOut, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RazorpayLayout({ children, activeTab, setActiveTab, title }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const getPageDescription = (tab) => {
    switch (tab) {
      case 'dashboard':
      case 'overview':
        return 'Monitor your AI payment security and real-time protection at a glance.';
      case 'my-agents':
        return 'Manage authorized AI agents and configured financial policy caps.';
      case 'approvals':
        return 'Review pending payment requests requiring human verification.';
      case 'transactions':
      case 'payment-requests':
        return 'Inspect full server-side authorization audit logs and security decisions.';
      case 'policies-limits':
        return 'Configure single cap, daily limit, approval threshold, and category rules.';
      case 'activity-logs':
      case 'rejected-requests':
        return 'Complete security event audit trail and policy enforcement trace.';
      default:
        return 'PaySentinel Autonomous AI Payment Security Gateway.';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-sans antialiased text-[#171923]">
      {/* Sidebar Navigation Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Wrapper - Shifted for desktop sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-[#E6E8F0] sticky top-0 z-30 shadow-2xs">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-[#667085] hover:bg-[#F7F8FC] hover:text-[#171923]"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#171923] capitalize tracking-tight">
                    {title || activeTab?.replace('-', ' ') || 'Overview'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-[#16A34A]" />
                    Shield Active
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-[#667085] font-medium">
                  {getPageDescription(activeTab)}
                </p>
              </div>
            </div>

            {/* Middle: Search Bar */}
            <div className="hidden lg:flex items-center max-w-md w-full mx-6">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search agents, transactions, API keys..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F8FC] border border-[#E6E8F0] rounded-xl text-[#171923] placeholder-[#667085] focus:outline-none focus:border-[#7D53F6] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center space-x-3">
              <button
                title="Notifications"
                className="p-2 rounded-xl text-[#667085] hover:bg-[#F7F8FC] hover:text-[#171923] relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7D53F6] rounded-full ring-2 ring-white"></span>
              </button>

              <div className="h-6 w-px bg-[#E6E8F0]"></div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-[#F7F8FC] transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#7D53F6] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#171923] leading-tight">{user?.name}</span>
                    <span className="text-[10px] text-[#667085] capitalize">{user?.role}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#667085]" />
                </button>

                {/* Profile Dropdown Box */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#E6E8F0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#E6E8F0] bg-[#F7F8FC]">
                      <p className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Account Context</p>
                      <p className="text-xs font-bold text-[#171923] truncate mt-0.5">{user?.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        user?.role === 'developer' ? 'razorpay-badge-dev' : 'razorpay-badge-user'
                      }`}>
                        {user?.role === 'developer' ? '⚡ Developer Mode' : '👤 User Mode'}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#DC2626] hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Light Mode Footer */}
        <footer className="bg-white border-t border-[#E6E8F0] py-4 px-6 text-xs text-[#667085]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#7D53F6]" />
              <span className="font-bold text-[#171923]">PaySentinel Agent Shield</span>
            </div>
            <p>© 2026 PaySentinel. Light Mode Fintech Security Gateway.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
