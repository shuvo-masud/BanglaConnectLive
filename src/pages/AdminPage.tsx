import { useState, useEffect } from 'react';
import { Users, UserCheck, HeadphonesIcon, Shield, CheckCircle, XCircle, Crown } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Profile, SupportTicket } from '../types';

export function AdminPage() {
  const { profile, isOwner, isActiveAdmin, approveUserRole, rejectUserRole } = useAuthContext();
  const [pendingMentors, setPendingMentors] = useState<Profile[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'mentors' | 'admins' | 'users' | 'tickets' | 'stats'>('mentors');
  const [loading, setLoading] = useState(true);

  const canAccess = isOwner || isActiveAdmin;

  useEffect(() => {
    if (canAccess) {
      fetchData();
    }
  }, [canAccess]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch pending mentors
    const { data: mentors } = await supabase
      .from('profiles')
      .select('*')
      .contains('roles', ['mentor'])
      .eq('mentor_status', 'pending')
      .order('created_at', { ascending: false });

    if (mentors) setPendingMentors(mentors as Profile[]);

    // Fetch pending admins (Owner only can see this)
    if (isOwner) {
      const { data: admins } = await supabase
        .from('profiles')
        .select('*')
        .contains('roles', ['admin'])
        .eq('admin_status', 'pending')
        .order('created_at', { ascending: false });

      if (admins) setPendingAdmins(admins as Profile[]);

      // Fetch all users for owner
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (users) setAllUsers(users as Profile[]);
    }

    // Fetch open tickets
    const { data: supportTickets } = await supabase
      .from('support_tickets')
      .select('*, user:profiles!user_id(*)')
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false });

    if (supportTickets) setTickets(supportTickets as SupportTicket[]);

    setLoading(false);
  };

  const handleMentorApproval = async (mentorId: string, approve: boolean) => {
    if (!isOwner) return;
    await (approve ? approveUserRole(mentorId, 'mentor') : rejectUserRole(mentorId, 'mentor'));
    fetchData();
  };

  const handleAdminApproval = async (adminId: string, approve: boolean) => {
    if (!isOwner) return;
    await (approve ? approveUserRole(adminId, 'admin') : rejectUserRole(adminId, 'admin'));
    fetchData();
  };

  const handleTicketStatus = async (ticketId: string, status: 'in_progress' | 'resolved') => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, assigned_to: profile?.id })
      .eq('id', ticketId);

    if (!error) {
      fetchData();
    }
  };

  const handleAssignRole = async (userId: string, role: 'mentor' | 'admin') => {
    if (!isOwner) return;

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const currentRoles = targetUser.roles || [];
    if (currentRoles.includes(role)) return;

    const newRoles = [...currentRoles, role];
    const statusField = role === 'mentor' ? 'mentor_status' : 'admin_status';

    const { error } = await supabase
      .from('profiles')
      .update({
        roles: newRoles,
        [statusField]: 'pending'
      })
      .eq('id', userId);

    if (!error) {
      fetchData();
    }
  };

  if (!canAccess) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {isOwner && <Crown className="w-6 h-6 text-amber-500" />}
          <h1 className="text-2xl font-bold text-slate-900">
            {isOwner ? 'Owner Dashboard' : 'Admin Dashboard'}
          </h1>
        </div>
        <p className="text-slate-600 mt-1">
          {isOwner ? 'Full platform control and approval authority' : 'Manage mentors and support tickets'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingMentors.length}</p>
              <p className="text-sm text-slate-600">Pending Mentors</p>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingAdmins.length}</p>
                <p className="text-sm text-slate-600">Pending Admins</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HeadphonesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
              <p className="text-sm text-slate-600">Open Tickets</p>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{allUsers.length}</p>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mentors')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'mentors'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Mentor Approvals ({pendingMentors.length})
        </button>
        {isOwner && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'admins'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Approvals ({pendingAdmins.length})
          </button>
        )}
        {isOwner && (
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            All Users
          </button>
        )}
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeadphonesIcon className="w-4 h-4" />
          Support Tickets ({tickets.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mentors Tab */}
          {activeTab === 'mentors' && (
            <div>
              {pendingMentors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No pending mentor applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMentors.map((mentor) => (
                    <UserApprovalCard
                      key={mentor.id}
                      user={mentor}
                      type="mentor"
                      onApprove={() => handleMentorApproval(mentor.id, true)}
                      onReject={() => handleMentorApproval(mentor.id, false)}
                      canApprove={isOwner}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && isOwner && (
            <div>
              {pendingAdmins.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No pending admin applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAdmins.map((admin) => (
                    <UserApprovalCard
                      key={admin.id}
                      user={admin}
                      type="admin"
                      onApprove={() => handleAdminApproval(admin.id, true)}
                      onReject={() => handleAdminApproval(admin.id, false)}
                      canApprove={isOwner}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'users' && isOwner && (
            <div className="space-y-2">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex gap-1 mt-1">
                      {(user.roles || []).map((r) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            r === 'owner' ? 'bg-amber-100 text-amber-700' :
                            r === 'admin' ? 'bg-purple-100 text-purple-700' :
                            r === 'mentor' ? 'bg-teal-100 text-teal-700' :
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r}
                          {r === 'mentor' && user.mentor_status !== 'approved' && ` (${user.mentor_status || 'pending'})`}
                          {r === 'admin' && user.admin_status !== 'approved' && ` (${user.admin_status || 'pending'})`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!user.roles?.includes('mentor') && (
                      <button
                        onClick={() => handleAssignRole(user.id, 'mentor')}
                        className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
                      >
                        + Mentor
                      </button>
                    )}
                    {!user.roles?.includes('admin') && (
                      <button
                        onClick={() => handleAssignRole(user.id, 'admin')}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        + Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              {tickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <HeadphonesIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No open support tickets</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-xl border border-slate-200 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              ticket.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                          <p className="text-sm text-slate-600 mt-1">{ticket.description}</p>
                          {ticket.user && (
                            <p className="text-xs text-slate-500 mt-2">
                              From: {ticket.user.full_name} ({ticket.user.email})
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {ticket.status === 'open' && (
                            <button
                              onClick={() => handleTicketStatus(ticket.id, 'in_progress')}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              Take
                            </button>
                          )}
                          <button
                            onClick={() => handleTicketStatus(ticket.id, 'resolved')}
                            className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// User Approval Card Component
function UserApprovalCard({
  user,
  type,
  onApprove,
  onReject,
  canApprove,
}: {
  user: Profile;
  type: 'mentor' | 'admin';
  onApprove: () => void;
  onReject: () => void;
  canApprove: boolean;
}) {
  const Icon = type === 'mentor' ? Users : Shield;
  const colorClass = type === 'mentor' ? 'teal' : 'purple';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 text-${colorClass}-600`} />
            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${colorClass}-100 text-${colorClass}-700`}>
              Pending {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900">{user.full_name}</h3>
          <p className="text-sm text-slate-600">{user.email}</p>
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-slate-700">
              <span className="font-medium">Country:</span> {user.country_of_residence}
            </p>
            {type === 'mentor' && user.specialty && user.specialty.length > 0 && (
              <p className="text-slate-700">
                <span className="font-medium">Specialties:</span> {user.specialty.join(', ')}
              </p>
            )}
            {user.bio && (
              <p className="text-slate-700">
                <span className="font-medium">Bio:</span> {user.bio}
              </p>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Applied: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
        {canApprove && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
