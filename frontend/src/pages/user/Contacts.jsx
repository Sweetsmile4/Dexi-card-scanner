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
