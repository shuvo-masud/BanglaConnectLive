import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || fullName.length < 2) return setError('Enter valid name');
    if (!email.includes('@')) return setError('Enter valid email');
    if (password.length < 6) return setError('Password too short');
    if (!country) return setError('Select country');
    if (role === 'mentor' && specialties.length === 0)
      return setError('Select at least one specialty');

    setLoading(true);

    try {
      // ✅ FIXED: correct DB field mapping only
      const result = await signUp(email, password, {
        full_name: fullName,
        role,
        roles: [role],
        country_of_residence: country,
        specialty: specialties,
      });

      if (result?.error) {
        setError(result.error.message);
        return;
      }

      // (optional) keep or remove based on your flow
      navigate('/');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </select>

        <select
          className="w-full border p-2 rounded"
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

        {role === 'mentor' && (
          <div className="border p-3 rounded">
            <p className="font-semibold mb-2">Select Specialties</p>

            <div className="grid grid-cols-2 gap-2">
              {MENTOR_SPECIALTIES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={specialties.includes(s)}
                    onChange={(e) => {
                      setSpecialties((prev) =>
                        e.target.checked
                          ? [...prev, s]
                          : prev.filter((x) => x !== s)
                      );
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Creating...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
    </div>
  );
}