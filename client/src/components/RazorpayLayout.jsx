import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Code2, UserCheck, ChevronDown, Sparkles } from 'lucide-react';

export default function RazorpayLayout({ children }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navbar - Razorpay Light Style */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xl text-slate-900 tracking-tight">PaySentinel</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    v1.0
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Autonomous Agent Payments</span>
              </div>
            </div>

            {/* Right Profile & Role Badge */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 pl-3 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    <span className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      user.role === 'developer' ? 'razorpay-badge-dev' : 'razorpay-badge-user'
                    }`}>
                      {user.role === 'developer' ? '⚡ Developer' : '👤 User'}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                      <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-600">
                        {user.role === 'developer' ? (
                          <>
                            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Developer Access Authorized</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Standard User Account</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Razorpay-style Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">PaySentinel Gateway Engine</span>
          </div>
          <p>© 2026 PaySentinel Inc. Powered by Go Gin, MySQL & React Tailwind v4.</p>
        </div>
      </footer>
    </div>
  );
}
