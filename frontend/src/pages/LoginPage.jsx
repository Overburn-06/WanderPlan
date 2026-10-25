import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { 
  Compass, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#eef2f6]">
      
      {/* Left Column: Image on Left */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-slate-900 text-white">
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-900/20" />
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            WanderPlan
          </span>
        </div>

        {/* Feature Text */}
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide text-white">
            Day-by-Day Travel Itineraries
          </span>
          <h2 className="font-heading text-4xl font-extrabold text-white leading-tight">
            Design journeys you'll never forget. Together.
          </h2>
          <p className="text-slate-200 text-sm leading-relaxed">
            Drag and drop activities between travel days, plot route stops on an interactive map, invite friends to collaborate, and track spending effortlessly.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20 text-xs">
            <div className="bg-black/25 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <p className="font-bold text-white">Day Cards</p>
              <p className="text-slate-300 text-[11px] mt-0.5">Auto-generated</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <p className="font-bold text-white">Leaflet Map</p>
              <p className="text-slate-300 text-[11px] mt-0.5">Numbered pins</p>
            </div>
            <div className="bg-black/25 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <p className="font-bold text-white">Collaborate</p>
              <p className="text-slate-300 text-[11px] mt-0.5">Editor & Viewer</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-300">
          © 2026 WanderPlan. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form Area with Light Background Color */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-[#eef2f6]">
        <div className="w-full max-w-md bg-white p-8 sm:p-9 rounded-2xl border border-slate-200/90 shadow-md space-y-6">
          
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-heading text-xl font-bold text-slate-900">WanderPlan</span>
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Prominent, guaranteed solid button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/30 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span className="text-white">Signing in...</span>
              ) : (
                <>
                  <span className="text-white font-semibold">Sign In</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
