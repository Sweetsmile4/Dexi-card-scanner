import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Upload, FileDown, UserCircle2, LogOut } from 'lucide-react';

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
    { path: '/upload', icon: Upload, label: 'OCR Upload' },
    { path: '/contacts', icon: FileDown, label: 'Export' },
    { path: '/tags', icon: UserCircle2, label: 'Profile' },
  ];

  const userName = user?.name || 'User';

  return (
    <div className="min-h-screen bg-[#efefef] [font-family:'Poppins',ui-sans-serif,system-ui,sans-serif]">
      <header className="h-[76px] border-b border-[#4b128f] bg-gradient-to-r from-[#5310ac] via-[#5e18bd] to-[#6b25d0] shadow-[0_6px_18px_rgba(43,14,93,0.32)]">
        <div className="flex h-full items-center justify-between px-5 sm:px-10">
          <div className="flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#278fe5]">De</div>
            <div>
                <p className="text-2xl font-semibold leading-none">Dexi</p>
                <p className="mt-1 text-xs text-[#e2c8ff]">AI Card Digitizer</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-semibold">U</div>
              <span className="text-base font-semibold">{userName}</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-5rem)]">
        <aside className="w-[245px] shrink-0 bg-gradient-to-b from-[#4c0aa5] via-[#6318c8] to-[#9252f8] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.16)]">
          <div className="flex h-full flex-col px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center rounded-lg px-5 py-3.5 text-base font-medium transition ${
                      isActive
                        ? 'bg-[#9e57ff] text-white shadow-[0_8px_18px_rgba(123,50,243,0.45)]'
                        : 'text-[#f3e8ff] hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-auto flex items-center rounded-lg px-5 py-3.5 text-base font-medium text-[#f3e8ff] transition hover:bg-white/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
