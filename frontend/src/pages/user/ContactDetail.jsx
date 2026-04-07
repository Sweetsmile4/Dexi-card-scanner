import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Globe, Mail, Phone, User2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE = API_URL.replace(/\/api\/?$/, '');

const toCardImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const normalized = imagePath.replace(/\\/g, '/').replace(/^uploads\//, '');
  return `${BACKEND_BASE}/uploads/${normalized}`;
};

export default function ContactDetail() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await api.get(`/contacts/${id}`);
      setContact(response.data.data.contact);
    } catch (error) {
      toast.error('Failed to load card details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>;
  }

  if (!contact) {
    return (
      <div className="rounded-xl border border-[#d0d0d8] bg-white p-6">
        <p className="text-[24px] text-[#666672]">Card details not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/contacts" className="inline-flex items-center text-[22px] font-medium text-[#5f16bf] hover:text-[#7a2af6]">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Export
      </Link>

      <h1 className="text-[46px] font-bold text-[#11121a]">Scanned Card Content</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-[#cfcfd4] bg-white p-5">
          <h2 className="mb-4 text-[30px] font-semibold text-[#1a1b26]">Card Preview</h2>
          {contact.cardId?.imagePath ? (
            <img
              src={toCardImageUrl(contact.cardId.imagePath)}
              alt={contact.fullName}
              className="w-full rounded-lg border border-[#ececf2]"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-[#c9c9d1] bg-[#fafafe] p-10 text-center text-[22px] text-[#8f8f9a]">
              No card image available
            </div>
          )}

          {contact.cardId?.ocrText && (
            <div className="mt-5 rounded-lg border border-[#e5e5ec] bg-[#f8f8fc] p-4">
              <p className="mb-2 text-[20px] font-semibold text-[#2a2a35]">Raw OCR Text</p>
              <pre className="whitespace-pre-wrap break-words text-[16px] text-[#4d4d5a]">{contact.cardId.ocrText}</pre>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#cfcfd4] bg-white p-5">
          <h2 className="mb-4 text-[30px] font-semibold text-[#1a1b26]">Extracted Contact Data</h2>

          <div className="space-y-3">
            <div className="flex items-start rounded-xl border border-[#ececf2] bg-[#fafafe] p-3">
              <User2 className="mr-3 mt-0.5 h-5 w-5 text-[#6f6f7a]" />
              <div>
                <p className="text-[18px] text-[#777783]">Full Name</p>
                <p className="text-[24px] font-semibold text-[#1f2030]">{contact.fullName || '-'}</p>
              </div>
            </div>

            <div className="flex items-start rounded-xl border border-[#ececf2] bg-[#fafafe] p-3">
              <Building2 className="mr-3 mt-0.5 h-5 w-5 text-[#6f6f7a]" />
              <div>
                <p className="text-[18px] text-[#777783]">Company / Designation</p>
                <p className="text-[22px] text-[#2f3042]">{contact.company || '-'}</p>
                <p className="text-[20px] text-[#5f6072]">{contact.designation || '-'}</p>
              </div>
            </div>

            <div className="flex items-start rounded-xl border border-[#ececf2] bg-[#fafafe] p-3">
              <Mail className="mr-3 mt-0.5 h-5 w-5 text-[#6f6f7a]" />
              <div>
                <p className="text-[18px] text-[#777783]">Email</p>
                <p className="text-[22px] text-[#2f3042]">{contact.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-start rounded-xl border border-[#ececf2] bg-[#fafafe] p-3">
              <Phone className="mr-3 mt-0.5 h-5 w-5 text-[#6f6f7a]" />
              <div>
                <p className="text-[18px] text-[#777783]">Phone</p>
                <p className="text-[22px] text-[#2f3042]">{contact.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-start rounded-xl border border-[#ececf2] bg-[#fafafe] p-3">
              <Globe className="mr-3 mt-0.5 h-5 w-5 text-[#6f6f7a]" />
              <div>
                <p className="text-[18px] text-[#777783]">Website</p>
                <p className="text-[22px] text-[#2f3042]">{contact.website || '-'}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
