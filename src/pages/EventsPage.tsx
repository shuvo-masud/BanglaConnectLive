import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Plus, Clock, Video, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Event } from '../types';

export function EventsPage() {
  const { profile } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Permission check: Only Mentors or Admins
  const canCreateEvent = profile?.role === 'mentor' || profile?.role === 'admin';

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const fetchEvents = async () => {
    setLoading(true);
    // Note: Profiles join assumes 'organizer_id' is the foreign key name
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id (
          full_name,
          role
        )
      `)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEvents(data as any[]);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Events</h1>
          <p className="text-slate-600 mt-1">Join live workshops, webinars, and networking sessions</p>
        </div>
        
        {/* Only show "Create Event" to Mentors and Admins */}
        {canCreateEvent && (
          <Link
            to="/events/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search workshops, topics, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">Upcoming Events:</span>
          <span className="font-bold text-teal-600">{events.length}</span>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No events found</h3>
          <p className="text-slate-500">Check back later for new workshops and sessions.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-teal-400 hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur text-slate-900 shadow-sm">
                    {event.category}
                  </span>
                  {event.is_live && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-3 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-teal-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>{formatDate(event.event_date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-teal-600">
                      {event.is_online ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <span className="truncate">{event.is_online ? 'Online Session' : event.location}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-teal-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>
                      {event.attendee_count} {event.max_attendees ? `/ ${event.max_attendees}` : ''} registered
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      By {(event as any).organizer?.full_name || 'Community Member'}
                    </span>
                  </div>
                  <span className="text-teal-600 text-sm font-bold">Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}