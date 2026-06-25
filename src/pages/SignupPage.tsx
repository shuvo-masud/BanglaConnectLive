import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';

import { useAuthContext } from '../context/AuthContext';

export function SignupPage() {

  const navigate = useNavigate();

  const {
    signUp,
    user,
    loading: authLoading
  } = useAuthContext();

  const [email,setEmail] =
    useState('');

  const [password,setPassword] =
    useState('');

  const [loading,setLoading] =
    useState(false);

  const [error,setError] =
    useState<string | null>(null);

  const [success,setSuccess] =
    useState(false);

  // Redirect only if already authenticated
  useEffect(() => {

    if (authLoading) return;

    if (user) {

      navigate(
        '/dashboard',
        { replace:true }
      );

    }

  },[
    user,
    authLoading,
    navigate
  ]);


  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError(null);

    if (!email.trim()) {

      setError(
        'Email required'
      );

      return;
    }

    if (!email.includes('@')) {

      setError(
        'Please enter a valid email'
      );

      return;
    }

    if (password.length < 6) {

      setError(
        'Password must be at least 6 characters'
      );

      return;
    }

    setLoading(true);

    try {

      const result =
        await signUp(
          email,
          password,
          undefined,
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

    }
    catch(err:any){

      console.error(err);

      setError(
        err.message ||
        'Something went wrong'
      );

    }
    finally {

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

            Check your email and verify your account.

          </p>

          <p className="text-sm text-slate-500">

            After verification you'll continue to profile setup.

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
              type="email"
              value={email}
              onChange={(e)=>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Email"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="password"
              value={password}
              onChange={(e)=>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Password"
              className="w-full border rounded-lg px-3 py-2"
            />

            <button
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg"
            >

              {loading
              ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2"/>
                  Creating...
                </>
              )
              : (
                'Create Account'
              )}

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}