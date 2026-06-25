import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import { COUNTRIES, MENTOR_SPECIALTIES } from '../utils/helpers';
import type { UserRole } from '../types';

export default function CompleteProfilePage() {

  const navigate = useNavigate();

  const { user } = useAuthContext();

  const [fullName,setFullName] =
    useState('');

  const [country,setCountry] =
    useState('');

  const [role,setRole] =
    useState<UserRole>('student');

  const [specialties,setSpecialties] =
    useState<string[]>([]);

  const [loading,setLoading] =
    useState(false);

  const [error,setError] =
    useState<string | null>(null);

  const toggleSpecialty = (
    specialty:string
  ) => {

    setSpecialties(prev =>
      prev.includes(specialty)
      ? prev.filter(
          x => x!==specialty
        )
      : [
          ...prev,
          specialty
        ]
    );

  };

  const handleSubmit = async (
    e:React.FormEvent
  ) => {

    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {

      const roles =
        role === 'student'
        ? ['student']
        : ['student',role];

      const { error } =
        await supabase
          .from('profiles')
          .insert({

            id:user.id,

            email:user.email,

            full_name:
              fullName,

            role,

            roles,

            country_of_residence:
              country,

            specialty:
              role==='mentor'
              ? specialties
              : [],

            mentorship_available:
              role==='mentor',

            mentor_status:
              role==='mentor'
              ? 'pending'
              : null,

            admin_status:
              role==='admin'
              ? 'pending'
              : null,

            is_owner:false

          });

      if (error)
        throw error;

      navigate(
        '/dashboard'
      );

    }
    catch(err:any){

      setError(
        err.message
      );

    }
    finally{

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex justify-center items-center bg-slate-50">

      <div className="bg-white rounded-xl p-6 border shadow-sm w-full max-w-md">

        <h1 className="text-xl font-semibold mb-6">

          Complete Profile

        </h1>

        {error && (

          <div className="mb-4 text-red-600">

            {error}

          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            value={fullName}
            onChange={(e)=>
              setFullName(
                e.target.value
              )
            }
            placeholder="Full name"
            className="w-full border rounded-lg p-2"
          />

          <select
            value={country}
            onChange={(e)=>
              setCountry(
                e.target.value
              )
            }
            className="w-full border rounded-lg p-2"
          >

            <option value="">
              Select country
            </option>

            {COUNTRIES.map(
              c=>(
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              )
            )}

          </select>

          <select
            value={role}
            onChange={(e)=>
              setRole(
                e.target.value as UserRole
              )
            }
            className="w-full border rounded-lg p-2"
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

          {role==='mentor' && (

            <div className="grid grid-cols-2 gap-2">

              {MENTOR_SPECIALTIES.map(
                item=>(
                  <button
                    key={item}
                    type="button"
                    onClick={()=>
                      toggleSpecialty(
                        item
                      )
                    }
                    className={`border p-2 rounded-lg ${
                      specialties.includes(item)
                      ? 'bg-teal-50 border-teal-600'
                      : ''
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            </div>

          )}

          <button
            disabled={loading}
            className="w-full bg-teal-600 text-white rounded-lg py-3"
          >

            {loading
            ? 'Saving...'
            : 'Complete Profile'}

          </button>

        </form>

      </div>

    </div>

  );

}