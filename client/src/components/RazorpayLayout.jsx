import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, Bell, ShieldCheck, LogOut, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RazorpayLayout({ children, activeTab, setActiveTab, title }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased">
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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 capitalize tracking-tight">
                  {title || activeTab?.replace('-', ' ') || 'Dashboard'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Live System
                </span>
              </div>
            </div>

            {/* Middle: Search Bar */}
            <div className="hidden md:flex items-center max-w-md w-full mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search agents, transactions, API keys..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center space-x-3">
              <button
                title="Notifications"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              </button>

              <div className="h-6 w-px bg-slate-200"></div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{user?.role}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Profile Dropdown Box */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
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
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
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

        {/* Razorpay Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">PaySentinel Autonomous Gateway</span>
            </div>
            <p>© 2026 PaySentinel. Production Ready (Go Gin + GORM MySQL + React Tailwind v4).</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
