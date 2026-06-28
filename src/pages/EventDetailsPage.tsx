import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Clock, Video, 
  ArrowLeft, Share2, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, organizer:profiles!organizer_id(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      navigate('/events');
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  const handleJoinEvent = async () => {
    if (!profile) return navigate('/login');
    setJoining(true);
    
    // Check if event is full
    if (event.max_attendees && event.attendee_count >= event.max_attendees) {
      alert("Event is full!");
      setJoining(false);
      return;
    }

    const { error } = await supabase
      .from('events')
      .update({ attendee_count: (event.attendee_count || 0) + 1 })
      .eq('id', id);

    if (!error) {
      setEvent({ ...event, attendee_count: (event.attendee_count || 0) + 1 });
    }
    setJoining(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Banner Image */}
        <div className="h-64 md:h-80 w-full relative">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600" />
          )}
          {event.is_live && (
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full" /> LIVE NOW
            </div>
          )}
        </div>

        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-semibold rounded-full">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg"><Clock className="w-5 h-5 text-teal-600" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                    <p className="text-sm font-semibold">{new Date(event.event_date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    {event.is_online ? <Video className="w-5 h-5 text-teal-600" /> : <MapPin className="w-5 h-5 text-teal-600" />}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{event.is_online ? 'Platform' : 'Location'}</p>
                    <p className="text-sm font-semibold truncate max-w-[200px]">
                      {event.is_online ? 'Online (Link via Email)' : event.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-3xl font-bold text-slate-900">{event.attendee_count || 0}</p>
                <p className="text-sm text-slate-500 mb-4">Attending so far</p>
                
                <button
                  onClick={handleJoinEvent}
                  disabled={joining || isFull}
                  className="w-full px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-teal-100"
                >
                  {joining ? 'Processing...' : isFull ? 'Event Full' : 'Register Now'}
                </button>

                {event.max_attendees && (
                  <p className="text-xs text-slate-400 mt-3">
                    Limited to {event.max_attendees} spots
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="my-10 border-slate-100" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this Event</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>

              {event.is_online && event.stream_url && (
                <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-800">
                    The link to the session will be shared with registered participants. 
                  </p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Organizer</h2>
              <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">
                    {event.organizer?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{event.organizer?.full_name}</h3>
                    <div className="flex items-center gap-1 text-teal-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Verified {event.organizer?.role}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/profile/${event.organizer_id}`)}
                  className="w-full py-2 text-sm text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  View Profile
                </button>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors py-2 border-2 border-dashed border-slate-200 rounded-xl">
                <Share2 className="w-4 h-4" /> Share Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}