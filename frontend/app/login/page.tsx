'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { FiMail, FiLock, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOTP, setDevOTP] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { requestOTP, login } = useAuth();
  const router = useRouter();

  // Prevent hydration mismatch from browser extensions
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await requestOTP(email);
      // Backend returns OTP when in dev mode or when email fails (SMTP Bypass)
      if (response.otp) {
        setDevOTP(response.otp);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, otp);
      
      if (response.requires_registration) {
        router.push(`/register?email=${email}&token=${response.verification_token}`);
      } else {
        localStorage.setItem('access_token', response.token.access_token);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration issues from browser extensions
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            PlakshaConnect
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Connect, collaborate, and grow together
          </p>
        </div>

        <div className="card animate-slide-up p-6 md:p-8">
          {step === 'email' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">Welcome back</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your email to get started</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <div className="relative" suppressHydrationWarning>
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@plaksha.edu.in"
                    required
                    className="input-field pl-10"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Continue'}
                <FiArrowRight />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-primary dark:text-secondary hover:text-primary-light dark:hover:text-secondary-light mb-4 transition-colors"
                >
                  ← Change email
                </button>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">Enter OTP</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {devOTP ? (
                    <>Check the OTP below (SMTP not configured)</>
                  ) : (
                    <>We sent a code to <span className="text-primary dark:text-secondary font-medium">{email}</span></>
                  )}
                </p>
              </div>

              {devOTP && (
                <div className="p-4 bg-secondary/10 dark:bg-secondary/20 border-2 border-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">🚀 SMTP Bypass Mode Active</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Your OTP (no email server needed):</p>
                  <div className="flex items-center justify-between bg-white dark:bg-black/30 rounded-lg p-3 border border-secondary/20">
                    <p className="text-secondary font-mono text-2xl font-bold tracking-wider">{devOTP}</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(devOTP);
                      }}
                      className="text-xs px-3 py-1 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-secondary font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">6-digit code</label>
                <div className="relative" suppressHydrationWarning>
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="input-field pl-10 text-center text-2xl tracking-widest font-mono"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
                <FiCheck />
              </button>

              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
              >
                Didn&apos;t receive the code? Resend
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
          By continuing, you agree to PlakshaConnect&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
