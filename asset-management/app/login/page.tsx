'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 1200));

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      router.push('/admin/dashboard');
    } else if (password.length >= 6) {
      router.push('/employee/dashboard');
    } else {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-md"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #d4f2f7 50%, #58C6D7 100%)',
        backgroundSize: '400% 400%',
      }}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary-fixed opacity-20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] opacity-30 blur-[100px] rounded-full" style={{ backgroundColor: '#cff4f9' }} />
      </div>

      <div className="w-full max-w-[440px] z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-xl">
          <Image src="/images/AssetFlow_logo-removebg-preview.png" alt="AssetFlow" width={160} height={48} className="object-contain mb-xs" />
          <p className="text-body-md text-on-surface-variant">Enterprise Manager</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant shadow-lg">
          <div className="mb-lg">
            <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Welcome back</h2>
            <p className="text-body-md text-on-surface-variant">Please enter your details to sign in to your organization.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Email */}
            <div className="space-y-base">
              <label className="text-label-md text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-[48px] pr-md py-[10px] rounded-lg border border-outline bg-white text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-base">
              <div className="flex justify-between items-center">
                <label className="text-label-md text-on-surface" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-label-md font-bold hover:underline" style={{ color: '#58C6D7' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-[48px] pr-[48px] py-[10px] rounded-lg border border-outline bg-white text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-sm py-xs">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-outline"
              />
              <label htmlFor="remember" className="text-label-md text-on-surface-variant">
                Remember this device for 30 days
              </label>
            </div>

            {error && (
              <p className="text-body-sm text-error bg-error-container px-md py-sm rounded-lg">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-md rounded-lg text-label-md font-bold flex items-center justify-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait text-white"
              style={{ backgroundColor: '#58C6D7' }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-lg pt-lg border-t border-outline-variant text-center">
            <p className="text-body-sm text-on-surface-variant">
              Don't have an account yet?{' '}
              <Link href="/signup" className="text-label-sm font-bold hover:underline ml-xs" style={{ color: '#58C6D7' }}>
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-xl flex flex-col items-center gap-md">
          <div className="flex items-center gap-md text-on-surface-variant">
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-label-sm">System Operational</span>
            </div>
            <span className="text-outline-variant">|</span>
            <a href="#" className="text-label-sm hover:text-primary transition-colors">Security Center</a>
          </div>
          <p className="text-label-sm text-on-surface-variant text-center opacity-60">
            © 2024 AssetFlow Systems. Protected by enterprise-grade encryption.
          </p>
        </div>
      </div>
    </main>
  );
}
