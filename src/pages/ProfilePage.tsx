import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase";
import {
  MapPin,
  Briefcase,
  Save,
  ChevronDown,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Check,
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { COUNTRIES, PROFESSIONAL_FIELDS, MENTOR_SPECIALTIES, PROFESSION_OPTIONS } from '../utils/helpers';
import type { Profile } from '../types';

export function ProfilePage() {
  const { profile: currentUser, updateProfile } = useAuthContext();
  const { id } = useParams();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Start as loading
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);

  // Determine if this is the logged-in user's own profile
  const isOwnProfile = !id || id === currentUser?.id;

  const [formData, setFormData] = useState<Partial<Profile>>({});

  // 1. Fetch Profile Data based on ID
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const targetId = id || currentUser?.id;

      if (!targetId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetId)
        .single();

      if (!error && data) {
        setViewedProfile(data);
        // Initialize form data with the fetched profile
        setFormData(data);
      } else {
        setError("Profile not found");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id, currentUser]);

  // Use viewedProfile for display, fallback to currentUser
  const displayProfile = viewedProfile || (isOwnProfile ? currentUser : null);

  const handleAddSkill = () => {
    if (newSkill && !formData.skills?.includes(newSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill],
      }));
      setNewSkill('');
    }
  };

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skill) || [],
    }));
  };

  const handleAddInterest = () => {
    if (newInterest && !formData.interests?.includes(newInterest)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest],
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: Array.isArray(prev.interests) ? prev.interests.filter((i: string) => i !== interest) : [],
    }));
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialty: prev.specialty?.includes(specialty)
        ? prev.specialty.filter((s) => s !== specialty)
        : [...(prev.specialty || []), specialty],
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess(true);
      setEditing(false);
      setViewedProfile({ ...viewedProfile, ...formData } as Profile); // Sync local state
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setSaveLoading(false);
  };

  const handleCancel = () => {
    setFormData(viewedProfile || {});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!displayProfile) {
    return <div className="text-center py-24">Profile not found.</div>;
  }

  const getInitials = (name: string) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isOwnProfile ? 'My Profile' : `${displayProfile.full_name}'s Profile`}
          </h1>
          <p className="text-slate-600 mt-1">
            {isOwnProfile ? 'Manage your personal information' : 'View member details'}
          </p>
        </div>
        {/* Only show Edit button if it's the user's OWN profile */}
        {isOwnProfile && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 h-24" />

        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end gap-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-2xl font-semibold text-teal-600">
                {getInitials(displayProfile.full_name)}
              </span>
            </div>
            <div className="pb-2">
              <p className="text-sm text-slate-500 capitalize">
                {displayProfile.is_owner ? 'Owner' : displayProfile.role}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-slate-900">{displayProfile.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <p className="text-slate-600">{displayProfile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                {editing ? (
                  <select
                    value={formData.country_of_residence || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country_of_residence: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <p className="text-slate-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {displayProfile.country_of_residence || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Field</label>
                {editing ? (
                  <select
                    value={formData.professional_field || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, professional_field: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select field</option>
                    {PROFESSIONAL_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                ) : (
                  <p className="text-slate-900">{displayProfile.professional_field || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">About Me</label>
              {editing ? (
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">{displayProfile.bio || 'No bio added yet.'}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {(editing ? formData.skills : displayProfile.skills)?.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-1">
                    {skill}
                    {editing && <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} />}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Action buttons */}
            {editing && (
              <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
                <button onClick={handleCancel} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50"
                >
                  {saveLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}