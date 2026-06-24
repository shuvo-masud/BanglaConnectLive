import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useSavedMentors, useMentorshipRequests } from '../hooks/useMentors';
import { formatDate, getInitials } from '../utils/helpers';
import type { MentorshipRequest } from '../types';

export function MyConnectionsPage() {
  const { profile, isActiveMentor } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'requests' | 'saved'>('requests');

  const { savedMentors, loading: loadingSaved, unsaveMentor } = useSavedMentors(
    profile?.id || ''
  );

  const { requests, loading: loadingRequests, updateRequestStatus } = useMentorshipRequests(
    profile?.id || '',
    isActiveMentor ? 'mentor' : 'student'
  );

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const declinedRequests = requests.filter((r) => r.status === 'declined');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isActiveMentor ? 'Mentorship Requests' : 'My Connections'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isActiveMentor
            ? 'Manage your incoming mentorship requests'
            : 'Track your mentorship requests and saved mentors'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 bg-teal-600 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'saved'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Saved ({savedMentors.length})
          </span>
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {loadingRequests ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Pending Requests */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-amber-50">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Pending ({pendingRequests.length})
                  </h2>
                </div>
                {pendingRequests.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {pendingRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        isActiveMentor={isActiveMentor || false}
                        onRespond={updateRequestStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No pending requests
                  </p>
                )}
              </div>

              {/* Accepted Requests */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-green-50">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {isActiveMentor ? 'Active Mentees' : 'Accepted'} ({acceptedRequests.length})
                  </h2>
                </div>
                {acceptedRequests.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {acceptedRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        isActiveMentor={isActiveMentor || false}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No accepted connections yet
                  </p>
                )}
              </div>

              {/* Declined Requests */}
              {declinedRequests.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-red-50">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Declined ({declinedRequests.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {declinedRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        isActiveMentor={isActiveMentor || false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loadingSaved ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : savedMentors.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {savedMentors.map((saved) => (
                <div
                  key={saved.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <Link
                    to={`/mentors/${saved.mentor_id}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {getInitials(saved.mentor?.full_name || 'M')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {saved.mentor?.full_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{saved.mentor?.job_title || saved.mentor?.professional_field}</span>
                        {saved.mentor?.country_of_residence && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {saved.mentor.country_of_residence}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => unsaveMentor(saved.mentor_id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No saved mentors yet</p>
              <Link
                to="/mentors"
                className="inline-block mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Browse Mentors
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  isActiveMentor,
  onRespond,
}: {
  request: MentorshipRequest;
  isActiveMentor: boolean;
  onRespond?: (id: string, status: 'accepted' | 'declined') => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleResponse = async (status: 'accepted' | 'declined') => {
    if (!onRespond) return;
    setSubmitting(true);
    await onRespond(request.id, status);
    setSubmitting(false);
  };

  const person = isActiveMentor ? request.student : request.mentor;
  const status = request.status;

  return (
    <div className="p-4 flex items-start gap-4">
      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
        {getInitials(person?.full_name || 'U')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-slate-900">
              {isActiveMentor ? 'Request from' : 'Request to'}{' '}
              <Link
                to={`/mentors/${isActiveMentor ? request.student_id : request.mentor_id}`}
                className="text-teal-600 hover:text-teal-700"
              >
                {person?.full_name}
              </Link>
            </p>
            <p className="text-sm text-slate-500">{formatDate(request.created_at)}</p>
          </div>
          {status === 'pending' && isActiveMentor && onRespond && (
            <div className="flex gap-2">
              <button
                onClick={() => handleResponse('accepted')}
                disabled={submitting}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => handleResponse('declined')}
                disabled={submitting}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
        </div>
        {request.message && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">"{request.message}"</p>
          </div>
        )}
        {!isActiveMentor && status === 'pending' && (
          <p className="text-sm text-amber-600 mt-2">Waiting for response...</p>
        )}
        {status === 'accepted' && (
          <p className="text-sm text-green-600 mt-2">
            {isActiveMentor ? 'You are now mentoring this student' : 'Connection established'}
          </p>
        )}
        {status === 'declined' && (
          <p className="text-sm text-red-600 mt-2">
            {isActiveMentor ? 'You declined this request' : 'Request was declined'}
          </p>
        )}
      </div>
    </div>
  );
}
