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
  const [supabase] = useState(() => createClient());
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (isMounted) router.push('/login');
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, full_name, role, department_id, is_active')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          if (isMounted) router.push('/login');
          return;
        }

        if (isMounted && profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) router.push('/login');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4 spinner" />
          <p className="text-slate-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Failed to load profile</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: Zap, label: 'Shift Hub', href: '/dashboard/shift-hub', always: true },
    { icon: Settings, label: 'Admin Panel', href: '/dashboard/admin-panel', admin: true },
    { icon: BarChart3, label: 'Audit Ledger', href: '/dashboard/audit-ledger', always: true },
  ];

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} sidebar transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-100">
          <Link href="/dashboard/shift-hub" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-blue">
              <Zap className="text-white w-6 h-6" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk' }}>OpsFlow</h1>
                <p className="text-xs text-slate-500">Operations</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            if (item.admin && !isAdmin) return null;

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-blue-100 flex-shrink-0 space-y-3">
          {sidebarOpen ? (
            <>
              <div className="card-md bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {userProfile?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {userProfile?.role && (
                  <div className="pt-2 border-t border-blue-200 flex gap-2">
                    <span className={`badge ${
                      userProfile.role === 'super_admin' 
                        ? 'badge-danger' 
                        : 'badge-primary'
                    }`}>
                      {userProfile.role === 'super_admin' ? '👑 Admin' : userProfile.role}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="btn-danger w-full flex items-center justify-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="btn-danger w-full flex items-center justify-center p-2 rounded-xl"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-blue-100 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-blue-100 transition-colors text-slate-600 hover:text-blue-600"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="header p-8 border-b border-blue-100">
          <h2 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>Dashboard</h2>
          <p className="text-slate-600 text-sm">{new Date().toLocaleString()}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="container-max">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
