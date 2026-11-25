import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Radio,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserProfile, Medication, DoseEvent } from '../types';
import { computeStockAnalysis } from '../utils/stockEngine';

interface HeaderProps {
  user: UserProfile | null;
  medications: Medication[];
  doseEvents: DoseEvent[];
  onOpenMobileMenu: () => void;
  onOpenNfcModal: () => void;
  onLoadDemoData: () => Promise<void>;
  onResetData: () => Promise<void>;
  onNavigate: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  medications,
  onOpenMobileMenu,
  onOpenNfcModal,
  onLoadDemoData,
  onResetData,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Calculate live alerts
  const lowStockMeds = medications
    .map(m => computeStockAnalysis(m))
    .filter(a => a.needsRefillWarning);

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const totalAlertCount = lowStockMeds.length;

  const handleDemoClick = async () => {
    setIsLoadingDemo(true);
    await onLoadDemoData();
    setIsLoadingDemo(false);
  };

  const handleResetClick = async () => {
    if (confirm('Reset HealthVault local database? This will clear all records and reseed clean demo state.')) {
      setIsResetting(true);
      await onResetData();
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-surface/90 backdrop-blur-md border-b border-charcoal-100 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile toggle + Date */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-charcoal-600 hover:bg-charcoal-50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Today
          </p>
          <p className="text-sm font-bold text-charcoal-900 tracking-tight">
            {todayStr}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* NFC Action Button */}
        <button
          onClick={onOpenNfcModal}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 text-xs font-semibold transition-all shadow-xs"
          title="Scan or Simulate NFC Medication Dose"
        >
          <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
          <span className="hidden md:inline">NFC Dose Reader</span>
        </button>

        {/* Quick Demo Switcher */}
        <button
          onClick={handleDemoClick}
          disabled={isLoadingDemo}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-charcoal-50 text-charcoal-800 hover:bg-charcoal-100 border border-charcoal-200 text-xs font-medium transition-all"
          title="Load sample profile Ananya with realistic 7-day adherence data"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{isLoadingDemo ? 'Loading...' : 'Demo Data'}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-charcoal-600 hover:bg-charcoal-50 border border-charcoal-100 transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-charcoal-700" />
            {totalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {totalAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-charcoal-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-charcoal-100 flex items-center justify-between">
                <span className="font-bold text-sm text-charcoal-900">Active Notifications</span>
                <span className="text-[11px] font-medium text-charcoal-500">
                  {totalAlertCount} active
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-2">
                {lowStockMeds.length === 0 ? (
                  <div className="p-4 text-center text-xs text-charcoal-500">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    No critical stock alerts or unconfirmed escalations.
                  </div>
                ) : (
                  lowStockMeds.map(m => (
                    <div
                      key={m.medicationId}
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('stock');
                      }}
                      className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 cursor-pointer hover:bg-rose-100/70 transition-all flex items-start space-x-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-rose-900">
                          Low Stock: {m.medicationName}
                        </p>
                        <p className="text-[11px] text-rose-700">
                          {m.daysRemaining !== null
                            ? `Only ${m.daysRemaining} days remaining (${m.currentStock} left). Expected depletion: ${m.depletionDate}`
                            : `Low inventory (${m.currentStock} units remaining).`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-charcoal-50 border border-charcoal-100 transition-all"
          >
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
              alt={user?.fullName || 'User'}
              className="w-7 h-7 rounded-lg object-cover border border-emerald-300"
            />
            <span className="hidden md:inline text-xs font-bold text-charcoal-900">
              {user?.fullName || 'Ananya S.'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-charcoal-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-charcoal-100">
                <p className="text-xs font-bold text-charcoal-900">{user?.fullName || 'Ananya Sharma'}</p>
                <p className="text-[11px] text-charcoal-500">wHACKiest 2026 Demo</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-charcoal-700 hover:bg-charcoal-50 flex items-center space-x-2"
              >
                <span>Profile & Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleResetClick();
                }}
                disabled={isResetting}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Database</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
