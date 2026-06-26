import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import type { Profile } from '../types';

export function ProfilePage() {
  const { id } = useParams();
  const { profile, updateProfile } = useAuthContext();

  // =========================
  // PROFILE TARGET (SELF OR OTHER USER)
  // =========================
  const profileId = id || profile?.id;

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: '',
    country_of_residence: '',
    professional_field: '',
    job_title: '',
    bio: '',
    skills: [],
    interests: [],
    mentorship_available: false,
    specialty: [],
    profession: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // =========================
  // FETCH PROFILE (SELF OR OTHER USER)
  // =========================
  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // if viewing own profile
        if (!id) {
          setViewedProfile(profile as Profile);
          setFormData(profile as Profile);
        } else {
          // fetch other user profile from Supabase
          const { supabase } = await import('../integrations/supabase');

          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          setViewedProfile(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, profile, profileId]);

  // =========================
  // SAFE GUARD
  // =========================
  if (loading || !profileId) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner = !id;

  // =========================
  // HANDLERS
  // =========================

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()],
    }));

    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skill),
    }));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;

    setFormData((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), newInterest.trim()],
    }));

    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: (prev.interests || []).filter((i) => i !== interest),
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
    setFormData(viewedProfile || (profile as Profile));
    setEditing(false);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Profile Page</h1>

      <p className="text-gray-600">
        Viewing: {viewedProfile?.full_name || 'Loading...'}
      </p>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Saved successfully</p>}

      {isOwner && (
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded"
        >
          Save Profile
        </button>
      )}
    </div>
  );
}