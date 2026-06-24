import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Plus, Clock, Video, Search } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Event } from '../types';

export function EventsPage() {
  const { profile } = useAuthContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*, organizer:profiles!organizer_id(*)')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEvents(data as Event[]);
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-600 mt-1">Join community events and live sessions</p>
        </div>
        {profile && (
          <Link
            to="/events/create"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No upcoming events</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-teal-300 hover:shadow-md transition-all"
            >
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {event.is_live && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white animate-pulse">
                      LIVE
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.is_online ? (
                      <>
                        <Video className="w-4 h-4" />
                        Online Event
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </>
                    )}
                  </div>
                  {event.max_attendees && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.attendee_count} / {event.max_attendees} attending
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
