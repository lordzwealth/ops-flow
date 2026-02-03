'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Loader2, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-blue-900/10" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50">
              <Zap className="text-slate-950" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-brand mb-2">OpsFlow</h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Operational Excellence</p>
        </div>

        {/* Login Card */}
        <div className="card-lg mb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="input pl-12"
                  required
                  disabled={loading || !supabase}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-12 pr-12"
                  required
                  disabled={loading || !supabase}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  disabled={loading || !supabase}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-600/10 border border-red-600/30 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password || !supabase}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {!supabase || loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loading ? 'Signing in...' : 'Loading...'}
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-6" />

          {/* Register Link */}
          <p className="text-center text-slate-400 text-sm">
            Need an account?{' '}
            <Link href="/register" className="text-brand font-semibold hover:text-cyan-300 transition-colors">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs">
          © 2026 OpsFlow. All Operational Routine Logged & Audited.
        </p>
      </div>
    </div>
  );
}
