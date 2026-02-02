// src/app/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
        
        // Get user profile from database
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-cyan-500 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-cyan-500">
          <h1 className={`font-bold text-cyan-400 ${sidebarOpen ? 'text-2xl' : 'text-xs'}`}>
            {sidebarOpen ? 'OpsFlow' : 'OF'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/shift-hub"
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-800 transition"
          >
            <span className="text-xl">🚀</span>
            {sidebarOpen && <span>Shift Hub</span>}
          </Link>

          {userProfile?.role === 'admin' || userProfile?.role === 'super_admin' ? (
            <Link
              href="/dashboard/admin-panel"
              className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-800 transition"
            >
              <span className="text-xl">⚙️</span>
              {sidebarOpen && <span>Admin Panel</span>}
            </Link>
          ) : null}

          <Link
            href="/dashboard/audit-ledger"
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-800 transition"
          >
            <span className="text-xl">📋</span>
            {sidebarOpen && <span>Audit Ledger</span>}
          </Link>
        </nav>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-cyan-500 space-y-3">
            <div className="bg-slate-800 p-3 rounded">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="font-bold text-cyan-300 text-sm truncate">{userProfile?.full_name}</p>
              <p className="text-xs text-gray-500">{userProfile?.department}</p>
              <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">{userProfile?.role}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-red-900 hover:bg-red-800 transition text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <div className="p-4 border-t border-cyan-500">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex justify-center p-2 rounded hover:bg-slate-800 transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-cyan-500 px-6 py-4">
          <h2 className="text-2xl font-bold text-cyan-400">OpsFlow Dashboard</h2>
          <p className="text-sm text-gray-400">{new Date().toLocaleString()}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
