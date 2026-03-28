import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [];
  if (user?.role === 'citizen') {
    navLinks.push({ to: '/dashboard', label: 'My Requests' });
    navLinks.push({ to: '/complaint', label: 'Submit Complaint' });
    navLinks.push({ to: '/document', label: 'Apply Document' });
  }
  if (user?.role === 'officer') {
    navLinks.push({ to: '/officer', label: 'Department Tasks' });
  }
  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gov-navy text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="font-semibold text-lg">Cross Department Request Coordinator</Link>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-6">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="hover:text-teal-300 transition">{label}</Link>
                ))}
              </nav>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gov-slate"
                >
                  <span className="text-sm">{user?.name}</span>
                  <span className="text-xs bg-gov-teal px-2 py-0.5 rounded">{user?.role}</span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white text-gov-navy rounded-lg shadow-lg z-20 py-2">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-slate-100">
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
