import { useState } from 'react';
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
  const { profile, updateProfile } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: profile?.full_name || '',
    country_of_residence: profile?.country_of_residence || '',
    professional_field: profile?.professional_field || '',
    job_title: profile?.job_title || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    mentorship_available: profile?.mentorship_available || false,
    specialty: profile?.specialty || [],
    profession: profile?.profession || '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleAddSkill = () => {
    if (newSkill && !formData.skills?.includes(newSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill],
      }));
      setNewSkill('');
    }
  };

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
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      country_of_residence: profile?.country_of_residence || '',
      professional_field: profile?.professional_field || '',
      job_title: profile?.job_title || '',
      bio: profile?.bio || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      mentorship_available: profile?.mentorship_available || false,
      specialty: profile?.specialty || [],
      profession: profile?.profession || '',
    });
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!editing && (
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
        {/* Avatar section */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 h-24" />

        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end gap-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-2xl font-semibold text-teal-600">
                {getInitials(profile.full_name)}
              </span>
            </div>
            <div className="pb-2">
              <p className="text-sm text-slate-500">
                {profile?.is_owner
                ? 'Owner'
                : profile?.role === 'admin'
                  ? 'Admin'
                  : profile?.role === 'mentor'
                   ? 'Mentor'
                   : 'Student'}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-slate-900">{profile.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <p className="text-slate-600">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country of Residence
                </label>
                {editing ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.country_of_residence}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          country_of_residence: e.target.value,
                        }))
                      }
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-slate-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {profile.country_of_residence}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Professional Field
                </label>
                {editing ? (
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.professional_field || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professional_field: e.target.value,
                        }))
                      }
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                    >
                      <option value="">Select field</option>
                      {PROFESSIONAL_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-slate-900">
                    {profile.professional_field || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Role / Job Title
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.job_title || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, job_title: e.target.value }))
                  }
                  placeholder="e.g. Software Engineer at Google"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <p className="text-slate-900">{profile.job_title || 'Not specified'}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                About Me
              </label>
              {editing ? (
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell others about yourself, your background, and what you can offer..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {profile.bio || 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* Mentor Specialty (for mentors only) */}
            {profile.role === 'mentor' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  My Specialties
                </label>
                {editing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {MENTOR_SPECIALTIES.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                          formData.specialty?.includes(specialty)
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            formData.specialty?.includes(specialty)
                              ? 'bg-teal-600 border-teal-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {formData.specialty?.includes(specialty) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-slate-700">{specialty}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.specialty && profile.specialty.length > 0 ? (
                      profile.specialty.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500">No specialties selected</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profession */}
            {(profile.profession || editing) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Profession
                </label>
                {editing ? (
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={formData.profession || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, profession: e.target.value }))
                      }
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                    >
                      <option value="">Select profession</option>
                      {PROFESSION_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-slate-900">{profile.profession || 'Not specified'}</p>
                )}
              </div>
            )}

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {(editing ? formData.skills : profile.skills)?.map((skill) => (
                  <span
                    key={skill}
                    className={`group px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                      editing
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {skill}
                    {editing && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {editing && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <button
                    onClick={handleAddSkill}
                    className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const interests = editing ? formData.interests : profile.interests;
                  if (!interests || !Array.isArray(interests)) return null;
                  return interests.map((interest: string, idx: number) => (
                    <span
                      key={idx}
                      className={`group px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        editing
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {interest}
                      {editing && (
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ));
                })()}
              </div>
              {editing && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                  />
                  <button
                    onClick={handleAddInterest}
                    className="p-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mentor availability (for mentors only) */}
            {profile.role === 'mentor' && (
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mentorship_available}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mentorship_available: e.target.checked,
                      }))
                    }
                    disabled={!editing}
                    className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      Available for mentorship
                    </p>
                    <p className="text-sm text-slate-500">
                      Students can send you mentorship requests
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {editing && (
            <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
