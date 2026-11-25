import React from 'react';
import {
  LayoutDashboard,
  Pill,
  CalendarClock,
  Package,
  LineChart,
  HeartHandshake,
  Video,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'medications'
  | 'schedule'
  | 'stock'
  | 'insights'
  | 'caregiver'
  | 'teleconsultation'
  | 'data_ownership'
  | 'settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const NAV_ITEMS: { key: NavItemKey; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'medications', label: 'Medications', icon: Pill },
  { key: 'schedule', label: 'Medication Schedule', icon: CalendarClock },
  { key: 'stock', label: 'Stock Monitor', icon: Package },
  { key: 'insights', label: 'Health Insights', icon: LineChart },
  { key: 'caregiver', label: 'Caregiver', icon: HeartHandshake },
  { key: 'teleconsultation', label: 'Teleconsultation', icon: Video },
  { key: 'data_ownership', label: 'Data Ownership', icon: ShieldCheck },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  mobileOpen,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r border-charcoal-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-charcoal-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="font-bold text-lg text-charcoal-900 tracking-tight">HealthVault</span>
              <span className="block text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
                wHACKiest 2026
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-charcoal-500 hover:bg-charcoal-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline snippet */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100/60">
          <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
            Track T-3: Know Thyself • Privacy-first intelligence & stock management.
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onTabChange(item.key);
                  onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-charcoal-700 hover:bg-charcoal-50 hover:text-charcoal-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-200' : 'text-charcoal-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Privacy badge at footer */}
        <div className="p-4 border-t border-charcoal-100 bg-background/50">
          <div className="p-3 rounded-xl bg-white border border-charcoal-100 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-semibold text-charcoal-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Local-First Vault</span>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1 leading-normal">
              IndexedDB Dexie storage active. Health data stored on device.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
