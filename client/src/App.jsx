import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { Loader2, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Verifying PaySentinel session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return view === 'login' ? (
      <Login onNavigateRegister={() => setView('register')} />
    ) : (
      <Register onNavigateLogin={() => setView('login')} />
    );
  }

  return <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
