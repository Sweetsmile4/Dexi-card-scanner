import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CreditCard, Users2, TrendingUp, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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

  const cardsScanned = stats?.stats?.cardsUploaded || 0;
  const contactsExported = stats?.stats?.totalContacts || 0;
  const ocrAccuracy = stats?.stats?.ocrAccuracy || 98.5;

  return (
    <div className="space-y-7">
      <h1 className="text-3xl font-bold text-[#11121a]">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-[#cfcfd4] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-[#e9d8ff] p-3 text-[#7a2af6]">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-[#43bf4f]">+0%</span>
          </div>
          <p className="text-3xl font-bold text-[#15151f]">{cardsScanned}</p>
          <p className="mt-1 text-sm text-[#70707d]">Total Cards Scanned</p>
        </article>

        <article className="rounded-3xl border border-[#cfcfd4] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-[#e9d8ff] p-3 text-[#7a2af6]">
              <Users2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-[#43bf4f]">+0%</span>
          </div>
          <p className="text-3xl font-bold text-[#15151f]">{contactsExported}</p>
          <p className="mt-1 text-sm text-[#70707d]">Contacts Exported</p>
        </article>

        <article className="rounded-3xl border border-[#cfcfd4] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div className="rounded-xl bg-[#e9d8ff] p-3 text-[#7a2af6]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-[#43bf4f]">+0%</span>
          </div>
          <p className="text-3xl font-bold text-[#15151f]">{ocrAccuracy}%</p>
          <p className="mt-1 text-sm text-[#70707d]">OCR Accuracy</p>
        </article>
      </div>

      {stats?.recentContacts?.length > 0 ? (
        <div className="rounded-[2rem] border border-[#cfcfd4] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-[#161621]">Recent Contacts</h2>
          <div className="space-y-3">
            {stats.recentContacts.map((contact) => (
              <div key={contact._id} className="flex items-center justify-between rounded-xl bg-[#f5f5f7] p-4">
                <div>
                  <p className="text-lg font-semibold text-[#1e1f2a]">{contact.fullName}</p>
                  <p className="text-sm text-[#6f6f7a]">{contact.company || 'No company'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
          <section className="mx-auto mt-8 max-w-4xl rounded-[2rem] border border-[#bdbdc4] bg-[#f7f7f8] px-6 py-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-xl bg-[#7a20f3] text-white shadow-[0_8px_24px_rgba(96,29,189,0.35)]">
            <CreditCard className="h-12 w-12" />
          </div>
            <h2 className="text-2xl font-semibold text-[#161621]">No Cards Scanned Yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#666672]">
            Start by uploading a business card image or scanning one through the mobile app. Your digitized contacts will appear here.
          </p>
          <Link
            to="/upload"
              className="mx-auto mt-7 inline-flex items-center rounded-2xl bg-gradient-to-r from-[#5f16bf] to-[#8c3ffb] px-8 py-3 text-base font-semibold text-white shadow-[0_10px_26px_rgba(100,37,189,0.35)] transition hover:brightness-105"
          >
            <Zap className="mr-2 h-6 w-6" />
            Upload Your First Card
          </Link>
        </section>
      )}
    </div>
  );
}
