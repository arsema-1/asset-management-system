'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      console.log('Signup attempt:', formData);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        department: '',
      });
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="auth-page">
        <section className="phone-frame">
          <div className="auth-card success-card">
            <div className="success-mark">OK</div>
            <h2>Signup Successful!</h2>
            <p className="auth-subtitle">
              Your account has been created. You can now log in with your credentials.
            </p>
            <Link href="/login" className="primary-link">
              Go to Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="phone-frame signup-frame" aria-label="Sign up">
        <div className="auth-card">
          <h1>SignUp</h1>
          <p className="auth-subtitle">Employee Registration</p>

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field-grid">
              <div className="field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="employeeId">Employee ID</label>
                <input
                  id="employeeId"
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <p className="alert error">{error}</p>}

            <div className="auth-actions">
              <Link href="/login" className="small-link">
                Login
              </Link>
              <Link href="/forgot-password" className="small-link">
                Forget Password?
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="arrow-button dark"
                aria-label="Create account"
              >
                {loading ? '...' : <Image src="/icons/next_icon.png" alt="Next" width={28} height={28} />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
