import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, UserCheck, Code2, Sparkles } from 'lucide-react';

export default function Login({ onNavigateRegister }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      const apiMsg = err.response?.data?.error || 'Failed to login. Please check your credentials or server connection.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');

    try {
      setLoading(true);
      await login(quickEmail, quickPassword);
    } catch (err) {
      console.error('Quick login error:', err);
      const apiMsg = err.response?.data?.error || 'Quick login failed. Make sure server is running.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#171923]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#7D53F6] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-3xl font-extrabold text-[#171923] tracking-tight">
          Sign in to PaySentinel
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-[#667085] font-medium">
          Autonomous AI Payment Security & Authorization Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E6E8F0] shadow-2xs">

          {/* Quick Demo Login Buttons */}
          <div className="mb-6 bg-[#F7F8FC] p-4 rounded-xl border border-[#E6E8F0] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#7D53F6]" />
                <span>Quick Demo Login Buttons</span>
              </span>
              <span className="text-[10px] bg-[#F5F3FF] text-[#7D53F6] font-bold px-2 py-0.5 rounded-full border border-[#DDD6FE]">1-Click</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('jaison7373@gmail.com', 'jaison')}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-[#F5F3FF] border border-[#E6E8F0] hover:border-[#DDD6FE] rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7D53F6] flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#171923] group-hover:text-[#7D53F6]">User Login</span>
                    <span className="block text-[10px] text-[#667085] font-mono">jaison7373@...</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('developer@gmail.com', 'password')}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-[#F0FDF4] border border-[#E6E8F0] hover:border-[#DCFCE7] rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-bold">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#171923] group-hover:text-[#16A34A]">Dev Login</span>
                    <span className="block text-[10px] text-[#667085] font-mono">developer@...</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-[#DC2626] animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="ps-input has-icon-left text-xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ps-input has-icon-left has-icon-right text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#171923]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full ps-btn-primary flex justify-center items-center py-3 text-sm font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-6 border-t border-[#E6E8F0] text-center">
            <p className="text-xs text-[#667085]">
              New to PaySentinel?{' '}
              <button
                onClick={onNavigateRegister}
                className="font-bold text-[#7D53F6] hover:underline transition-all cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
