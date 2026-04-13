import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard, Mail, Lock, Eye } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials and try again.';
      toast.error(errorMessage);
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
              <span className="text-4xl font-bold text-[#2092e9]">De</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Dexi</h1>
            <p className="mt-8 text-xl font-medium leading-tight text-[#d9b6ff]">
              AI-Powered Business Card Digitizer. Scan, organize, and export your contacts effortlessly.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[520px] rounded-[24px] bg-[#ede6f7] p-8 shadow-[0_18px_50px_rgba(52,20,99,0.08)] sm:p-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#1c1b26]">Welcome back</h2>
              <p className="mt-3 text-base text-[#595668]">Sign in to access your card library</p>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#cfc9da] bg-white px-4 py-3 text-base font-medium text-[#2f2c3d] transition hover:bg-[#faf9fd]"
              >
                <span className="text-[#4285F4]">G</span>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#cfc9da] bg-white px-4 py-3 text-base font-medium text-[#2f2c3d] transition hover:bg-[#faf9fd]"
              >
                <span>Apple</span>
              </button>
            </div>

            <div className="my-8 flex items-center gap-3 text-base text-[#3e3a4f]">
              <span className="h-px flex-1 bg-[#9c96ac]" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-[#9c96ac]" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8f8a9d]" />
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#cfc9da] bg-white py-3 pl-12 pr-4 text-base text-[#22202f] placeholder:text-[#8f8a9d] focus:border-[#7c3aed] focus:outline-none"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#cfc9da] bg-white py-3 pl-12 pr-12 text-base text-[#22202f] placeholder:text-[#8f8a9d] focus:border-[#7c3aed] focus:outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl bg-gradient-to-r from-[#5f16bf] to-[#8b3efb] py-3 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(99,38,184,0.28)] transition hover:brightness-105 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="pt-3 text-center text-base text-[#4b4859]">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-[#651ad3] hover:text-[#7c32e9]">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
