import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Send,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import { useSavedMentors } from '../hooks/useMentors';
import type { Profile } from '../types';
import { getInitials } from '../utils/helpers';

export function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { profile: currentUser } = useAuthContext();
  const [mentor, setMentor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { saveMentor, unsaveMentor, isSaved, saving } = useSavedMentors(currentUser?.id || '');

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setMentor(data as Profile);

        if (currentUser) {
          const { data: requestData } = await supabase
            .from('mentorship_requests')
            .select('id')
            .eq('student_id', currentUser.id)
            .eq('mentor_id', id)
            .maybeSingle();

          if (requestData) {
            setRequestSent(true);
          }
        }
      }

      setLoading(false);
    };

    fetchMentor();
  }, [id, currentUser]);

  const handleSendRequest = async () => {
    if (!mentor || !currentUser) return;
    setSubmitting(true);

    const { error } = await supabase.from('mentorship_requests').insert({
      student_id: currentUser.id,
      mentor_id: mentor.id,
      message: requestMessage || null,
    });

    if (!error) {
      setRequestSent(true);
      setShowRequestModal(false);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-semibold text-slate-900">Mentor not found</h2>
        <Link
          to="/mentors"
          className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to mentors
        </Link>
      </div>
    );
  }

  const saved = isSaved(mentor.id);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        to="/mentors"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to mentors
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 h-32" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-16 mb-4">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              {mentor.avatar_url ? (
                <img
                  src={mentor.avatar_url}
                  alt={mentor.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-teal-600">
                  {getInitials(mentor.full_name)}
                </span>
              )}
            </div>
          </div>

          {/* Name and location */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{mentor.full_name}</h1>
              <div className="flex items-center gap-3 mt-2 text-slate-600">
                {mentor.country_of_residence && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {mentor.country_of_residence}
                  </span>
                )}
                {mentor.professional_field && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {mentor.professional_field}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => saved ? unsaveMentor(mentor.id) : saveMentor(mentor.id)}
                disabled={saving}
                className={`p-2.5 rounded-lg transition-colors ${
                  saved
                    ? 'bg-teal-50 text-teal-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {saved ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Availability */}
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                mentor.mentorship_available ? 'bg-green-500' : 'bg-slate-300'
              }`}
            />
            <span className="text-sm text-slate-600">
              {mentor.mentorship_available
                ? 'Available for mentorship'
                : 'Currently not accepting new mentees'}
            </span>
          </div>

          {/* Bio */}
          {mentor.bio && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-900 mb-2">About</h2>
              <p className="text-slate-600 leading-relaxed">{mentor.bio}</p>
            </div>
          )}

          {/* Skills */}
          {mentor.skills && mentor.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-900 mb-2">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {mentor.interests && Array.isArray(mentor.interests) && mentor.interests.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-900 mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Current Role */}
          {mentor.job_title && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-900 mb-2">Current Role</h2>
              <p className="text-slate-600">{mentor.job_title}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {requestSent ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                <Send className="w-5 h-5" />
                <span>Mentorship request sent</span>
              </div>
            ) : mentor.mentorship_available ? (
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Connect with {mentor.full_name.split(' ')[0]}
              </button>
            ) : (
              <p className="text-center text-slate-500 py-3">
                This mentor is currently not accepting new connections.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Send mentorship request
            </h2>
            <p className="text-slate-600 mb-4">
              Introduce yourself and explain why you'd like to connect with{' '}
              {mentor.full_name}.
            </p>

            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Write a brief message introducing yourself and your goals..."
              rows={4}
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
