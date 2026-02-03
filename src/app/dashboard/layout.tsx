// src/app/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LogOut, Menu, X, Settings, BarChart3, Zap, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {// src/app/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { LogOut, Menu, X, Settings, BarChart3, Zap, User } from 'lucide-react';

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
        // Get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (isMounted) {
            router.push('/login');
          }
          return;
        }

        // Get user info
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            router.push('/login');
          }
          return;
        }

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, full_name, role, department_id, is_active')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          if (isMounted) {
            router.push('/login');
          }
          return;
        }

        if (isMounted && profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          router.push('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Cleanup
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-500 mx-auto mb-4 spinner" />
          <p className="text-slate-400 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-4">Failed to load profile</p>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-primary"
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
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} sidebar-base transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
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
            if (item.admin && !isAdmin) return null;

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
        <div className="p-4 border-t border-slate-800 flex-shrink-0 space-y-3">
          {sidebarOpen ? (
            <>
              <div className="card bg-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 text-sm truncate">
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {userProfile?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {userProfile?.role && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className={`badge ${
                      userProfile.role === 'super_admin' 
                        ? 'bg-red-600/20 text-red-400 border-red-600/50' 
                        : 'badge-info'
                    }`}>
                      {userProfile.role === 'super_admin' ? '👑 Super Admin' : userProfile.role}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger w-full flex items-center justify-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="btn btn-danger w-full flex items-center justify-center p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
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
        {/* Header */}
        <div className="header-base p-6 border-b border-slate-800">
          <h2 className="text-3xl font-bold text-brand">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleString()}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setError(null);
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error('Auth error:', authError);
          router.push('/login');
          return;
        }

        setUser(authUser);
        console.log('Auth user:', authUser.id, authUser.email);
        
        // Fetch user profile from public.users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError(`Profile error: ${profileError.message}`);
          // Don't redirect, just show the error
          return;
        }

        if (!profile) {
          console.error('No profile found for user:', authUser.id);
          setError('No profile found. Please register properly.');
          return;
        }

        console.log('Profile loaded:', profile);
        setUserProfile(profile);
        
      } catch (error: any) {
        console.error('Unexpected auth error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } sidebar-base transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
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
            if (item.admin && !isAdmin) {
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

        {/* User Profile Card */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          {error ? (
            <div className="card bg-red-900/20 border-red-600/30 text-red-400 text-xs p-3">
              {error}
            </div>
          ) : userProfile ? (
            sidebarOpen ? (
              <>
                <div className="card bg-slate-800/50 mb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-sm truncate">
                        {userProfile.full_name || 'User'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {userProfile.department || 'No Department'}
                      </p>
                    </div>
                  </div>
                  
                  {userProfile.role && (
                    <div className="pt-2 border-t border-slate-700">
                      <span className={`badge ${
                        userProfile.role === 'super_admin' 
                          ? 'bg-red-600/20 text-red-400 border-red-600/50' 
                          : 'badge-info'
                      }`}>
                        {userProfile.role === 'super_admin' ? '👑 Super Admin' : userProfile.role}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger w-full flex items-center justify-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="btn btn-danger w-full flex items-center justify-center p-2 rounded-xl"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )
          ) : (
            <div className="text-slate-400 text-xs text-center py-2">
              Loading profile...
            </div>
          )}
        </div>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
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
        {/* Header */}
        <div className="header-base p-6 border-b border-slate-800">
          <h2 className="text-3xl font-bold text-brand">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleString()}</p>
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
