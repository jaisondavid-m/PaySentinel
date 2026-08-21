import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, Code2, UserCheck, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function Register({ onNavigateLogin }) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default role 'user'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !role) {
      setError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, role);
    } catch (err) {
      console.error('Registration error:', err);
      const apiMsg = err.response?.data?.error || 'Failed to register account. Please try again.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your PaySentinel Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Select your account role to get started with autonomous payment workflows
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="razorpay-card py-8 px-6 sm:px-10">

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Select Account Role <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Developer Role Card */}
                <div
                  onClick={() => setRole('developer')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                    role === 'developer'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {role === 'developer' && (
                    <div className="absolute top-3 right-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">Developer Role</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Build, deploy, and manage AI payment agents, generate API keys, and handle merchant logic.
                    </p>
                  </div>
                  <span className="mt-4 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full w-max">
                    ⚡ Can Create Agents
                  </span>
                </div>

                {/* User Role Card */}
                <div
                  onClick={() => setRole('user')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                    role === 'user'
                      ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {role === 'user' && (
                    <div className="absolute top-3 right-3 text-blue-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">User Role</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Authorize payments, execute transactions via active agents, and manage payment history.
                    </p>
                  </div>
                  <span className="mt-4 text-[11px] font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full w-max">
                    👤 Can Execute Payments
                  </span>
                </div>

              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="razorpay-input has-icon-left"
                  required
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="razorpay-input has-icon-left has-icon-right"
                  minLength={6}
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already registered?{' '}
              <button
                onClick={onNavigateLogin}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
