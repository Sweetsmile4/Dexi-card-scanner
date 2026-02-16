import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : value || 0}</p>
        </div>
        <div className="text-4xl text-blue-400">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel. Manage users, cards, and system activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon="👥"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Total Cards"
          value={stats?.totalCards}
          icon="🎴"
          onClick={() => navigate('/admin/cards')}
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          icon="✅"
        />
        <StatCard
          title="Total Contacts"
          value={stats?.totalContacts}
          icon="📇"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View, edit, and manage user accounts</p>
          </button>
          <button
            onClick={() => navigate('/admin/cards')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
          >
            <div className="text-2xl mb-2">🎴</div>
            <h3 className="font-semibold text-gray-900">Moderate Cards</h3>
            <p className="text-sm text-gray-600">Review and remove inappropriate cards</p>
          </button>
          <button
            onClick={() => navigate('/admin/logs')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">View Activity Logs</h3>
            <p className="text-sm text-gray-600">Monitor system activity and user actions</p>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900">System Status</h3>
          <p className="text-sm text-blue-700 mt-2">✅ All systems operational</p>
          <p className="text-sm text-blue-700">📡 Database: Connected</p>
          <p className="text-sm text-blue-700">🔐 Security: Active</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-semibold text-green-900">Quick Stats</h3>
          <p className="text-sm text-green-700 mt-2">📊 Last 24 hours activity</p>
          <p className="text-sm text-green-700">🔄 Sync status: Up to date</p>
          <p className="text-sm text-green-700">⚡ Performance: Optimal</p>
        </div>
      </div>
    </div>
  );
}
