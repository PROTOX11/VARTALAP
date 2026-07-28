import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId || clientId.includes('your_google_client_id_here')) {
        toast.error('Google Client ID is not configured in .env file.');
        setGoogleLoading(false);
        return;
      }

      if (typeof window === 'undefined' || !(window as any).google) {
        toast.error('Google Sign-In SDK is loading. Please try again in a moment.');
        setGoogleLoading(false);
        return;
      }

      // Priority 1: Google OAuth2 Token Client (Opens Google Sign-In Popup window)
      if ((window as any).google?.accounts?.oauth2) {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.error('Google OAuth error:', tokenResponse.error);
              toast.error('Google sign-up was cancelled.');
              setGoogleLoading(false);
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                if (res.ok) {
                  const userInfo = await res.json();
                  const success = await googleLogin({
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    googleId: userInfo.sub,
                    accessToken: tokenResponse.access_token
                  });
                  if (success) {
                    navigate('/dashboard');
                  }
                } else {
                  toast.error('Could not fetch user profile from Google.');
                }
              } catch (err) {
                console.error(err);
                toast.error('Google sign-up failed. Please try again.');
              } finally {
                setGoogleLoading(false);
              }
            } else {
              setGoogleLoading(false);
            }
          },
        });

        client.requestAccessToken();
        return;
      }

      // Priority 2: Google ID Token (window.google.accounts.id)
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              const success = await googleLogin(response.credential);
              if (success) navigate('/dashboard');
            }
            setGoogleLoading(false);
          }
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            toast.error('Google popup/One-Tap failed to open. Please check pop-up settings.');
            setGoogleLoading(false);
          }
        });
        return;
      }

    } catch (err) {
      console.error(err);
      toast.error('Google Sign-Up failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .s-a0 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .05s; }
        .s-a1 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .10s; }
        .s-a2 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .15s; }
        .s-a3 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .20s; }
        .s-a4 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .25s; }
        .s-a5 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .30s; }
        .s-a6 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .35s; }
        .s-a7 { animation: fadeSlideUp .45s cubic-bezier(0.16, 1, 0.3, 1) both .40s; }
        .s-panel { animation: fadeIn .7s ease both; }
        .s-feat  { transition: all 0.3s ease; }
        .s-feat:hover { transform: translateX(6px) !important; background: rgba(255,255,255,0.2) !important; }
        .glow-blob-1 {
          position: absolute; width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          animation: pulseGlow 8s ease-in-out infinite; pointer-events: none;
        }
        .glow-blob-2 {
          position: absolute; width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, oklch(0.65 0.18 240 / 0.25) 0%, transparent 70%);
          animation: pulseGlow 10s ease-in-out infinite reverse; pointer-events: none;
        }
        .input-group-focus:focus-within svg {
          color: var(--primary-light) !important;
        }
        .google-auth-btn {
          background: var(--card);
          color: var(--card-foreground);
          border-color: var(--border);
          transition: all 0.25s ease !important;
        }
        .google-auth-btn:hover:not(:disabled) {
          background: var(--muted) !important;
          border-color: var(--primary-light) !important;
          box-shadow: 0 4px 14px var(--primary-glow) !important;
          transform: translateY(-1px);
        }
        .google-auth-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      <div className="auth-page relative" style={{ height: '100dvh', display: 'flex', overflow: 'hidden' }}>

        {/* ── Left branding panel ── */}
        <div className="s-panel auth-brand-panel hidden lg:flex flex-col justify-between flex-shrink-0 p-12 relative overflow-hidden"
          style={{ width: '420px', background: 'linear-gradient(145deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)' }}>
          
          {/* Decorative ambient elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/20"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                </svg>
              </div>
              <span className="text-white font-extrabold text-2xl tracking-wider">VARTALAP</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-200 mb-6"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>Next-Gen Communication</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Create an account.<br />Connect instantly with the world.
            </h2>
            <p style={{ color: 'rgba(237,233,254,0.85)' }} className="text-sm leading-relaxed max-w-sm">
              Step into a seamless social experience engineered for privacy, speed, and real-time interaction.
            </p>
          </div>

          <div className="space-y-3.5 relative z-10">
            {[
              { icon: Zap, label: 'Real-time lightning-fast chat', sub: 'Instant messaging with zero delay' },
              { icon: CheckCircle2, label: 'Rich stories & media sharing', sub: 'Express yourself with full control' },
              { icon: ShieldCheck, label: 'End-to-end privacy focused', sub: 'Your data stays encrypted & safe' },
            ].map((f) => {
              const IconComp = f.icon;
              return (
                <div key={f.label} className="s-feat auth-feature-item flex items-start gap-3.5 px-4 py-3.5 rounded-2xl cursor-default"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="p-2 rounded-lg mt-0.5" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <IconComp size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">{f.label}</span>
                    <span className="text-xs text-purple-200/70 block mt-0.5">{f.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="relative flex-1 flex items-center justify-center p-6 md:p-10" style={{ overflowY: 'auto' }}>
          {/* Ambient Glow Background Blobs */}
          <div className="glow-blob-1 -top-10 -left-10" />
          <div className="glow-blob-2 -bottom-10 -right-10" />

          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[420px] relative z-10 my-auto py-4">
            {/* Mobile logo */}
            <div className="s-a0 lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600/10 mb-3 border border-purple-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                  <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--primary-light)' }}>VARTALAP</h1>
              <p className="auth-sublabel text-xs mt-1 font-medium">Connect · Share · Thrive</p>
            </div>

            {/* Heading */}
            <div className="s-a0 mb-5 text-center lg:text-left">
              <h1 className="auth-heading text-2xl md:text-3xl font-extrabold tracking-tight">Create your account</h1>
              <p className="auth-sublabel text-sm mt-1.5">Enter your details to register for free</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

              {/* Username */}
              <div className="s-a1 input-group-focus">
                <label className="auth-label block text-xs font-semibold mb-1 tracking-wide">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}><User size={16} /></span>
                  <input {...register('username')} type="text" placeholder="johndoe"
                    className={`auth-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all shadow-sm${errors.username ? ' error' : ''}`} />
                </div>
                {errors.username && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--input-error)' }}>{errors.username.message}</p>}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div className="s-a2 input-group-focus">
                  <label className="auth-label block text-xs font-semibold mb-1 tracking-wide">Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}><Mail size={16} /></span>
                    <input {...register('email')} type="email" placeholder="you@example.com"
                      className={`auth-input w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all shadow-sm${errors.email ? ' error' : ''}`} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--input-error)' }}>{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div className="s-a3 input-group-focus">
                  <label className="auth-label block text-xs font-semibold mb-1 tracking-wide">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}><Phone size={16} /></span>
                    <input {...register('phone')} type="tel" placeholder="+1234567890"
                      className={`auth-input w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all shadow-sm${errors.phone ? ' error' : ''}`} />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--input-error)' }}>{errors.phone.message}</p>}
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password */}
                <div className="s-a4 input-group-focus">
                  <label className="auth-label block text-xs font-semibold mb-1 tracking-wide">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}><Lock size={16} /></span>
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      className={`auth-input w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border outline-none transition-all shadow-sm${errors.password ? ' error' : ''}`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:opacity-100 opacity-70 transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--input-error)' }}>{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="s-a5 input-group-focus">
                  <label className="auth-label block text-xs font-semibold mb-1 tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}><Lock size={16} /></span>
                    <input {...register('confirmPassword')} type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••"
                      className={`auth-input w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border outline-none transition-all shadow-sm${errors.confirmPassword ? ' error' : ''}`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:opacity-100 opacity-70 transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--input-error)' }}>{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="s-a6 pt-2">
                <button type="submit" disabled={loading}
                  className="shimmer-btn-su w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ boxShadow: '0 4px 18px var(--primary-glow)' }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</>
                    : <>Create Account<ArrowRight size={16} /></>
                  }
                </button>
              </div>
            </form>

            {/* Divider for Google Login */}
            <div className="s-a6 flex items-center gap-3 my-4">
              <div className="flex-1 h-px auth-divider" />
              <span className="auth-sublabel text-xs font-medium uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            {/* Google Signup Button */}
            <div className="s-a6 mb-4">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="google-auth-btn w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold border shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-purple-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider for Sign In link */}
            <div className="s-a7 flex items-center gap-3 my-4">
              <div className="flex-1 h-px auth-divider" />
              <span className="auth-sublabel text-xs font-medium whitespace-nowrap">Already have an account?</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            <div className="s-a7">
              <Link to="/login"
                className="outline-auth-btn w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border">
                Sign In to Account
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;