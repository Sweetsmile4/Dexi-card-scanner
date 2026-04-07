import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Crown, UserCircle2 } from 'lucide-react';

export default function Tags() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-[50px] font-bold text-[#11121a]">Profile</h1>

      <section className="rounded-2xl border border-[#bfc0c8] bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#7a20f3] text-white shadow-[0_8px_18px_rgba(122,32,243,0.35)]">
            <UserCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-[38px] font-semibold text-[#171826]">{user?.name || 'User'}</h2>
            <p className="text-[22px] text-[#666672]">{user?.email || 'user@example.com'}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-[#efe1ff] px-3 py-1 text-[16px] font-medium text-[#6b1cd8]">
              <Crown className="mr-1 h-4 w-4" />
              7-Day Free Trial
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
