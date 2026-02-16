import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, Activity, LogOut, Shield } from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/cards', icon: CreditCard, label: 'Cards' },
    { path: '/admin/logs', icon: Activity, label: 'Activity Logs' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold text-white">Dexi Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">{user?.name}</span>
              <button onClick={handleLogout} className="btn bg-gray-700 text-white hover:bg-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
