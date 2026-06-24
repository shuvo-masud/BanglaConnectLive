import { useState, useEffect } from 'react';
import { HeadphonesIcon, Plus, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { SupportTicket } from '../types';

export function SupportPage() {
  const { profile } = useAuthContext();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [profile]);

  const fetchTickets = async () => {
    if (!profile) return;

    setLoading(true);
    const isAdmin = profile.role === 'admin';

    let query = supabase
      .from('support_tickets')
      .select('*, user:profiles!user_id(*), assignee:profiles!assigned_to(*)')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', profile.id);
    }

    const { data, error } = await query;
    if (!error && data) {
      setTickets(data as SupportTicket[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !subject.trim() || !description.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: profile.id,
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });

    if (!error) {
      setSubject('');
      setDescription('');
      setPriority('normal');
      setShowForm(false);
      fetchTickets();
    }
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-amber-100 text-amber-700',
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-slate-100 text-slate-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-slate-500',
      normal: 'text-blue-500',
      high: 'text-amber-500',
      urgent: 'text-red-500',
    };
    return colors[priority] || 'text-slate-500';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile?.role === 'admin' ? 'Support Inbox' : 'Help & Support'}
          </h1>
          <p className="text-slate-600 mt-1">
            {profile?.role === 'admin'
              ? 'Manage support tickets from users'
              : 'Get help when you need it'}
          </p>
        </div>
        {profile && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        )}
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Create Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <HeadphonesIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No support tickets yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority === 'high' || ticket.priority === 'urgent' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : null}
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ticket.description}</p>
                  {profile?.role === 'admin' && ticket.user && (
                    <p className="text-xs text-slate-500 mt-2">
                      From: {ticket.user.full_name} ({ticket.user.email})
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
