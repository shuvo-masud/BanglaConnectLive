import { useState } from 'react';
import {
  AlertTriangle, Phone, MapPin, Clock, Send, Loader2,
  CheckCircle, Shield, Users
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

export function EmergencyAidPage() {
  const { profile } = useAuthContext();
  const [urgency, setUrgency] = useState<'critical' | 'urgent' | 'standard'>('urgent');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission (would connect to Supabase in real implementation)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Request Submitted</h2>
          <p className="text-slate-600 mb-6">
            Your emergency aid request has been submitted to the BanglaConnect community.
            Someone will reach out to you shortly.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setDescription('');
              setLocation('');
            }}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Emergency Aid</h1>
            <p className="text-slate-600">Request urgent assistance from the community</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Card */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 mb-6 text-white">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Emergency Contacts in Bangladesh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">Police</p>
            <p className="font-bold text-lg">999</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">Ambulance</p>
            <p className="font-bold text-lg">1990</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">Fire Service</p>
            <p className="font-bold text-lg">955</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white/80 text-xs">RAB</p>
            <p className="font-bold text-lg">01769445566</p>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Submit an Aid Request</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'critical', label: 'Critical', desc: 'Life-threatening', color: 'red' },
                { value: 'urgent', label: 'Urgent', desc: 'Within 24hrs', color: 'amber' },
                { value: 'standard', label: 'Standard', desc: 'Few days', color: 'blue' },
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setUrgency(level.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    urgency === level.value
                      ? level.color === 'red' ? 'border-red-500 bg-red-50' :
                        level.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                        'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`font-medium ${
                    urgency === level.value
                      ? level.color === 'red' ? 'text-red-700' :
                        level.color === 'amber' ? 'text-amber-700' :
                        'text-blue-700'
                      : 'text-slate-700'
                  }`}>{level.label}</p>
                  <p className="text-xs text-slate-500">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Your Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, District, or specific address"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Contact Number
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Describe Your Situation
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what kind of assistance you need..."
              rows={4}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Requester Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Requesting as:</p>
            <p className="font-medium text-slate-900">{profile?.full_name || 'Unknown'}</p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !description || !location}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Emergency Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Shield className="w-8 h-8 text-teal-600 mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">Verified Helpers</h3>
          <p className="text-sm text-slate-500">Community members are vetted before receiving requests.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Users className="w-8 h-8 text-teal-600 mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">Wide Network</h3>
          <p className="text-sm text-slate-500">Connect with helpers across Bangladesh and globally.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Clock className="w-8 h-8 text-teal-600 mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">Quick Response</h3>
          <p className="text-sm text-slate-500">Average response time under 2 hours for urgent requests.</p>
        </div>
      </div>
    </div>
  );
}
