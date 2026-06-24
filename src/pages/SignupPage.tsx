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
      const result = await signUp(email, password, { full_name: fullName, role });

      if (result.error) {
        setError(result.error.message || 'Signup failed');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Email confirmation required
        setNeedsApproval(role !== 'student');
        setSuccess(true);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const roles = ['student'];
        if (role === 'mentor' || role === 'admin') {
          roles.push(role);
        }

        await supabase.from('profiles').upsert({
          id: session.user.id,
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
      }

      setNeedsApproval(role !== 'student');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
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
              <span className="font-semibold text-lg text-slate-800">BanglaConnect</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Account Created!</h2>
            {needsApproval ? (
              <>
                <p className="text-slate-600 mb-2">
                  Your account has been created. Your <span className="font-medium text-amber-600">{role}</span> role is pending approval from the Owner.
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  You can access the platform as a student until your role is approved.
                </p>
              </>
            ) : (
              <p className="text-slate-600 mb-4">Please check your email to confirm your account.</p>
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
              <span className="font-semibold text-lg text-slate-800 leading-tight">BanglaConnect</span>
              <span className="text-[10px] text-teal-600 italic leading-tight">When people connect, opportunities multiply.</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-slate-600">Join the Bangladeshi global community</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">I want to</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'student', label: 'Learn', desc: 'As a student', instant: true },
                    { value: 'mentor', label: 'Mentor', desc: 'Share knowledge', instant: false },
                    { value: 'admin', label: 'Admin', desc: 'Manage platform', instant: false },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value as UserRole)}
                      disabled={loading}
                      className={`p-3 rounded-lg border-2 transition-all text-center disabled:opacity-50 relative ${
                        role === r.value ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`font-medium text-sm ${role === r.value ? 'text-teal-700' : 'text-slate-700'}`}>{r.label}</p>
                      <p className="text-xs text-slate-500">{r.desc}</p>
                      {!r.instant && role === r.value && (
                        <span className="absolute -top-1 -right-1 text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Needs approval</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'mentor' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Approval Required</p>
                      <p className="text-xs text-amber-700">Your mentor application will be reviewed by the platform owner. You can use the platform as a student until approved.</p>
                    </div>
                  </div>
                </div>
              )}

              {role === 'admin' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Approval Required</p>
                      <p className="text-xs text-purple-700">Admin role requires platform owner approval. You can use the platform as a student until approved.</p>
                    </div>
                  </div>
                </div>
              )}

              {role === 'mentor' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialties</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MENTOR_SPECIALTIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
                        disabled={loading}
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left disabled:opacity-50 ${
                          specialties.includes(s) ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          specialties.includes(s) ? 'bg-teal-600 border-teal-600' : 'border-slate-300'
                        }`}>
                          {specialties.includes(s) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-700">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:opacity-50"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating Account...</>) : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
