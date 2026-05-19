import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Activity, Users, Database } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen font-sans bg-white overflow-hidden">
      {/* Left Side: Animated Brand Area */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden flex-col justify-center items-center text-white p-12">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Animated glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating Abstract UI Elements */}
        <div className="relative z-10 w-full max-w-md h-96">
          <div className="absolute top-10 left-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-float">
            <Activity className="text-blue-400 w-10 h-10 mb-4" />
            <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
            <div className="h-2 w-16 bg-white/20 rounded"></div>
          </div>
          
          <div className="absolute top-40 right-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
            <Users className="text-green-400 w-10 h-10 mb-4" />
            <div className="h-2 w-20 bg-white/20 rounded mb-2"></div>
            <div className="h-2 w-12 bg-white/20 rounded"></div>
          </div>

          <div className="absolute bottom-10 left-20 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
            <Database className="text-yellow-400 w-10 h-10 mb-4" />
            <div className="h-2 w-28 bg-white/20 rounded mb-2"></div>
            <div className="h-2 w-20 bg-white/20 rounded"></div>
          </div>
        </div>

        <div className="relative z-10 mt-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Client Status Tracker
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Real-time insights, streamlined tracking, and comprehensive change request management for your firm.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-50 lg:bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10">
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Client Status Tracker</h2>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Please enter your credentials to sign in.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-sm p-3 rounded-lg border border-red-200 shadow-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700">Email address</label>
              <div className="mt-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="mt-1.5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 pr-10 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all gap-2 items-center"
              >
                {loading ? 'Signing in...' : <><LogIn size={18} /> Sign in</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
