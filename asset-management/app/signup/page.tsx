'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-md relative overflow-hidden">
      {/* Animated gradient background */}
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

      <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden min-h-[700px]">
        {/* Left — Brand Panel */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-xl text-white overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.35)), url('/images/building.avif')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div>
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              <span className="text-headline-lg font-bold tracking-tight">AssetFlow</span>
            </div>
            <div className="mt-xl max-w-sm">
              <h1 className="text-display font-bold leading-tight mb-md">Master Your Infrastructure.</h1>
              <p className="text-body-lg text-white/90">Join 500+ enterprises managing lifecycle, maintenance, and deployment with precision.</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-md mb-xl">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">verified</span>
              </div>
              <div>
                <p className="text-label-md font-bold uppercase tracking-wider">Enterprise Ready</p>
                <p className="text-body-sm text-white/80">SSO & Multi-region support</p>
              </div>
            </div>
            <p className="text-body-sm text-white/60">© 2024 AssetFlow Systems. All rights reserved.</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="w-full md:w-1/2 p-xl md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-xl">
            <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Create your account</h2>
            <p className="text-body-md text-on-surface-variant">Enter your professional details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Full Name */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="full_name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-md py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="email">Work Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-md py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Employee ID + Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant" htmlFor="employee_id">Employee ID</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                  <input
                    id="employee_id"
                    name="employee_id"
                    type="text"
                    required
                    placeholder="EMP-001"
                    className="w-full pl-11 pr-md py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant" htmlFor="department">Department</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">corporate_fare</span>
                  <select
                    id="department"
                    name="department"
                    required
                    className="w-full pl-11 pr-md py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="" disabled selected>Select...</option>
                    <option value="it">Information Technology</option>
                    <option value="ops">Operations</option>
                    <option value="hr">Human Resources</option>
                    <option value="fin">Finance</option>
                    <option value="log">Logistics</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-[48px] py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant px-1">Minimum 8 characters with at least one number.</p>
            </div>

            {error && (
              <p className="text-body-sm text-error bg-error-container px-md py-sm rounded-lg">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-lg py-3.5 rounded-lg text-title-lg font-bold flex items-center justify-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait text-white"
              style={{ backgroundColor: '#58C6D7' }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col items-center gap-md">
            <p className="text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="font-bold hover:underline" style={{ color: '#58C6D7' }}>
                Log in
              </Link>
            </p>
            <div className="flex items-center gap-xl">
              <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
