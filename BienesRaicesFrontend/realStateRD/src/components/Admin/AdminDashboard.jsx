import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardStats from './DashboardStats';
import ConfigurationManager from './ConfigurationManager';
import BookingManager from './BookingManager';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout, user } = useAuth();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h3m0 0a9 9 0 0018 0M6 12a9 9 0 0118 0m-6 0H9" />
        </svg>
      )
    },
    { id: 'config', name: 'Configuraciones', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.07a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.07c.51 0 .97-.31 1.17-.77.31-.62.16-1.33-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06c.49.49 1.2.64 1.82.33.46-.2.77-.66.77-1.17V2a2 2 0 114 0v.07c0 .51.31.97.77 1.17.62.31 1.33.16 1.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06c-.49.49-.64 1.2-.33 1.82.2.46.66.77 1.17.77H21a2 2 0 110 4h-.07c-.51 0-.97.31-1.17.77z" />
        </svg>
      )
    },
    { id: 'bookings', name: 'Reservas', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  const handleNavigateToTab = (tabId) => setActiveTab(tabId);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats onNavigateToTab={handleNavigateToTab} />;
      case 'config':
        return <ConfigurationManager />;
      case 'bookings':
        return <BookingManager />;
      default:
        return <DashboardStats onNavigateToTab={handleNavigateToTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-slate-950/90 backdrop-blur border-r border-slate-900 z-40">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v14m-4 0h8" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">RealStateRD</p>
              <p className="text-xs text-slate-500">Panel de Administración</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1" aria-label="Navegación principal">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                  ${isActive ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-transparent border-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'}`}
              >
                <span className="text-slate-400">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-900 p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-200">{user?.username?.charAt(0).toUpperCase() || 'A'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-200">{user?.username}</p>
              <p className="truncate text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-md bg-red-950 hover:bg-red-900 border border-red-900 text-red-100 outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur border-b border-slate-900">
          <div className="mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-100">{tabs.find(t => t.id === activeTab)?.name}</h1>
              <p className="text-xs text-slate-500">Gestiona tu plataforma inmobiliaria</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-sm text-slate-400">
              <div className="px-3 py-1 rounded-md border border-slate-900 bg-slate-950/60">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="mx-auto max-w-7xl px-6 py-6">
          <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
            {renderContent()}
          </div>
        </section>
      </main>

      {/* Skip link for a11y */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-slate-900 focus:text-white focus:px-3 focus:py-2 focus:rounded">
        Saltar al contenido principal
      </a>
    </div>
  );
};

export default AdminDashboard;
