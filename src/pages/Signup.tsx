import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../contexts/AuthContext';
import { signupSchema } from '../utils/validation';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

interface SignupFormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const success = await signup(data);
      if (success) navigate('/dashboard');
    } catch {
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        .s-a0 { animation: fadeSlideUp .45s ease both .05s; }
        .s-a1 { animation: fadeSlideUp .45s ease both .12s; }
        .s-a2 { animation: fadeSlideUp .45s ease both .19s; }
        .s-a3 { animation: fadeSlideUp .45s ease both .26s; }
        .s-a4 { animation: fadeSlideUp .45s ease both .33s; }
        .s-a5 { animation: fadeSlideUp .45s ease both .40s; }
        .s-a6 { animation: fadeSlideUp .45s ease both .47s; }
        .s-a7 { animation: fadeSlideUp .45s ease both .54s; }
        .s-panel { animation: fadeIn .7s ease both; }
        .s-feat  { animation: floatCard 5s ease-in-out infinite; }
        .s-feat:hover { transform: translateX(4px) !important; background: rgba(255,255,255,0.18) !important; }
      `}</style>

      <div className="auth-page" style={{ height: '100dvh', display: 'flex', overflow: 'hidden' }}>

        {/* ── Left branding panel ── */}
        <div className="s-panel auth-brand-panel hidden lg:flex flex-col justify-between flex-shrink-0 p-10"
          style={{ width: '380px' }}>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.18)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-wide">VARTALAP</span>
            </div>
            <h2 className="text-[1.6rem] font-bold text-white leading-snug mb-3">
              Join the community.<br />Start connecting today.
            </h2>
            <p style={{ color: 'rgba(221,214,254,0.80)' }} className="text-sm leading-relaxed">
              Create your account in seconds and dive into real conversations.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: '💬', label: 'Real-time messaging',    delay: '0s'   },
              { icon: '📸', label: 'Share moments & stories', delay: '0.3s' },
              { icon: '🔒', label: 'Private & secure',        delay: '0.6s' },
            ].map((f) => (
              <div key={f.label} className="s-feat auth-feature-item flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ animationDelay: f.delay }}>
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="relative flex-1 flex items-center justify-center p-5" style={{ overflowY: 'auto' }}>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="s-a0 lg:hidden text-center mb-6">
              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--primary-light)' }}>VARTALAP</h1>
              <p className="auth-sublabel text-sm mt-1">Connect · Share · Thrive</p>
            </div>

            {/* Heading */}
            <div className="s-a0 mb-5">
              <h1 className="auth-heading text-2xl font-bold">Create your account</h1>
              <p className="auth-sublabel text-sm mt-1">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

              {/* Username */}
              <div className="s-a1">
                <label className="auth-label block text-xs font-medium mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}><User size={15} /></span>
                  <input {...register('username')} type="text" placeholder="Create Username"
                    className={`auth-input w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none${errors.username ? ' error' : ''}`} />
                </div>
                {errors.username && <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.username.message}</p>}
              </div>

              {/* Email */}
              <div className="s-a2">
                <label className="auth-label block text-xs font-medium mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}><Mail size={15} /></span>
                  <input {...register('email')} type="email" placeholder="you@example.com"
                    className={`auth-input w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none${errors.email ? ' error' : ''}`} />
                </div>
                {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="s-a3">
                <label className="auth-label block text-xs font-medium mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}><Phone size={15} /></span>
                  <input {...register('phone')} type="tel" placeholder="Mobile Number"
                    className={`auth-input w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none${errors.phone ? ' error' : ''}`} />
                </div>
                {errors.phone && <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="s-a4">
                <label className="auth-label block text-xs font-medium mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}><Lock size={15} /></span>
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    className={`auth-input w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border outline-none${errors.password ? ' error' : ''}`} />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="s-a5">
                <label className="auth-label block text-xs font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}><Lock size={15} /></span>
                  <input {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••"
                    className={`auth-input w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border outline-none${errors.confirmPassword ? ' error' : ''}`} />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs" style={{ color: 'var(--input-error)' }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit */}
              <div className="s-a6 pt-1">
                <button type="submit" disabled={loading}
                  className="shimmer-btn-su w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ boxShadow: '0 4px 14px var(--primary-glow)' }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</>
                    : <>Sign Up<ArrowRight size={15} /></>
                  }
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="s-a7 flex items-center gap-3 my-4">
              <div className="flex-1 h-px auth-divider" />
              <span className="auth-sublabel text-xs whitespace-nowrap">Already have an account?</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            <div className="s-a7">
              <Link to="/login"
                className="outline-auth-btn w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border">
                Sign In to Account
              </Link>
            </div>

            <p className="s-a7 text-center text-xs mt-4 auth-sublabel">
              By signing up, you agree to our{' '}
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

export default Signup;