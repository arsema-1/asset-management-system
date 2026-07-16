'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await auth.forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="auth-page">
        <section className="phone-frame">
          <div className="auth-card success-card">
            <div className="success-mark">✓</div>
            <h2>Email Sent!</h2>
            <p className="auth-subtitle">
              Check your inbox for a password reset link. It may take a few minutes to arrive.
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
      <section className="phone-frame" aria-label="Forgot Password">
        <div className="auth-card">
          <h1>Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            {error && <p className="alert error">{error}</p>}

            <div className="auth-actions">
              <Link href="/login" className="small-link">
                Back to Login
              </Link>
              <Link href="/signup" className="small-link">
                SignUp
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="arrow-button"
                aria-label="Send reset link"
              >
                {loading ? '...' : <Image src="/icons/next_icon.png" alt="Send" width={28} height={28} />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
