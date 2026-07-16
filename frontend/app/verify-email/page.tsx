'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link. Please sign up again.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        );
        const json = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(json.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(json.message || 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    verifyEmail();
  }, [token, email]);

  return (
    <main className="min-h-screen flex items-center justify-center p-md relative overflow-hidden">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(-45deg, #58C6D7, #004ac6, #2563eb, #d3e4fe)',
          backgroundSize: '400% 400%',
          animation: 'gradientFlow 15s ease infinite',
        }}
      />
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl p-xl text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-blue-600 text-[32px] animate-spin">sync</span>
            </div>
            <h2 className="text-headline-lg font-bold text-on-surface mb-sm">Verifying...</h2>
            <p className="text-body-md text-on-surface-variant">Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-green-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <h2 className="text-headline-lg font-bold text-on-surface mb-sm">Email Verified!</h2>
            <p className="text-body-md text-on-surface-variant mb-lg">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full py-md rounded-lg text-label-md font-bold text-white text-center"
              style={{ backgroundColor: '#58C6D7' }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-red-600 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
            <h2 className="text-headline-lg font-bold text-on-surface mb-sm">Verification Failed</h2>
            <p className="text-body-md text-on-surface-variant mb-lg">{message}</p>
            <Link
              href="/signup"
              className="inline-block w-full py-md rounded-lg text-label-md font-bold text-white text-center"
              style={{ backgroundColor: '#58C6D7' }}
            >
              Sign Up Again
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-md">
        <p className="text-body-lg">Loading...</p>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
