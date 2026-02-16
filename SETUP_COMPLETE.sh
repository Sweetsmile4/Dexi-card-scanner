#!/bin/bash

# Complete Frontend Component Generator
# This creates all remaining React components

FRONTEND_SRC="/home/claude/dexi-card-scanner/frontend/src"

echo "🚀 Generating all frontend components..."

# ============= USER LAYOUT =============
cat > "$FRONTEND_SRC/components/layouts/UserLayout.jsx" << 'EOF'
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Upload, Users, Tag, LogOut, CreditCard } from 'lucide-react';

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Card' },
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/tags', icon: Tag, label: 'Tags' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Dexi</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-outline flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
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
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
EOF

# ============= ADMIN LAYOUT =============
cat > "$FRONTEND_SRC/components/layouts/AdminLayout.jsx" << 'EOF'
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
EOF

echo "✅ Layout components created"

# ============= USER DASHBOARD =============
cat > "$FRONTEND_SRC/pages/user/Dashboard.jsx" << 'EOF'
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CreditCard, Users, Star, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/user');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cards Uploaded</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.stats?.cardsUploaded || 0}</p>
            </div>
            <CreditCard className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.stats?.totalContacts || 0}</p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Favorites</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.stats?.favoritesCount || 0}</p>
            </div>
            <Star className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Contacts</h2>
        {stats?.recentContacts?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentContacts.map((contact) => (
              <div key={contact._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{contact.fullName}</p>
                  <p className="text-sm text-gray-600">{contact.company || 'No company'}</p>
                </div>
                {contact.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No contacts yet. Upload your first card!</p>
        )}
      </div>
    </div>
  );
}
EOF

# ============= UPLOAD CARD =============
cat > "$FRONTEND_SRC/pages/user/UploadCard.jsx" << 'EOF'
import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('card', file);

    setUploading(true);
    try {
      await api.post('/cards/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Card uploaded! Processing OCR...');
      setTimeout(() => navigate('/contacts'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Visiting Card</h1>
      
      <div className="card">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              <button onClick={() => { setFile(null); setPreview(null); }} className="btn btn-outline">
                Choose Different Image
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">Click to upload or drag and drop</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn btn-primary cursor-pointer">
                Select Image
              </label>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full btn btn-primary py-3 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload and Process'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

echo "✅ User pages created"

# ============= CONTACTS PAGE =============
cat > "$FRONTEND_SRC/pages/user/Contacts.jsx" << 'EOF'
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Star, Download, Trash2 } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts', { params: { search } });
      setContacts(response.data.data.contacts);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/contacts/export/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts.${format === 'csv' ? 'csv' : 'vcf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Contact deleted');
      fetchContacts();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <div className="flex space-x-2">
          <button onClick={() => handleExport('csv')} className="btn btn-outline">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
          <button onClick={() => handleExport('vcard')} className="btn btn-outline">
            <Download className="w-4 h-4 mr-2" />
            vCard
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <div key={contact._id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <Link to={`/contacts/${contact._id}`} className="flex-1">
                <h3 className="font-bold text-lg">{contact.fullName}</h3>
                <p className="text-sm text-gray-600">{contact.designation}</p>
                <p className="text-sm text-gray-500">{contact.company}</p>
              </Link>
              {contact.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
            </div>
            {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
            {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
            <button
              onClick={() => handleDelete(contact._id)}
              className="mt-3 text-red-600 hover:text-red-700 text-sm flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No contacts found</p>
        </div>
      )}
    </div>
  );
}
EOF

# Simple placeholder pages
cat > "$FRONTEND_SRC/pages/user/ContactDetail.jsx" << 'EOF'
import React from 'react';
export default function ContactDetail() {
  return <div className="card"><h1 className="text-2xl font-bold">Contact Detail</h1><p>View and edit contact details here</p></div>;
}
EOF

cat > "$FRONTEND_SRC/pages/user/Tags.jsx" << 'EOF'
import React from 'react';
export default function Tags() {
  return <div className="card"><h1 className="text-2xl font-bold">Tags</h1><p>Manage your tags here</p></div>;
}
EOF

# Simple admin pages
cat > "$FRONTEND_SRC/pages/admin/Dashboard.jsx" << 'EOF'
import React from 'react';
export default function AdminDashboard() {
  return <div className="card"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p>System overview and analytics</p></div>;
}
EOF

cat > "$FRONTEND_SRC/pages/admin/UserManagement.jsx" << 'EOF'
import React from 'react';
export default function UserManagement() {
  return <div className="card"><h1 className="text-2xl font-bold">User Management</h1><p>Manage all users</p></div>;
}
EOF

cat > "$FRONTEND_SRC/pages/admin/CardModeration.jsx" << 'EOF'
import React from 'react';
export default function CardModeration() {
  return <div className="card"><h1 className="text-2xl font-bold">Card Moderation</h1><p>Review uploaded cards</p></div>;
}
EOF

cat > "$FRONTEND_SRC/pages/admin/ActivityLogs.jsx" << 'EOF'
import React from 'react';
export default function ActivityLogs() {
  return <div className="card"><h1 className="text-2xl font-bold">Activity Logs</h1><p>System activity and logs</p></div>;
}
EOF

echo "✅ All pages created successfully!"
echo ""
echo "=================================="
echo "🎉 SETUP COMPLETE!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. cd backend && npm install"
echo "2. cp .env.example .env (configure MongoDB URI)"
echo "3. npm run seed (create admin user)"
echo "4. npm run dev (start backend)"
echo ""
echo "5. cd ../frontend && npm install"
echo "6. npm run dev (start frontend)"
echo ""
echo "Default admin: admin@dexi.com / Admin@123"
echo "=================================="

