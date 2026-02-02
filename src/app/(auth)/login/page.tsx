'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Initializing...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      router.push('/dashboard/shift-hub');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-white">O</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">OpsFlow</h1>
          <p className="text-slate-500 text-sm tracking-wide uppercase">Operational Excellence Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 mb-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-600 text-slate-700 mb-3">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="input-glass pl-12"
                  required
                  disabled={loading || !supabase}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-600 text-slate-700 mb-3">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-12 pr-12"
                  required
                  disabled={loading || !supabase}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  disabled={loading || !supabase}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-100/60 backdrop-blur border border-red-200/40 text-red-700 text-sm font-500">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !password || !supabase}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {!supabase || loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {loading ? 'Securing...' : 'Loading...'}
                </>
              ) : (
                'SECURE LOGIN'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-glass my-6"></div>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-600">
            Need unit access?{' '}
            <Link href="/register" className="font-600 text-blue-600 hover:text-blue-700 transition-colors">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          © 2026 OpsFlow. All operations logged & audited.
        </p>
      </div>
    </div>
  );
}
