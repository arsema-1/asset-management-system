'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'admin') {
        const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (email !== validEmail || password !== validPassword) {
          setError('Invalid email or password.');
          setLoading(false);
          return;
        }
        router.push('/admin/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="phone-frame" aria-label="Login">
        <div className="auth-card">
          <h1>Login</h1>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <label htmlFor="role">Login As</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="alert error">{error}</p>}

            <div className="auth-actions">
              <Link href="/signup" className="small-link">
                SignUp
              </Link>
              <Link href="/forgot-password" className="small-link">
                Forget Password?
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="arrow-button"
                aria-label="Login"
              >
                {loading ? '...' : <Image src="/icons/next_icon.png" alt="Login" width={28} height={28} />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
