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
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#171923]">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#7D53F6] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-3xl font-extrabold text-[#171923] tracking-tight">
          Create your PaySentinel Account
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-[#667085] font-medium">
          Select your account role to get started with autonomous payment workflows
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E6E8F0] shadow-2xs">

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-[#DC2626] animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider mb-2.5">
                Select Account Role <span className="text-[#DC2626]">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Developer Role Card */}
                <div
                  onClick={() => setRole('developer')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                    role === 'developer'
                      ? 'border-[#16A34A] bg-[#F0FDF4]'
                      : 'border-[#E6E8F0] bg-white hover:border-[#DDD6FE]'
                  }`}
                >
                  {role === 'developer' && (
                    <div className="absolute top-3 right-3 text-[#16A34A]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center mb-3 font-bold">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-[#171923] text-base">Developer Role</h4>
                    <p className="text-xs text-[#667085] mt-1 font-medium">
                      Build, deploy, and manage AI payment agents, generate API keys, and handle merchant logic.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full w-max">
                    ⚡ Can Create Agents
                  </span>
                </div>

                {/* User Role Card */}
                <div
                  onClick={() => setRole('user')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                    role === 'user'
                      ? 'border-[#7D53F6] bg-[#F5F3FF]'
                      : 'border-[#E6E8F0] bg-white hover:border-[#DDD6FE]'
                  }`}
                >
                  {role === 'user' && (
                    <div className="absolute top-3 right-3 text-[#7D53F6]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#7D53F6] flex items-center justify-center mb-3 font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-[#171923] text-base">User Role</h4>
                    <p className="text-xs text-[#667085] mt-1 font-medium">
                      Authorize payments, execute transactions via active agents, and manage payment history.
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold text-[#7D53F6] bg-[#DDD6FE] px-2.5 py-1 rounded-full w-max">
                    👤 Can Authorize Limits
                  </span>
                </div>

              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="ps-input has-icon-left text-xs"
                  required
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-[#171923] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="ps-input has-icon-left has-icon-right text-xs"
                  minLength={6}
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-6 border-t border-[#E6E8F0] text-center">
            <p className="text-xs text-[#667085]">
              Already registered?{' '}
              <button
                onClick={onNavigateLogin}
                className="font-bold text-[#7D53F6] hover:underline transition-all cursor-pointer"
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
