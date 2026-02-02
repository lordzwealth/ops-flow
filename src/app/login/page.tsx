// src/app/(auth)/login/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Redirect to dashboard
      router.push('/dashboard/shift-hub');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">OpsFlow</h1>
          <p className="text-gray-400 text-sm">Routine Excellence • Forensic Precision</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg border border-cyan-500 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@example.com"
                className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded bg-red-900 border border-red-600 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full btn-primary py-3 mt-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-gray-400 text-sm mt-6 text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center mt-8">
          © 2026 OpsFlow. All operations logged & audited.
        </p>
      </div>
    </div>
  );
}
