import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, AlertCircle, Check, Loader2, Info } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { COUNTRIES, MENTOR_SPECIALTIES } from '../utils/helpers';
import { supabase } from '../integrations/supabase';
import type { UserRole } from '../types';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [country, setCountry] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const { signUp, user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const toggleSpecialty = (s: string) => {
    setSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // VALIDATION (UNCHANGED)
    if (!fullName || fullName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Valid email is required');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!country) {
      setError('Please select a country');
      return;
    }
    if (role === 'mentor' && specialties.length === 0) {
      setError('Please select at least one specialty');
      return;
    }

    setLoading(true);

    try {
      // 1. SIGN UP (UNCHANGED LOGIC)
      const result = await signUp(email, password, {
        full_name: fullName,
        role,
      });

      if (result.error) {
        setError(result.error.message || 'Signup failed');
        setLoading(false);
        return;
      }

      /**
       * 2. FIX: wait for auth propagation (prevents race condition)
       * THIS is the ONLY behavioral fix
       */
      await new Promise(res => setTimeout(res, 800));

      // 3. RELIABLE USER FETCH
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User creation failed. Please try again.');
        setLoading(false);
        return;
      }

      // 4. ROLE LOGIC (UNCHANGED FEATURE)
      const roles = ['student'];
      if (role === 'mentor' || role === 'admin') {
        roles.push(role);
      }

      // 5. PROFILE INSERT (UNCHANGED STRUCTURE)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email,
          full_name: fullName,
          role,
          roles,
          country_of_residence: country,
          specialty: role === 'mentor' ? specialties : [],
          mentorship_available: role === 'mentor',
          mentor_status: role === 'mentor' ? 'pending' : null,
          admin_status: role === 'admin' ? 'pending' : null,
          is_owner: false,
        });

      if (profileError) {
        console.error(profileError);
        setError('Failed to save profile');
        setLoading(false);
        return;
      }

      // 6. SUCCESS STATE (UNCHANGED FEATURE)
      setNeedsApproval(role !== 'student');
      setSuccess(true);
      setLoading(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="py-6 px-4">
          <div className="max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-slate-800">
                BanglaConnect
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal-600" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Account Created!
            </h2>

            {needsApproval ? (
              <>
                <p className="text-slate-600 mb-2">
                  Your account has been created. Your{' '}
                  <span className="font-medium text-amber-600">{role}</span>{' '}
                  role is pending approval from the Owner.
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  You can access the platform as a student until your role is approved.
                </p>
              </>
            ) : (
              <p className="text-slate-600 mb-4">
                Please check your email to confirm your account.
              </p>
            )}

            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Continue to Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-slate-800">
                BanglaConnect
              </span>
              <span className="text-[10px] text-teal-600 italic">
                When people connect, opportunities multiply.
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Create your account
            </h1>
            <p className="mt-1 text-slate-600">
              Join the Bangladeshi global community
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ROLE */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  I want to
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'student', label: 'Learn', desc: 'As a student' },
                    { value: 'mentor', label: 'Mentor', desc: 'Share knowledge' },
                    { value: 'admin', label: 'Admin', desc: 'Manage platform' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value as UserRole)}
                      disabled={loading}
                      className={`p-3 rounded-lg border-2 ${
                        role === r.value
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SPECIALTIES (UNCHANGED FEATURE) */}
              {role === 'mentor' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">
                    Specialties
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {MENTOR_SPECIALTIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
                        className={`p-2 rounded-lg border-2 text-sm ${
                          specialties.includes(s)
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUTS */}
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 text-white rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}