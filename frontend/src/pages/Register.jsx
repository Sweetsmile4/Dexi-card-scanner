import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ececec] [font-family:'Poppins',ui-sans-serif,system-ui,sans-serif]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.5fr]">
        <aside className="hidden bg-gradient-to-br from-[#4f0ca7] via-[#6017c7] to-[#8f4cf6] text-white lg:flex lg:items-center lg:justify-center">
          <div className="mx-auto max-w-sm px-10 text-center">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white">
              <span className="text-5xl font-bold text-[#2092e9]">De</span>
            </div>
            <h1 className="text-6xl font-semibold tracking-tight">Dexi</h1>
            <p className="mt-8 text-3xl font-medium leading-tight text-[#d9b6ff]">
              AI-Powered Business Card Digitizer. Scan, organize, and export your contacts effortlessly.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[520px] rounded-[24px] bg-[#ede6f7] p-8 shadow-[0_18px_50px_rgba(52,20,99,0.08)] sm:p-10">
            <div>
              <h2 className="text-5xl font-semibold tracking-tight text-[#1c1b26]">Create your account</h2>
              <p className="mt-4 text-2xl text-[#595668]">Start digitizing cards in seconds</p>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#cfc9da] bg-white px-4 py-3 text-lg font-medium text-[#2f2c3d] transition hover:bg-[#faf9fd]"
              >
                <span className="text-[#4285F4]">G</span>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#cfc9da] bg-white px-4 py-3 text-lg font-medium text-[#2f2c3d] transition hover:bg-[#faf9fd]"
              >
                <span>Apple</span>
              </button>
            </div>

            <div className="my-8 flex items-center gap-3 text-base text-[#3e3a4f]">
              <span className="h-px flex-1 bg-[#9c96ac]" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-[#9c96ac]" />
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <label htmlFor="name" className="sr-only">Full name</label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-[#cfc9da] bg-white py-3 pl-12 pr-4 text-lg text-[#22202f] placeholder:text-[#8f8a9d] focus:border-[#7c3aed] focus:outline-none"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#cfc9da] bg-white py-3 pl-12 pr-4 text-lg text-[#22202f] placeholder:text-[#8f8a9d] focus:border-[#7c3aed] focus:outline-none"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <Eye className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength="6"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#cfc9da] bg-white py-3 pl-12 pr-12 text-lg text-[#22202f] placeholder:text-[#8f8a9d] focus:border-[#7c3aed] focus:outline-none"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <Eye className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength="6"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#cfc9da] bg-white py-3 pl-12 pr-12 text-lg text-[#22202f] placeholder:text-[#8f8a9d] focus:border-[#7c3aed] focus:outline-none"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#5f16bf] to-[#8b3efb] py-3 text-2xl font-semibold text-white shadow-[0_10px_24px_rgba(99,38,184,0.28)] transition hover:brightness-105 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="pt-2 text-center text-2xl text-[#4b4859]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#651ad3] hover:text-[#7c32e9]">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
