import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  HeadphonesIcon,
  Shield,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Profile, SupportTicket } from '../types';

export function AdminPage() {
  const {
    profile,
    isOwner,
    isActiveAdmin,
    approveUserRole,
    rejectUserRole
  } = useAuthContext();

  // =========================
  // STATES
  // =========================
  const [pendingMentors, setPendingMentors] = useState<Profile[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [mentors, setMentors] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);

  const [stats, setStats] = useState({
    users: 0,
    mentors: 0,
    admins: 0,
    tickets: 0
  });

  const [activeTab, setActiveTab] = useState<
    'mentors' | 'admins' | 'users' | 'tickets' | 'emergencies' | 'stats'
  >('mentors');

  const [loading, setLoading] = useState(true);

  const canAccess = isOwner || isActiveAdmin;

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    setLoading(true);

    try {
      // USERS (for stats)
      const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

      const users = usersData || [];
      setAllUsers(users);

      // FILTERS
      const UsersList = users.filter(u =>
        u.roles?.includes('student, mentor, admin')
      );

      const mentorsList = users.filter(u =>
        u.roles?.includes('mentor')
      );

      const adminsList = users.filter(u =>
        u.roles?.includes('admin')
      );

      setMentors(mentorsList);
      setAdmins(adminsList);

      // SUPPORT TICKETS (FULL LIST)
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*, user:profiles!user_id(*)');

      const ticketsFinal = ticketsData || [];

      setTickets(ticketsFinal);
      setAllTickets(ticketsFinal);

      // EMERGENCIES
      const { data: emergencyData } = await supabase
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false });

      setEmergencies(emergencyData || []);

      // STATS
      setStats({
        users: users.length,
        mentors: mentorsList.length,
        admins: adminsList.length,
        tickets: ticketsFinal.length
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) fetchData();
  }, [canAccess]);

  // =========================
  // ACTIONS (UNCHANGED)
  // =========================
  const handleMentorApproval = async (id: string, approve: boolean) => {
    if (!isOwner) return;

    await (approve
      ? approveUserRole(id, 'mentor')
      : rejectUserRole(id, 'mentor'));

    fetchData();
  };

  const handleAdminApproval = async (id: string, approve: boolean) => {
    if (!isOwner) return;

    await (approve
      ? approveUserRole(id, 'admin')
      : rejectUserRole(id, 'admin'));

    fetchData();
  };

  const handleTicketStatus = async (
    ticketId: string,
    status: 'in_progress' | 'resolved'
  ) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, assigned_to: profile?.id })
      .eq('id', ticketId);

    if (!error) fetchData();
  };

  const handleAssignRole = async (userId: string, role: 'mentor' | 'admin') => {
    if (!isOwner) return;

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const currentRoles = targetUser.roles || [];

    if (currentRoles.includes(role)) return;

    const statusField = role === 'mentor' ? 'mentor_status' : 'admin_status';

    await supabase
      .from('profiles')
      .update({
        roles: [...currentRoles, role],
        [statusField]: 'pending'
      })
      .eq('id', userId);

    fetchData();
  };

  // =========================
  // ACCESS CHECK
  // =========================
  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-6xl mx-auto">

      <div className="mb-6 flex items-center gap-2">
        {isOwner && <Crown className="text-amber-500" />}
        <h1 className="text-2xl font-bold">
          {isOwner ? 'Owner Dashboard' : 'Admin Dashboard'}
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b">

        <button onClick={() => setActiveTab('mentors')}>
          Mentors ({mentors.length})
        </button>

        {isOwner && (
          <button onClick={() => setActiveTab('admins')}>
            Admins ({admins.length})
          </button>
        )}

        {isOwner && (
          <button onClick={() => setActiveTab('users')}>
            Users ({stats.users})
          </button>
        )}

        <button onClick={() => setActiveTab('tickets')}>
          Tickets ({stats.tickets})
        </button>

        <button onClick={() => setActiveTab('emergencies')}>
          🚨 Emergencies ({emergencies.length})
        </button>

        <button onClick={() => setActiveTab('stats')}>
          📊 Stats
        </button>

      </div>

      {loading && (
        <div className="py-10 text-center">Loading...</div>
      )}

      {/* MENTORS */}
      {activeTab === 'mentors' && (
        <div className="space-y-3">
          {mentors.map(m => (
            <div key={m.id} className="p-4 border rounded">
              <p>{m.name || m.email}</p>
            </div>
          ))}
        </div>
      )}

      {/* ADMINS */}
      {activeTab === 'admins' && (
        <div className="space-y-3">
          {admins.map(a => (
            <div key={a.id} className="p-4 border rounded">
              <p>{a.name || a.email}</p>
            </div>
          ))}
        </div>
      )}

      {/* TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {allTickets.map(t => (
            <div key={t.id} className="p-4 border rounded">
              <p className="font-semibold">{t.subject}</p>
              <p>{t.message}</p>
              <p className="text-sm text-gray-500">{t.status}</p>
            </div>
          ))}
        </div>
      )}

      {/* EMERGENCIES */}
      {activeTab === 'emergencies' && (
        <div className="space-y-3">
          {emergencies.map(e => (
            <div key={e.id} className="p-4 border rounded">
              <p className="font-semibold">{e.message}</p>
              <p className="text-sm text-gray-500">
                Priority: {e.priority || 'standard'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* STATS */}
      {activeTab === 'stats' && (
        <div className="p-4 border rounded space-y-2">
          <p>Users: {stats.users}</p>
          <p>Mentors: {stats.mentors}</p>
          <p>Admins: {stats.admins}</p>
          <p>Tickets: {stats.tickets}</p>
        </div>
      )}

    </div>
  );
}