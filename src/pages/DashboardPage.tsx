import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Bookmark,
  Clock,
  ChevronRight,
  MapPin,
  Briefcase,
  Star,
} from 'lucide-react';

import { useAuthContext } from '../context/AuthContext';
import { useMentors, useSavedMentors, useMentorshipRequests } from '../hooks/useMentors';
import { supabase } from '../integrations/supabase';

import type { Profile, MentorshipRequest } from '../types';
import { formatDate, getInitials } from '../utils/helpers';

export function DashboardPage() {
  const { profile, isMentor } = useAuthContext();

  const userId = profile?.id || '';
  const role = isMentor ? 'mentor' : 'student';

  const [suggestedMentors, setSuggestedMentors] = useState<Profile[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const { mentors: allMentors } = useMentors();
  const { savedMentors } = useSavedMentors(userId);
  const { requests } = useMentorshipRequests(userId, role);

  // -------------------------
  // FETCH SUGGESTED MENTORS
  // -------------------------
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!profile || isMentor) {
        setLoadingSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .eq('mentorship_available', true)
        .limit(5);

      if (error) {
        setSuggestedMentors([]);
      } else {
        setSuggestedMentors((data as Profile[]) ?? []);
      }

      setLoadingSuggestions(false);
    };

    fetchSuggestions();
  }, [profile, isMentor]);

  // -------------------------
  // HARD GUARD: PROFILE NOT READY
  // -------------------------
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading dashboard...
      </div>
    );
  }

  // -------------------------
  // SAFE DATA
  // -------------------------
  const safeMentors = Array.isArray(allMentors) ? allMentors : [];
  const safeSaved = Array.isArray(savedMentors) ? savedMentors : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  const pendingRequests = safeRequests.filter(r => r.status === 'pending');
  const acceptedRequests = safeRequests.filter(r => r.status === 'accepted');

  // -------------------------
  // MENTOR DASHBOARD
  // -------------------------
  if (isMentor) {
    return <MentorDashboard requests={safeRequests} />;
  }

  // -------------------------
  // STUDENT DASHBOARD
  // -------------------------
  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-teal-100">
          Ready to find your next mentor?
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          icon={<Users />}
          label="Mentors"
          value={safeMentors.length}
        />

        <StatCard
          icon={<Clock />}
          label="Pending"
          value={pendingRequests.length}
        />

        <StatCard
          icon={<Star />}
          label="Connections"
          value={acceptedRequests.length}
        />

        <StatCard
          icon={<Bookmark />}
          label="Saved"
          value={safeSaved.length}
        />
      </div>

      {/* SUGGESTED MENTORS */}
      <Section title="Suggested Mentors" link="/mentors">
        {loadingSuggestions ? (
          <div>Loading...</div>
        ) : suggestedMentors.length > 0 ? (
          suggestedMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))
        ) : (
          <p className="text-slate-500">No mentors available</p>
        )}
      </Section>

      {/* SAVED MENTORS */}
      <Section title="Saved Mentors" link="/connections">
        {safeSaved.length > 0 ? (
          safeSaved.slice(0, 3).map((item) => (
            item.mentor && (
              <MentorCard key={item.id} mentor={item.mentor} />
            )
          ))
        ) : (
          <p className="text-slate-500">No saved mentors yet</p>
        )}
      </Section>

      {/* PENDING REQUESTS */}
      {pendingRequests.length > 0 && (
        <Section title="Pending Requests">
          {pendingRequests.slice(0, 3).map((req) => (
            <div key={req.id} className="p-3 border rounded-lg mb-2">
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

/* -------------------------
   UI COMPONENTS
-------------------------- */

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, link }: any) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
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

/* -------------------------
   MENTOR DASHBOARD
-------------------------- */

function MentorDashboard({ requests }: { requests: MentorshipRequest[] }) {
  const safeRequests = Array.isArray(requests) ? requests : [];
  const pending = safeRequests.filter(r => r.status === 'pending');

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Mentor Dashboard</h1>
      <p className="text-slate-600">
        Pending requests: {pending.length}
      </p>
    </div>
  );
}