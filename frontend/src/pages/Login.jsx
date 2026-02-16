import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard, Mail, Lock } from 'lucide-react';

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
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Dexi</h2>
          <p className="mt-2 text-sm text-gray-600">AI Powered Visiting Card Scanner</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required className="input pl-10" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" required className="input pl-10" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-lg disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
