// src/app/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LogOut, Menu, X, Settings, BarChart3, ClipboardList, Home } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-12 h-12 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-500">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: 'Shift Hub', href: '/dashboard/shift-hub', always: true },
    { icon: Settings, label: 'Admin Panel', href: '/dashboard/admin-panel', admin: true },
    { icon: BarChart3, label: 'Audit Ledger', href: '/dashboard/audit-ledger', always: true },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } sidebar-glass transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/20">
          <Link href="/dashboard/shift-hub" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-900">OpsFlow</h1>
                <p className="text-xs text-slate-500">Excellence</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            if (item.admin && userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
              return null;
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-700 hover:bg-white/30 hover:text-slate-900 transition-all duration-200 group"
              >
                <Icon size={20} className="text-blue-600 group-hover:text-blue-700" />
                {sidebarOpen && <span className="font-500">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/20 space-y-4">
            <div className="glass-card p-4">
              <p className="text-xs text-slate-500 font-600 mb-2 uppercase tracking-wide">Operator</p>
              <p className="font-700 text-slate-900 truncate">{userProfile?.full_name}</p>
              <p className="text-sm text-slate-600 mt-1">{userProfile?.department}</p>
              <div className="mt-3 inline-block">
                <span className="px-3 py-1 rounded-full text-xs font-600 bg-blue-100/60 text-blue-700">
                  {userProfile?.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-danger w-full flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex justify-center p-3 rounded-2xl hover:bg-white/30 transition-colors text-slate-700 hover:text-slate-900"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="header-glass p-6 border-b border-white/20">
          <h2 className="text-3xl font-bold gradient-text">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleString()}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
