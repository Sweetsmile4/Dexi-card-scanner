import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Zap, FileOutput, ShieldCheck, Quote } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Smart Scanning',
    text: 'AI-powered OCR extracts contact details with high accuracy.',
  },
  {
    icon: Zap,
    title: 'Instant Digitization',
    text: 'Convert physical cards to digital contacts in seconds.',
  },
  {
    icon: FileOutput,
    title: 'Multiple Exports',
    text: 'Export to Excel, CSV, or PDF in one click.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Storage',
    text: 'Your data is encrypted and safely stored in the cloud.',
  },
];

const testimonials = [
  {
    name: 'Jeffery Marquez',
    role: 'Sales Consultant',
    quote: 'Dexi has transformed how we capture leads after events.',
  },
  {
    name: 'Jane Anderson',
    role: 'Operations Manager',
    quote: 'The OCR quality is excellent and saves our team hours each week.',
  },
  {
    name: 'Margie Small',
    role: 'Business Owner',
    quote: 'I scan cards in minutes and get clean contacts ready instantly.',
  },
];

export default function Intro() {
  return (
    <div className="min-h-screen bg-white text-[#1f1f29] [font-family:'Poppins',ui-sans-serif,system-ui,sans-serif]">
      <div className="w-full px-0 py-0">
        <div className="overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-[#4f0ca7] via-[#5d12bb] to-[#6a1dd0] text-white">
            <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-9">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-[#5d12bb]">De</div>
                <span className="text-xl font-semibold tracking-wide">Dexi</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-[#d2b9ff] px-4 py-2 text-sm font-semibold text-[#4f0ca7] transition hover:bg-[#e4d5ff]"
                >
                  Get Started
                </Link>
              </div>
            </header>
          </div>

          <section className="mx-auto w-full max-w-5xl px-6 pb-10 pt-14 text-center sm:pb-12">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Transform Business Cards into
              <span className="mt-1 block text-[#9a4fff]">Digital Contacts</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#4f4f5f] sm:text-base">
              Say goodbye to cluttered business cards. Dexi uses advanced AI-powered OCR to instantly digitize,
              organize, and export your professional network.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="w-48 rounded-xl bg-[#7217f7] px-6 py-3 text-center text-base font-semibold text-white shadow-[0_10px_30px_rgba(114,23,247,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6412df]"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="w-36 rounded-xl border border-[#8a38ff] px-6 py-3 text-center text-base font-semibold text-[#7a21f6] transition hover:bg-[#f4ebff]"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-5 text-xs font-medium text-[#5d5d6c]">7 days free trial • No credit card required</p>
          </section>

          <main className="mx-auto w-full max-w-6xl px-6 pb-10 sm:px-9">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl bg-transparent p-2 text-center">
                  <div className="mb-4 inline-flex rounded-xl bg-[#eadcff] p-3 text-[#7b2df6]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1d1d2a]">{title}</h3>
                  <p className="mx-auto mt-2 max-w-[250px] text-sm leading-6 text-[#626272]">{text}</p>
                </article>
              ))}
            </section>

            <section className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map(({ name, role, quote }) => (
                <article key={name} className="relative rounded-3xl border border-[#b887ff] bg-white p-6 shadow-sm">
                  <Quote className="absolute -left-2 -top-3 h-8 w-8 text-[#8b34ff]" />
                  <p className="mt-3 text-sm leading-6 text-[#565669]">{quote}</p>
                  <div className="mt-4 border-t border-[#efecf7] pt-4">
                    <p className="text-sm font-semibold text-[#202034]">{name}</p>
                    <p className="text-xs text-[#6a6a78]">{role}</p>
                  </div>
                </article>
              ))}
            </section>
          </main>

          <footer className="mt-8 bg-gradient-to-r from-[#5110aa] via-[#5b15b9] to-[#671fcc] text-white">
            <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-9">
              <div className="grid gap-8 lg:grid-cols-3">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#5d12bb]">De</div>
                    <p className="text-lg font-semibold">Dexi</p>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[#e6d6ff]">
                    We offer both an online tool and a mobile app for effortless scanning and digitizing business cards.
                  </p>
                  <p className="mt-6 text-sm font-semibold">More Apps</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      className="rounded-md border border-white/60 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-white/60 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                    >
                      IOS
                    </button>
                  </div>
                </div>

                <div className="text-sm text-[#f0e7ff] lg:pt-9">
                  <p className="mb-4 font-semibold text-white">Legal</p>
                  <div className="flex flex-col gap-3">
                    <span>Terms & Conditions</span>
                    <span>Privacy Policy</span>
                  </div>
                </div>

                <div className="text-sm text-[#f0e7ff] lg:pt-9">
                  <p className="mb-4 font-semibold text-white">Contact</p>
                  <p>Contact us</p>
                  <div className="mt-8 flex gap-5 text-base">
                    <span className="opacity-90">in</span>
                    <span className="opacity-90">X</span>
                    <span className="opacity-90">ig</span>
                  </div>
                </div>
              </div>

              <p className="mt-10 border-t border-white/20 pt-4 text-center text-xs text-[#e6d6ff]">© Copyright 2026 by DEXI</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
