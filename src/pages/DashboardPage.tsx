import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Bookmark,
  Clock,
  ChevronRight,
  Star,
  BookOpen,
  Shield,
  UserCheck,
  Zap,
  ArrowUpRight,
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Calendar,
  Settings
} from 'lucide-react';

import { useAuthContext } from '../context/AuthContext';
import { useMentors, useSavedMentors, useMentorshipRequests } from '../hooks/useMentors';
import { supabase } from '../integrations/supabase';

import type { Profile } from '../types';
import { formatDate, getInitials } from '../utils/helpers';

export function DashboardPage() {
  const { profile, activeRoles, isOwner, isActiveAdmin } = useAuthContext();
  const userId = profile?.id || '';

  const roles = activeRoles?.length ? activeRoles : ['student'];
  const isStudent = roles.includes('student');
  const isMentor = roles.includes('mentor');
  const isAdmin = roles.includes('admin') || isOwner || isActiveAdmin;

  const [suggestedMentors, setSuggestedMentors] = useState<Profile[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const { mentors: allMentors } = useMentors();
  const { savedMentors } = useSavedMentors(userId);
  const { requests } = useMentorshipRequests(userId, isMentor ? 'mentor' : 'student');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!profile || isMentor) {
        setLoadingSuggestions(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .eq('mentorship_available', true)
        .limit(3);

      setSuggestedMentors((data as Profile[]) ?? []);
      setLoadingSuggestions(false);
    };
    fetchSuggestions();
  }, [profile, isMentor]);

  if (!profile) return <DashboardSkeleton />;

  const safeRequests = Array.isArray(requests) ? requests : [];
  const pendingRequests = safeRequests.filter(r => r.status === 'pending');
  const acceptedRequests = safeRequests.filter(r => r.status === 'accepted');

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* 1. TOP WELCOME SECTION */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-600/20">
                {getInitials(profile.full_name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.full_name.split(' ')[0]}!</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {profile.role}
                  </span>
                  <span className="text-slate-400 text-sm">•</span>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Profile 80% Complete
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/vault/create" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm">
                <Zap className="w-5 h-5" />
              </Link>
              <Link to="/profile" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                <Settings className="w-4 h-4" /> Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* 2. STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Mentors" value={allMentors?.length || 0} color="teal" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Requests" value={pendingRequests.length} color="amber" />
          <StatCard icon={<Star className="w-5 h-5" />} label="Active Connections" value={acceptedRequests.length} color="blue" />
          <StatCard icon={<Bookmark className="w-5 h-5" />} label="Saved Profiles" value={savedMentors?.length || 0} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3. MAIN CONTENT (LEFT 2 COLS) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions / Role Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isStudent && (
                <Link to="/mentors" className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-400 transition-all shadow-sm">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Learning Hub</h3>
                  <p className="text-slate-500 text-sm mt-1">Explore mentors and start your journey.</p>
                </Link>
              )}
              {isMentor && (
                <Link to="/events/create" className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-400 transition-all shadow-sm">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Mentor Panel</h3>
                  <p className="text-slate-500 text-sm mt-1">Host a session or manage requests.</p>
                </Link>
              )}
              <Link to="/vault" className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Project Vault</h3>
                <p className="text-slate-500 text-sm mt-1">View your saved projects and work.</p>
              </Link>
              {isAdmin && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                  <Shield className="w-12 h-12 text-amber-200 absolute -right-2 -bottom-2" />
                  <h3 className="font-bold text-amber-900 text-lg">Admin Control</h3>
                  <p className="text-amber-700 text-sm mt-1">System wide management active.</p>
                </div>
              )}
            </div>

            {/* Pending Requests List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900">Active Requests</h2>
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">{pendingRequests.length}</span>
              </div>
              <div className="p-2">
                {pendingRequests.length > 0 ? (
                  pendingRequests.slice(0, 3).map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                          {getInitials(req.mentor?.full_name || 'M')}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">Request to {req.mentor?.full_name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(req.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-full">Pending</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No pending mentorship requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. SIDEBAR (RIGHT 1 COL) */}
          <div className="space-y-6">
            {/* Suggested Mentors */}
            {!isMentor && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Suggested Mentors</h2>
                </div>
                <div className="p-4 space-y-4">
                  {loadingSuggestions ? (
                    [1, 2].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)
                  ) : suggestedMentors.map((m) => (
                    <MentorRow key={m.id} mentor={m} />
                  ))}
                  <Link to="/mentors" className="block text-center text-sm font-bold text-teal-600 hover:text-teal-700 py-2 border-2 border-dashed border-teal-50 rounded-xl hover:border-teal-200 transition-all">
                    Discover More
                  </Link>
                </div>
              </div>
            )}

            {/* Saved Items Summary */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20">
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-3">
                <QuickLink icon={<Briefcase />} label="Job Board" path="/jobs" />
                <QuickLink icon={<Calendar />} label="Events" path="/events" />
                <QuickLink icon={<Bookmark />} label="Saved Mentors" path="/connections" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <div className={`p-3 rounded-xl border ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

function MentorRow({ mentor }: { mentor: Profile }) {
  return (
    <Link to={`/mentors/${mentor.id}`} className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all">
      <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
        {getInitials(mentor.full_name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 truncate">{mentor.full_name}</p>
        <p className="text-xs text-slate-500 truncate">{mentor.job_title || mentor.professional_field}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600" />
    </Link>
  );
}

function QuickLink({ icon, label, path }: any) {
  return (
    <Link to={path} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}