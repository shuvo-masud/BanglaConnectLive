import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase';
import type { Profile, MentorshipRequest, SavedMentor } from '../types';

/* =========================================================
   MENTORS
========================================================= */
export function useMentors(filters?: {
  country?: string;
  field?: string;
  skills?: string[];
}) {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .contains('roles', ['mentor'])
        .eq('mentorship_available', true);

      if (filters?.country) {
        query = query.eq('country_of_residence', filters.country);
      }

      if (filters?.field) {
        query = query.eq('professional_field', filters.field);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setMentors([]);
        setLoading(false);
        return;
      }

      let result = (data as Profile[]) || [];

      // skill filtering (safe)
      if (filters?.skills?.length) {
        result = result.filter((mentor) =>
          filters.skills!.some((skill) =>
            mentor.skills?.some((s) =>
              s.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      setMentors(result);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.country,
    filters?.field,
    filters?.skills?.length,
  ]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return { mentors, loading, error, refetch: fetchMentors };
}

/* =========================================================
   MENTORSHIP REQUESTS
========================================================= */
export function useMentorshipRequests(
  userId: string,
  role: 'student' | 'mentor'
) {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const column = role === 'student' ? 'student_id' : 'mentor_id';

      const { data, error: fetchError } = await supabase
        .from('mentorship_requests')
        .select(`
          *,
          student:profiles(*),
          mentor:profiles(*)
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setRequests([]);
        return;
      }

      setRequests((data as MentorshipRequest[]) || []);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (mentorId: string, message?: string) => {
    const { error } = await supabase.from('mentorship_requests').insert({
      student_id: userId,
      mentor_id: mentorId,
      message,
    });

    if (error) return { success: false, error: error.message };

    fetchRequests();
    return { success: true };
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'accepted' | 'declined'
  ) => {
    const { error } = await supabase
      .from('mentorship_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) return { success: false, error: error.message };

    fetchRequests();
    return { success: true };
  };

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequestStatus,
  };
}

/* =========================================================
   SAVED MENTORS
========================================================= */
export function useSavedMentors(userId: string) {
  const [savedMentors, setSavedMentors] = useState<SavedMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    if (!userId) {
      setSavedMentors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_mentors')
        .select(`*, mentor:profiles(*)`)
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setSavedMentors([]);
        return;
      }

      setSavedMentors((data as SavedMentor[]) || []);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
      setSavedMentors([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const saveMentor = async (mentorId: string) => {
    setSaving(true);

    const { error } = await supabase.from('saved_mentors').insert({
      student_id: userId,
      mentor_id: mentorId,
    });

    setSaving(false);

    if (error) return { success: false, error: error.message };

    fetchSaved();
    return { success: true };
  };

  const unsaveMentor = async (mentorId: string) => {
    setSaving(true);

    const { error } = await supabase
      .from('saved_mentors')
      .delete()
      .eq('student_id', userId)
      .eq('mentor_id', mentorId);

    setSaving(false);

    if (error) return { success: false, error: error.message };

    fetchSaved();
    return { success: true };
  };

  const isSaved = (mentorId: string) =>
    savedMentors.some((m) => m.mentor_id === mentorId);

  return {
    savedMentors,
    loading,
    saving,
    error,
    refetch: fetchSaved,
    saveMentor,
    unsaveMentor,
    isSaved,
  };
}