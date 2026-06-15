import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema } from '../utils/validation';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const success = await login(data.emailOrPhone, data.password);
      if (success) navigate('/dashboard');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .l-a0 { animation: fadeSlideUp .5s ease both .05s; }
        .l-a1 { animation: fadeSlideUp .5s ease both .15s; }
        .l-a2 { animation: fadeSlideUp .5s ease both .25s; }
        .l-a3 { animation: fadeSlideUp .5s ease both .35s; }
        .l-a4 { animation: fadeSlideUp .5s ease both .45s; }
        .l-a5 { animation: fadeSlideUp .5s ease both .55s; }
        .l-panel { animation: fadeIn .7s ease both; }
        .l-feat  { animation: floatCard 5s ease-in-out infinite; }
        .l-feat:hover { transform: translateX(4px) !important; background: rgba(255,255,255,0.18) !important; }
        .l-forgot { color: var(--primary-light); }
        .l-forgot:hover { opacity: 0.8; }
      `}</style>

      <div className="auth-page" style={{ height: '100dvh', display: 'flex', overflow: 'hidden' }}>

        {/* ── Left branding panel ── */}
        <div className="l-panel auth-brand-panel hidden lg:flex flex-col justify-between flex-shrink-0 p-10"
          style={{ width: '400px' }}>
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.18)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-wide">VARTALAP</span>
            </div>
            <h2 className="text-[1.75rem] font-bold text-white leading-snug mb-3">
              Connect, share,<br />and thrive together.
            </h2>
            <p style={{ color: 'rgba(221,214,254,0.80)' }} className="text-sm leading-relaxed">
              Your social space — built for real conversations and genuine connections.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: '💬', label: 'Real-time messaging',    delay: '0s'   },
              { icon: '📸', label: 'Share moments & stories', delay: '0.3s' },
              { icon: '🔒', label: 'Private & secure',        delay: '0.6s' },
            ].map((f) => (
              <div key={f.label} className="l-feat auth-feature-item flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ animationDelay: f.delay }}>
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="relative flex-1 flex items-center justify-center p-6" style={{ overflowY: 'auto' }}>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="l-a0 lg:hidden text-center mb-8">
              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--primary-light)' }}>VARTALAP</h1>
              <p className="auth-sublabel text-sm mt-1">Connect · Share · Thrive</p>
            </div>

            {/* Heading */}
            <div className="l-a0 mb-6">
              <h1 className="auth-heading text-2xl font-bold">Sign in to your account</h1>
              <p className="auth-sublabel text-sm mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email / Phone */}
              <div className="l-a1">
                <label className="auth-label block text-sm font-medium mb-1.5">Mobile Number or Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    {...register('emailOrPhone')}
                    type="text"
                    placeholder="you@example.com"
                    className={`auth-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none${errors.emailOrPhone ? ' error' : ''}`}
                  />
                </div>
                {errors.emailOrPhone && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.emailOrPhone.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="l-a2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="auth-label text-sm font-medium">Password</label>
                  <a href="#" className="l-forgot text-xs font-medium">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`auth-input w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border outline-none${errors.password ? ' error' : ''}`}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="l-a3 pt-1">
                <button type="submit" disabled={loading}
                  className="shimmer-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ boxShadow: '0 4px 14px var(--primary-glow)' }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</>
                    : <>Sign In<ArrowRight size={16} /></>
                  }
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="l-a4 flex items-center gap-3 my-5">
              <div className="flex-1 h-px auth-divider" />
              <span className="auth-sublabel text-xs whitespace-nowrap">Don't have an account?</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            {/* Sign up link */}
            <div className="l-a5">
              <Link to="/signup"
                className="outline-auth-btn w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border">
                Create a new account
              </Link>
            </div>

            <p className="l-a5 text-center text-xs mt-5 auth-sublabel">
              By signing in, you agree to our{' '}
              <a href="#" className="underline opacity-70 hover:opacity-100">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline opacity-70 hover:opacity-100">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;