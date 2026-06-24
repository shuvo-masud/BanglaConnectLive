import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  AlertCircle,
  Check,
  Loader2,
  Info
} from 'lucide-react';

import { useAuthContext } from '../context/AuthContext';
import { COUNTRIES, MENTOR_SPECIALTIES } from '../utils/helpers';
import { supabase } from '../integrations/supabase';
import type { UserRole } from '../types';

export function SignupPage() {
  const navigate = useNavigate();

  const {
    signUp,
    user,
    loading: authLoading
  } = useAuthContext();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [specialties, setSpecialties] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading || !user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile check error:', error);
        return;
      }

      if (!profile) {
        navigate('/complete-profile', {
          replace: true
        });
      } else {
        navigate('/dashboard', {
          replace: true
        });
      }
    };

    checkProfile();
  }, [user, authLoading, navigate]);

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(x => x !== specialty)
        : [...prev, specialty]
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError(null);

    if (fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!email.includes('@')) {
      setError('Valid email required');
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters'
      );
      return;
    }

    if (!country) {
      setError('Please select country');
      return;
    }

    if (
      role === 'mentor' &&
      specialties.length === 0
    ) {
      setError(
        'Select at least one specialty'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(
        email,
        password,
        {
          full_name: fullName,
          role,
          country,
          specialties
        },
        `${window.location.origin}/auth/callback`
      );

      if (result.error) {
        setError(
          result.error.message ||
          'Signup failed'
        );
        return;
      }

      setSuccess(true);

    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
        'Something went wrong'
      );

    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-xl p-8 border shadow-sm max-w-md w-full text-center">

          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">

            <Check className="w-8 h-8 text-teal-600"/>

          </div>

          <h2 className="text-xl font-semibold mb-3">

            Account Created

          </h2>

          <p className="text-slate-600 mb-4">

            Please check your email and verify your account.

          </p>

          <p className="text-sm text-slate-500">

            After verification you will continue
            to profile completion.

          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">

      <div className="max-w-md mx-auto">

        <div className="text-center mb-6">

          <Link
            to="/"
            className="inline-flex items-center gap-2"
          >

            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">

              <Globe className="w-5 h-5 text-white"/>

            </div>

            <span className="font-semibold text-lg">

              BanglaConnect

            </span>

          </Link>

        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">

              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5"/>

              <span className="text-red-700 text-sm">

                {error}

              </span>

            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              value={fullName}
              onChange={(e)=>
                setFullName(e.target.value)
              }
              placeholder="Full name"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="email"
              value={email}
              onChange={(e)=>
                setEmail(e.target.value)
              }
              placeholder="Email"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="password"
              value={password}
              onChange={(e)=>
                setPassword(e.target.value)
              }
              placeholder="Password"
              className="w-full border rounded-lg px-3 py-2"
            />

            <select
              value={country}
              onChange={(e)=>
                setCountry(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">
                Select country
              </option>

              {COUNTRIES.map(country=>(
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
            </select>

            <select
              value={role}
              onChange={(e)=>
                setRole(
                  e.target.value as UserRole
                )
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="student">
                Student
              </option>

              <option value="mentor">
                Mentor
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

            {role === 'mentor' && (
              <div>

                <div className="text-sm font-medium mb-2">

                  Specialties

                </div>

                <div className="grid grid-cols-2 gap-2">

                  {MENTOR_SPECIALTIES.map(item=>(
                    <button
                      key={item}
                      type="button"
                      onClick={()=>
                        toggleSpecialty(item)
                      }
                      className={`border rounded-lg p-2 text-sm ${
                        specialties.includes(item)
                          ? 'border-teal-600 bg-teal-50'
                          : ''
                      }`}
                    >
                      {item}
                    </button>
                  ))}

                </div>

              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2"/>
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}