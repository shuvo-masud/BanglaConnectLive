import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { signIn, user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user && !submitting) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, submitting, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn(email.trim(), password);
      if (!mountedRef.current) return;

      if (result.error) {
        setError(result.error.message || 'Invalid email or password.');
        setSubmitting(false);
      } else {
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const isLoading = authLoading || submitting;

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT SIDE: Brand & Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/BC_landing.png" 
            alt="Global Connectivity" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-slate-900/90 to-slate-900" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16 group">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight">BanglaConnect</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Welcome back to your <br />
              <span className="text-teal-400 font-serif italic">Global Community.</span>
            </h2>
            
            <div className="space-y-5">
              {[
                "Access your personal vault",
                "Check new job opportunities",
                "Message your mentors",
                "Join live community events"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <CheckCircle2 className="text-teal-400 w-4 h-4" />
                  </div>
                  <span className="text-slate-300 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} BanglaConnect. Empowering the diaspora.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">BanglaConnect</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors font-medium">
                <ChevronLeft className="w-4 h-4" /> Back to home
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>
              <p className="text-slate-500 mt-2">Enter your credentials to access your account.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-bold text-teal-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-600">
                New to BanglaConnect?{' '}
                <Link to="/signup" className="font-bold text-teal-600 hover:text-teal-700 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}