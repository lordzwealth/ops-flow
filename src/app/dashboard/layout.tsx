// src/app/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LogOut, Menu, X, Settings, BarChart3, Zap, User, ChevronDown } from 'lucide-react';

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
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-500 mx-auto mb-4 spinner" />
          <p className="text-slate-400 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: Zap, label: 'Shift Hub', href: '/dashboard/shift-hub', always: true },
    { icon: Settings, label: 'Admin Panel', href: '/dashboard/admin-panel', admin: true },
    { icon: BarChart3, label: 'Audit Ledger', href: '/dashboard/audit-ledger', always: true },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } sidebar-base transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/dashboard/shift-hub" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
              <Zap className="text-slate-950 w-6 h-6" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-100">OpsFlow</h1>
                <p className="text-xs text-slate-500">Operators</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            if (item.admin && userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
              return null;
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item group"
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {sidebarOpen && userProfile && (
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="card bg-slate-800/50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 text-sm truncate">
                      {userProfile.full_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{userProfile.department}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  <span className={`badge ${userProfile.role === 'super_admin' ? 'badge-danger' : 'badge-info'}`}>
                    {userProfile.role === 'super_admin' ? '👑 Super Admin' : userProfile.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-danger w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
        {/* Header with Mobile Logout */}
        <div className="header-base p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-brand">Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleString()}</p>
          </div>
          
          {/* Mobile User Menu */}
          {!sidebarOpen && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 card shadow-2xl z-50">
                  <div className="space-y-3">
                    <div className="pb-3 border-b border-slate-700">
                      <p className="font-semibold text-slate-100 text-sm">{userProfile?.full_name}</p>
                      <p className="text-xs text-slate-400">{userProfile?.department}</p>
                      <p className="text-xs text-cyan-400 mt-1">{userProfile?.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="btn btn-danger w-full flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
