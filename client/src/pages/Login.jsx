import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ onNavigateRegister }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign in to PaySentinel
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Professional Payment Agent Orchestration Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="razorpay-card py-8 px-6 sm:px-10">

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="razorpay-input has-icon-left"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="razorpay-input has-icon-left has-icon-right"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full razorpay-btn-primary flex justify-center items-center py-3 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              New to PaySentinel?{' '}
              <button
                onClick={onNavigateRegister}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all cursor-pointer"
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
