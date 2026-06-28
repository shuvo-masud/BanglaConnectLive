import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Loader2, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  CheckCircle2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
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

    if (!fullName || fullName.length < 2) return setError('Please enter your full name');
    if (!email.includes('@')) return setError('Please enter a valid email address');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (!role) return setError('Please select your role');
    if (!country) return setError('Please select your country of residence');
    if (role === 'mentor' && specialties.length === 0)
      return setError('Please select at least one specialty');

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
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT SIDE: Branding & Features (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full -mr-32 -mt-32 opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-700 rounded-full -ml-48 -mb-48 opacity-30" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-teal-600" />
            </div>
            <span className="font-bold text-2xl tracking-tight">BanglaConnect</span>
          </Link>

          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Empowering the <br />
            <span className="text-teal-200">Global Bangladeshi</span> <br />
            Professional Network.
          </h2>

          <div className="space-y-6">
            {[
              "Connect with mentors worldwide",
              "Access exclusive job opportunities",
              "Share projects in the Community Vault",
              "Attend global networking events"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="text-teal-200 w-6 h-6" />
                <span className="text-lg text-teal-50">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-teal-100 text-sm italic">
            "Bridging the gap between home and the world."
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
            <p className="text-slate-500 mt-1">Start your journey with BanglaConnect today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* ROLE CARDS */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">I am joining as a...</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'student', label: 'Student', icon: GraduationCap },
                  { value: 'mentor', label: 'Mentor', icon: Briefcase },
                  { value: 'admin', label: 'Admin', icon: ShieldCheck },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value as UserRole)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      role === r.value
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <r.icon className={`w-6 h-6 mb-1 ${role === r.value ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold uppercase">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MENTOR SPECIALTIES (Conditional) */}
            {role === 'mentor' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Select your areas of expertise</p>
                <div className="flex flex-wrap gap-2">
                  {MENTOR_SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        specialties.includes(s)
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FORM INPUTS */}
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all appearance-none text-slate-700"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Country of residence</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}