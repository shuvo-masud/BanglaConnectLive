import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, User, Bookmark, LogOut, Menu, X, Globe,
  Briefcase, FileText, Calendar, MessageCircle, Folder,
  HeadphonesIcon, Shield, AlertTriangle, Crown, Clock
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut, isOwner, isActiveAdmin, pendingMentorApproval, pendingAdminApproval } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setSidebarOpen(false); // important

    navigate('/', { replace: true });

    window.location.reload(); // ensures auth state reset
  };

  // Core BanglaConnect navigation
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'Messages', path: '/chats' },
    { icon: AlertTriangle, label: 'Emergency', path: '/emergency-aid' },
  ];

  // Community & Career
  const secondaryNav = [
    { icon: Users, label: 'Find Mentors', path: '/mentors' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: FileText, label: 'Blogs', path: '/blogs' },
  ];

  // Personal
  const personalNav = [
    { icon: Bookmark, label: 'Connections', path: '/connections' },
    { icon: Folder, label: 'Vault', path: '/vault' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: HeadphonesIcon, label: 'Support', path: '/support' },
  ];

  // Admin link for active admins or owner
  if (isActiveAdmin || isOwner) {
    personalNav.push({
      icon: isOwner ? Crown : Shield,
      label: isOwner ? 'Owner Dashboard' : 'Admin',
      path: '/admin'
    });
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col -gap-1">
              <span className="font-semibold text-sm text-slate-800 leading-tight">BanglaConnect</span>
              <span className="text-[8px] text-teal-600 italic leading-tight">Opportunities multiply</span>
            </div>
          </Link>
          <button
            className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-4 overflow-y-auto h-[calc(100vh-168px)]">
          {/* Pending Approval Alerts */}
          {(pendingMentorApproval || pendingAdminApproval) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Pending Approvals</span>
              </div>
              {pendingMentorApproval && (
                <p className="text-xs text-amber-700">Your mentor application is under review</p>
              )}
              {pendingAdminApproval && (
                <p className="text-xs text-amber-700">Your admin application is under review</p>
              )}
            </div>
          )}

          {/* Core Nav */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-2" />

          {/* Community & Career */}
          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-2" />

          {/* Personal Nav */}
          <div className="space-y-1">
            {personalNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? item.path === '/admin'
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.path === '/admin' ? 'text-purple-600' : ''}`} />
                <span className="text-sm">{item.label}</span>
                {item.path === '/admin' && isOwner && (
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Owner</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 bg-white">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">BanglaConnect</span>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-3 ml-auto group"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                {profile?.full_name}
              </span>
              {isOwner && (
                <span className="text-xs text-amber-600 font-medium">Owner</span>
              )}
            </div>
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-9 h-9 object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || 'U'
              )}
              {isOwner && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
