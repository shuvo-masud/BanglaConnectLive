import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2, Globe } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { COUNTRIES, MENTOR_SPECIALTIES } from '../utils/helpers';
import type { UserRole } from '../types';

export default function SignupPage() {
  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [country, setCountry] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || fullName.length < 2) return setError('Enter valid name');
    if (!email.includes('@')) return setError('Enter valid email');
    if (password.length < 6) return setError('Password too short');
    if (!role) return setError('Select role');
    if (!country) return setError('Select country');
    if (role === 'mentor' && specialties.length === 0)
      return setError('Select at least one specialty');

    setLoading(true);

    try {
      const result = await signUp(email, password, {
        full_name: fullName,
        role,
        roles: [role],
        country_of_residence: country,
        specialty: role === 'mentor' ? specialties : [],
        mentor_status: role === 'mentor' ? 'pending' : null,
        admin_status: role === 'admin' ? 'pending' : null,
      });

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* HEADER */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">

          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col items-center">
              <span className="font-semibold text-lg text-slate-800">
                BanglaConnect
              </span>

              <Link
                to="/"
                className="text-xs text-teal-600 hover:text-teal-700 mt-1"
              >
                ← Back to landing page
              </Link>
            </div>
          </div>

          <p className="text-slate-600 text-sm mt-2">
            Join the Bangladeshi global community
          </p>
        </div>
      </header>

      {/* FORM */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4"
        >

          {/* ROLE */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              JOIN AS!
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'student', label: 'Student' },
                { value: 'mentor', label: 'Mentor' },
                { value: 'admin', label: 'Admin' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value as UserRole)}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    role === r.value
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-slate-200'
                  }`}
                >
                  <p className="text-sm font-medium">{r.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SPECIALTIES */}
          {role === 'mentor' && (
            <div>
              <p className="text-sm font-medium mb-2">Specialties</p>

              <div className="grid grid-cols-2 gap-2">
                {MENTOR_SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`p-2 rounded border text-sm ${
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
            className="w-full border p-2 rounded-lg"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-2 rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded-lg"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* ERROR */}
          {error && (
            <div className="text-red-600 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </main>
    </div>
  );
}