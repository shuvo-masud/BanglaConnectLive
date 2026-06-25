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
} from 'lucide-react';

import { useAuthContext } from '../context/AuthContext';
import { useMentors, useSavedMentors, useMentorshipRequests } from '../hooks/useMentors';
import { supabase } from '../integrations/supabase';

import type { Profile, MentorshipRequest } from '../types';
import { formatDate, getInitials } from '../utils/helpers';

export function DashboardPage() {
  const { profile, activeRoles, isOwner, isActiveAdmin, isActiveMentor } = useAuthContext();

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

  // FETCH SUGGESTIONS
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!profile || isMentor) {
        setLoadingSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .eq('mentorship_available', true)
        .limit(5);

      setSuggestedMentors((data as Profile[]) ?? []);
      setLoadingSuggestions(false);
    };

    fetchSuggestions();
  }, [profile, isMentor]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading dashboard...
      </div>
    );
  }

  const safeMentors = Array.isArray(allMentors) ? allMentors : [];
  const safeSaved = Array.isArray(savedMentors) ? savedMentors : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  const pendingRequests = safeRequests.filter(r => r.status === 'pending');
  const acceptedRequests = safeRequests.filter(r => r.status === 'accepted');

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {profile.full_name || 'User'}
        </h1>

        <p className="text-slate-600 text-sm mt-1">
          Roles: {roles.join(', ')}
        </p>
      </div>

      {/* ================= ROLE CARDS (YOUR FIRST DASHBOARD) ================= */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">

        {isStudent && (
          <div className="bg-white p-5 rounded-xl border">
            <BookOpen className="w-6 h-6 text-teal-600 mb-2" />
            <h2 className="font-semibold">Learning Dashboard</h2>
            <p className="text-sm text-slate-600">Continue your learning journey</p>
          </div>
        )}

        {isMentor && (
          <div className="bg-white p-5 rounded-xl border">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <h2 className="font-semibold">Mentor Panel</h2>
            <p className="text-sm text-slate-600">Manage students & sessions</p>
          </div>
        )}

        {isAdmin && (
          <div className="bg-white p-5 rounded-xl border">
            <Shield className="w-6 h-6 text-amber-600 mb-2" />
            <h2 className="font-semibold">Admin Panel</h2>
            <p className="text-sm text-slate-600">Manage platform & users</p>
          </div>
        )}

        <div className="bg-white p-5 rounded-xl border">
          <UserCheck className="w-6 h-6 text-blue-600 mb-2" />
          <h2 className="font-semibold">Profile Status</h2>
          <p className="text-sm text-slate-600">
            {profile?.mentor_status === 'pending'
              ? 'Mentor approval pending'
              : 'Active'}
          </p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard icon={<Users />} label="Mentors" value={safeMentors.length} />
        <StatCard icon={<Clock />} label="Pending" value={pendingRequests.length} />
        <StatCard icon={<Star />} label="Connections" value={acceptedRequests.length} />
        <StatCard icon={<Bookmark />} label="Saved" value={safeSaved.length} />

      </div>

      {/* ================= SUGGESTED ================= */}
      <Section title="Suggested Mentors" link="/mentors">
        {loadingSuggestions ? (
          <p>Loading...</p>
        ) : suggestedMentors.length ? (
          suggestedMentors.map((m) => <MentorCard key={m.id} mentor={m} />)
        ) : (
          <p className="text-slate-500">No mentors available</p>
        )}
      </Section>

      {/* ================= SAVED ================= */}
      <Section title="Saved Mentors" link="/connections">
        {safeSaved.length ? (
          safeSaved.slice(0, 3).map((item) =>
            item.mentor ? <MentorCard key={item.id} mentor={item.mentor} /> : null
          )
        ) : (
          <p className="text-slate-500">No saved mentors</p>
        )}
      </Section>

      {/* ================= PENDING REQUESTS ================= */}
      {pendingRequests.length > 0 && (
        <Section title="Pending Requests">
          {pendingRequests.slice(0, 3).map((req) => (
            <div key={req.id} className="p-3 border rounded-lg">
              <p className="font-medium">
                Request to {req.mentor?.full_name || 'Mentor'}
              </p>
              <p className="text-sm text-slate-500">
                {formatDate(req.created_at)}
              </p>
            </div>
          ))}
        </Section>
      )}

    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Section({ title, children, link }: any) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden max-w-6xl mx-auto">
      <div className="flex justify-between p-4 border-b">
        <h2 className="font-semibold">{title}</h2>
        {link && (
          <Link to={link} className="text-teal-600 flex items-center gap-1">
            View <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function MentorCard({ mentor }: { mentor: Profile }) {
  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50"
    >
      <div className="w-10 h-10 bg-teal-600 text-white flex items-center justify-center rounded-full">
        {getInitials(mentor.full_name)}
      </div>
      <div>
        <p className="font-medium">{mentor.full_name}</p>
        <p className="text-sm text-slate-500">
          {mentor.job_title || mentor.professional_field}
        </p>
      </div>
    </Link>
  );
}

function MentorDashboard({ requests }: { requests: MentorshipRequest[] }) {
  const pending = requests.filter(r => r.status === 'pending');
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Mentor Dashboard</h1>
      <p className="text-slate-600">Pending requests: {pending.length}</p>
    </div>
  );
}