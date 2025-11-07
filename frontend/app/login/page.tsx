'use client';

import { useState } from 'react';
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
  
  const { requestOTP, login } = useAuth();
  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await requestOTP(email);
      setDevOTP(response.otp);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PlakshaConnect
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Connect, collaborate, and grow together
          </p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">Welcome back</h2>
                <p className="text-gray-400 text-sm">Enter your email to get started</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@plaksha.edu.in"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
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
                  className="text-sm text-gray-400 hover:text-gray-300 mb-4"
                >
                  ← Change email
                </button>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">Enter OTP</h2>
                <p className="text-gray-400 text-sm">
                  We sent a code to <span className="text-blue-400">{email}</span>
                </p>
              </div>

              {devOTP && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Development OTP:</p>
                  <p className="text-blue-400 font-mono text-lg">{devOTP}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">6-digit code</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
                <FiCheck />
              </button>

              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Didn't receive the code? Resend
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to PlakshaConnect's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
