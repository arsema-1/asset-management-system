'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [validParams, setValidParams] = useState(!!token && !!emailParam);

  useEffect(() => {
    if (!token || !emailParam) {
      setValidParams(false);
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [token, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await auth.resetPassword(token!, emailParam!, password);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!validParams) {
    return (
      <main className="auth-page">
        <section className="phone-frame" aria-label="Invalid Reset Link">
          <div className="auth-card">
            <div className="success-mark" style={{ background: '#fff0f0', color: '#c93434' }}>!</div>
            <h2>Invalid Link</h2>
            <p className="auth-subtitle">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/forgot-password" className="primary-link">
                Request New Link
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (success) {
    return (
      <main className="auth-page">
        <section className="phone-frame">
          <div className="auth-card success-card">
            <div className="success-mark">✓</div>
            <h2>Password Reset!</h2>
            <p className="auth-subtitle">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link href="/login" className="primary-link">
              Back to Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="phone-frame" aria-label="Reset Password">
        <div className="auth-card">
          <h1>Set New Password</h1>
          <p className="auth-subtitle">
            Enter your new password below. Make sure it&apos;s at least 6 characters.
          </p>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <label htmlFor="password">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#696f7c',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && <p className="alert error">{error}</p>}

            <div className="auth-actions">
              <Link href="/login" className="small-link">
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="arrow-button"
                aria-label="Reset password"
              >
                {loading ? '...' : <Image src="/icons/next_icon.png" alt="Reset" width={28} height={28} />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <section className="phone-frame">
            <div className="auth-card" style={{ textAlign: 'center' }}>
              <p>Loading...</p>
            </div>
          </section>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
