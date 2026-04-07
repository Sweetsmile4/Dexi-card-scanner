import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Download, Trash2, FileSpreadsheet, FileText, FileType2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, '');

const toCardImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const normalized = imagePath.replace(/\\/g, '/').replace(/^uploads\//, '');
  return `${BACKEND_BASE}/uploads/${normalized}`;
};

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
    <div className="space-y-8">
      <h1 className="text-[50px] font-bold text-[#11121a]">Export Manager</h1>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#cfcfd4] bg-white p-5">
          <div className="mb-4 inline-flex rounded-xl bg-[#e9d8ff] p-3 text-[#7a2af6]">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <h2 className="text-[34px] font-semibold text-[#1a1b25]">Excel (.xlsx)</h2>
          <p className="mt-2 text-[24px] leading-relaxed text-[#666672]">
            Full spreadsheet with all contact fields, formatted columns, and filters.
          </p>
          <button
            onClick={() => handleExport('csv')}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#c8c8d1] px-4 py-2 text-[22px] font-medium text-[#323241] transition hover:bg-[#f7f7fb]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
        </article>

        <article className="rounded-2xl border border-[#cfcfd4] bg-white p-5">
          <div className="mb-4 inline-flex rounded-xl bg-[#e9d8ff] p-3 text-[#7a2af6]">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-[34px] font-semibold text-[#1a1b25]">CSV (.csv)</h2>
          <p className="mt-2 text-[24px] leading-relaxed text-[#666672]">
            Comma-separated values compatible with any spreadsheet or CRM tool.
          </p>
          <button
            onClick={() => handleExport('csv')}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#c8c8d1] px-4 py-2 text-[22px] font-medium text-[#323241] transition hover:bg-[#f7f7fb]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
        </article>

        <article className="rounded-2xl border border-[#cfcfd4] bg-white p-5">
          <div className="mb-4 inline-flex rounded-xl bg-[#e9d8ff] p-3 text-[#7a2af6]">
            <FileType2 className="h-7 w-7" />
          </div>
          <h2 className="text-[34px] font-semibold text-[#1a1b25]">vCard (.vcf)</h2>
          <p className="mt-2 text-[24px] leading-relaxed text-[#666672]">
            Contact card format for quick import into phone, mail apps, and address books.
          </p>
          <button
            onClick={() => handleExport('vcard')}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#c8c8d1] px-4 py-2 text-[22px] font-medium text-[#323241] transition hover:bg-[#f7f7fb]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[42px] font-semibold text-[#151623]">Scanned Cards</h2>
          <span className="text-[22px] text-[#666672]">{contacts.length} card(s)</span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a9aa6]" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full rounded-xl border border-[#c8c8d1] bg-white py-3 pl-12 pr-4 text-[24px] text-[#21222d] placeholder:text-[#9a9aa6] focus:border-[#7a2af6] focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <article key={contact._id} className="rounded-xl border border-[#d0d0d8] bg-white p-4 shadow-sm">
              <Link to={`/contacts/${contact._id}`} className="block">
                <div className="mb-3 h-44 overflow-hidden rounded-lg border border-[#ececf2] bg-[#fafafe]">
                  {contact.cardId?.imagePath ? (
                    <img
                      src={toCardImageUrl(contact.cardId.imagePath)}
                      alt={contact.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[18px] text-[#8f8f9a]">No preview image</div>
                  )}
                </div>
                <h3 className="line-clamp-1 text-[34px] font-semibold text-[#1a1b26]">{contact.fullName || 'Unnamed Contact'}</h3>
                <p className="line-clamp-1 text-[24px] text-[#60606d]">{contact.designation || 'No designation'}</p>
                <p className="line-clamp-1 text-[24px] text-[#60606d]">{contact.company || 'No company'}</p>
                <div className="mt-3 space-y-1 text-[22px] text-[#40404d]">
                  {contact.email && <p className="line-clamp-1">{contact.email}</p>}
                  {contact.phone && <p className="line-clamp-1">{contact.phone}</p>}
                </div>
              </Link>

              <button
                onClick={() => handleDelete(contact._id)}
                className="mt-4 inline-flex items-center text-[22px] font-medium text-red-600 transition hover:text-red-700"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>

      {contacts.length === 0 && (
        <div className="rounded-xl border border-[#d0d0d8] bg-white py-10 text-center">
          <p className="text-[24px] text-[#666672]">No scanned cards found</p>
        </div>
      )}
    </div>
  );
}
