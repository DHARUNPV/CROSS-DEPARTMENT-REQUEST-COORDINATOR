import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('user'); // 'user' | 'officer'
  const [officerId, setOfficerId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload =
        mode === 'officer'
          ? { role: 'officer', officerId: officerId.trim(), email, password }
          : { role: 'user', email, password };
      const data = await login(payload);
      const role = data.user?.role;
      if (role === 'citizen') navigate('/dashboard');
      else if (role === 'officer') navigate('/officer');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Government Header */}
      <header className="w-full bg-gov-navy text-white">
        <div className="h-1 bg-gradient-to-r from-teal-400/80 via-cyan-400/70 to-gov-blue/90" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Emblem/Logo placeholder */}
              <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.25)]">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400/30 to-gov-blue/30 border border-white/15" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-white/70">Government Service Portal</div>
                <div className="text-base sm:text-lg font-extrabold truncate">GeM / e-Governance Inspired Access</div>
              </div>
            </div>

            {/* Optional top navigation links (lightweight) */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/85">
              <a href="#features" className="hover:text-white transition-colors duration-200">
                Services
              </a>
              <a href="#procedures" className="hover:text-white transition-colors duration-200">
                Procedures
              </a>
              <a href="#help" className="hover:text-white transition-colors duration-200">
                Help
              </a>
              <a href="#contact" className="hover:text-white transition-colors duration-200">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero/Banner backdrop */}
        <div className="relative bg-gradient-to-br from-gov-navy via-gov-navy to-gov-slate">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 left-1/4 h-56 w-56 rounded-full bg-teal-400/25 blur-3xl" />
            <div className="absolute top-36 -right-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/25 to-transparent" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
              {/* Left hero content */}
              <section className="lg:col-span-2" aria-label="Portal overview">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-300" />
                  Secure Citizen and Officer Access
                </div>
                <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Digital Government Service Access Portal
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                  Sign in securely to submit, track, and coordinate requests across departments using role-based access.
                </p>

                <div id="features" className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Verified Workflow</div>
                        <div className="text-xs text-white/70">Structured portal access</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center">
                        <svg className="h-5 w-5 text-cyan-200" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                          <path d="M9.5 12.2 11.2 14l3.3-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Role-Based Security</div>
                        <div className="text-xs text-white/70">Officer vs citizen flows</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="procedures" className="mt-6 text-xs text-white/70 leading-relaxed">
                  For officer accounts, select <span className="font-semibold text-white">Officer Login</span> and enter your assigned Officer ID.
                </div>
              </section>

              {/* Login card */}
              <section className="lg:col-span-3 flex justify-center lg:justify-end">
                <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="px-6 sm:px-7 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          Access Portal
                        </div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                          Sign in
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          Use your credentials to continue.
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gov-blue/15 to-teal-500/15 border border-slate-200 flex items-center justify-center">
                          <svg className="h-5 w-5 text-gov-blue" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 1v22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H13a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 py-6">
                    {/* Segmented portal tabs */}
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => { setMode('user'); setOfficerId(''); setError(''); }}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 ${
                          mode === 'user'
                            ? 'bg-gov-blue text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        aria-pressed={mode === 'user'}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        </svg>
                        User Login
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode('officer'); setError(''); }}
                        className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 ${
                          mode === 'officer'
                            ? 'bg-gov-blue text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        aria-pressed={mode === 'officer'}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 2 20 6v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                          <path d="M9.5 12.2 11.2 14l3.3-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Officer Login
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4" aria-label="Login form">
                      {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}

                      {mode === 'officer' && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="officerId">
                            Officer ID
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 1v22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H13a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <input
                              id="officerId"
                              type="text"
                              value={officerId}
                              onChange={(e) => setOfficerId(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/20"
                              required
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                          Email
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                              <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/20"
                            required
                            autoComplete="username"
                            placeholder="name@domain.gov"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
                          Password
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              <path d="M6 11h12v10H6V11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                              <path d="M12 15v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </div>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/20"
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-gov-blue to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(37,99,235,0.18)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_20px_55px_rgba(37,99,235,0.25)] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-gov-blue/25"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          {loading ? 'Signing in...' : 'Sign In'}
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 18 15 12 9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>

                      <div className="text-xs text-slate-500 pt-1">
                        By continuing, you agree to securely authenticate using role-based access.
                      </div>

                      {mode === 'user' && (
                        <div className="pt-2 text-center text-sm">
                          Don't have an account?{' '}
                          <Link
                            to="/register"
                            className="font-semibold text-gov-blue hover:text-gov-blue/90 transition-colors duration-200"
                          >
                            Register
                          </Link>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </section>
            </div>

            {/* Thin footer note */}
            <div id="help" className="mt-8 border-t border-white/10 pt-6 text-xs text-white/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>Official Digital Service Access Portal</div>
              <div className="sm:text-right">Secure Citizen and Officer Access</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}