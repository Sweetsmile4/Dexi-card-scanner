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
