import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Image as ImageIcon, 
  Users, 
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

const EVENT_CATEGORIES = ['Workshop', 'Webinar', 'Networking', 'Q&A Session', 'Mentorship Circle', 'Career Talk'];

export function CreateEventPage() {
  const { profile, loading: authLoading } = useAuthContext(); // Added authLoading check
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: EVENT_CATEGORIES[0],
    event_date: '',
    end_date: '',
    is_online: false,
    location: '',
    stream_url: '',
    image_url: '',
    max_attendees: '',
  });

  // FIX 1: Wait for Auth to finish loading before checking profile
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // FIX 2: Safe guard against null profile
  if (!profile || (profile.role !== 'mentor' && profile.role !== 'admin')) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-600 mt-2">Only mentors and admins can create events.</p>
        <button onClick={() => navigate('/events')} className="mt-4 text-teal-600 font-medium">
          Back to Events
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return; // Guard clause

    setLoading(true);
    setError(null);

    try {
      // FIX 3: Ensure numeric fields are correctly handled (parseInt('') is NaN, which crashes Postgres)
      const maxAttendeesInt = formData.max_attendees ? parseInt(formData.max_attendees, 10) : null;
      
      const { error: insertError } = await supabase
        .from('events')
        .insert([{
          title: formData.title,
          description: formData.description,
          category: formData.category,
          event_date: new Date(formData.event_date).toISOString(),
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
          is_online: formData.is_online,
          location: formData.is_online ? null : formData.location,
          stream_url: formData.is_online ? formData.stream_url : null,
          image_url: formData.image_url || null,
          max_attendees: isNaN(maxAttendeesInt as number) ? null : maxAttendeesInt,
          organizer_id: profile.id,
          attendee_count: 0
        }]);

      if (insertError) throw insertError;

      navigate('/events');
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900">Create New Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select className="w-full px-4 py-2 border rounded-lg"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Attendees</label>
              <input type="number" className="w-full px-4 py-2 border rounded-lg"
                value={formData.max_attendees} onChange={e => setFormData({...formData, max_attendees: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea required rows={4} className="w-full px-4 py-2 border rounded-lg"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
              <input required type="datetime-local" className="w-full px-4 py-2 border rounded-lg"
                value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input type="datetime-local" className="w-full px-4 py-2 border rounded-lg"
                value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_online} 
                onChange={e => setFormData({...formData, is_online: e.target.checked})} />
              <span className="text-sm font-medium">This is an online event</span>
            </label>

            {formData.is_online ? (
              <input type="url" placeholder="Stream URL" className="w-full px-4 py-2 border rounded-lg"
                value={formData.stream_url} onChange={e => setFormData({...formData, stream_url: e.target.value})} />
            ) : (
              <input type="text" placeholder="Physical Location" className="w-full px-4 py-2 border rounded-lg"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Create Event</>}
          </button>
        </form>
      </div>
    </div>
  );
}