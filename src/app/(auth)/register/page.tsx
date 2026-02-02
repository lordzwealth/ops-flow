'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Disbursement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Initializing...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">OpsFlow</h1>
          <p className="text-gray-400 text-sm">Routine Excellence • Forensic Precision</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-cyan-500 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Register</h2>

          {success ? (
            <div className="p-4 rounded bg-green-900 border border-green-600 text-green-300 text-center">
              ✅ Account created! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                  required
                  disabled={loading || !supabase}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@example.com"
                  className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                  required
                  disabled={loading || !supabase}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition"
                  required
                  disabled={loading || !supabase}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-700 border border-gray-600 rounded px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition"
                  disabled={loading || !supabase}
                >
                  <option value="Disbursement">Disbursement</option>
                  <option value="Repayment">Repayment</option>
                  <option value="Operational Excellence">Operational Excellence</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded bg-red-900 border border-red-600 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password || !fullName || !supabase}
                className="w-full px-4 py-3 rounded font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:bg-gray-600 disabled:cursor-not-allowed mt-6"
              >
                {!supabase ? 'Loading...' : loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}

          <p className="text-gray-400 text-sm mt-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Login here
            </Link>
          </p>
        </div>

        <p className="text-gray-500 text-xs text-center mt-8">
          © 2026 OpsFlow. All operations logged & audited.
        </p>
      </div>
    </div>
  );
}
