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
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
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

  const handleGoogleLogin = async () => {
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
              toast.error('Google sign-in was cancelled.');
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
                toast.error('Google login failed. Please try again.');
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
      toast.error('Google Sign-In failed. Please try again.');
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
            <div className="l-a0 mb-5">
              <h1 className="auth-heading text-2xl font-bold">Sign in to your account</h1>
              <p className="auth-sublabel text-sm mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email / Username / Phone */}
              <div className="l-a1">
                <label className="auth-label block text-sm font-medium mb-1.5">Username, Email or Phone</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    {...register('emailOrPhone')}
                    type="text"
                    placeholder="Enter username, email, or phone"
                    autoComplete="username"
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

            {/* Divider for Google */}
            <div className="l-a3 flex items-center gap-3 my-4">
              <div className="flex-1 h-px auth-divider" />
              <span className="auth-sublabel text-xs font-medium uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            {/* Google Login Button */}
            <div className="l-a4 mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
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

            {/* Divider for Signup link */}
            <div className="l-a4 flex items-center gap-3 my-4">
              <div className="flex-1 h-px auth-divider" />
              <span className="auth-sublabel text-xs font-medium whitespace-nowrap">Don't have an account?</span>
              <div className="flex-1 h-px auth-divider" />
            </div>

            {/* Sign up link */}
            <div className="l-a5">
              <Link to="/signup"
                className="outline-auth-btn w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border">
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;