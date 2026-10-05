import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Shield,
  GraduationCap,
  UserCheck,
  Briefcase,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { UELogo } from './UELogo';

interface HeaderProps {
  onSearchQueryChange?: (query: string) => void;
  activeModuleName: string;
  onNavigateToModule: (moduleName: string) => void;
  onToggleMobileSidebar?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchQueryChange,
  activeModuleName,
  onNavigateToModule,
  onToggleMobileSidebar,
  collapsed = false,
  onToggleCollapse
}) => {
  const { currentUser, activeRole, switchRole, logout, isVisitingContractExpired, visitingDaysRemaining } = useAuth();
  const { notifications, markNotificationAsRead, clearAllNotifications } = useCFMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearchQueryChange) {
      onSearchQueryChange(q);
    }
  };

  const roleConfigs: Record<UserRole, { label: string; icon: any; color: string; bg: string }> = {
    ADMIN: { label: 'System Admin', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200' },
    HOD: { label: 'Head of Department', icon: GraduationCap, color: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-200' },
    REGULAR_TEACHER: { label: 'Regular Teacher', icon: UserCheck, color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
    VISITING_TEACHER: { label: 'Visiting Faculty', icon: Briefcase, color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' }
  };

  const currentRoleConf = roleConfigs[activeRole] || roleConfigs['ADMIN'];
  const RoleIcon = currentRoleConf?.icon || Shield;

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2EFE6] shadow-xs">
      {/* Visiting Faculty Contract Status Bar (if Visiting Teacher selected) */}
      {activeRole === 'VISITING_TEACHER' && (
        <div
          className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b ${
            isVisitingContractExpired
              ? 'bg-red-50 text-red-800 border-red-200'
              : visitingDaysRemaining <= 30
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-[#E6F4EC] text-[#15803D] border-[#E2EFE6]'
          }`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Clock className="w-3.5 h-3.5 shrink-0 text-[#1E7B4E]" />
            <span>
              <strong>Visiting Faculty Access:</strong> Contract valid from{' '}
              {currentUser.contractStartDate || '2026-02-01'} to{' '}
              {currentUser.contractEndDate || '2026-08-31'}.
              {isVisitingContractExpired ? (
                <span className="font-bold text-red-700 ml-2">
                  [EXPIRED - System permissions restricted]
                </span>
              ) : (
                <span className="font-semibold ml-2">
                  ({visitingDaysRemaining} days remaining in current term)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Toggle Buttons & Active Module Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-1.5 rounded-lg text-[#1E7B4E] hover:bg-[#E6F4EC] transition-colors md:hidden cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#1E7B4E] hover:bg-[#E6F4EC] hover:text-[#165534] transition-colors hidden md:flex cursor-pointer"
              title={collapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="flex items-center gap-3">
            <UELogo size="xs" showText={false} />
            <h1 className="text-lg font-extrabold font-heading text-[#0F2D1F] tracking-tight">
              {activeModuleName}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar matching attached mockup */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search anything..."
              className="w-full pl-4 pr-10 py-2 text-xs bg-slate-50/90 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E7B4E]/20 focus:border-[#1E7B4E] focus:bg-white transition-all text-[#0F2D1F] placeholder-slate-400"
            />
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Actions, Persona Switcher & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E6F4EC] text-[#1E7B4E] border border-[#E2EFE6] hover:bg-[#1E7B4E] hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Click to switch User Persona / Portal Role"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{currentRoleConf.label}</span>
              <ChevronDown className="w-3 h-3 text-[#567567] ml-0.5" />
            </button>

            {/* Persona Dropdown Menu */}
            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E2EFE6] py-2 z-50 animate-fade-in"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 border-b border-[#E2EFE6]">
                  <p className="text-2xs font-bold uppercase tracking-wider text-[#567567]">
                    Switch Portal Persona
                  </p>
                  <p className="text-xs text-[#567567] mt-0.5">
                    Select a role to test role-based permissions & dashboards.
                  </p>
                </div>

                <div className="p-1.5 space-y-1">
                  {(['ADMIN', 'HOD', 'REGULAR_TEACHER', 'VISITING_TEACHER'] as UserRole[]).map(
                    (role) => {
                      const conf = roleConfigs[role];
                      const Icon = conf.icon;
                      const isSelected = role === activeRole;
                      return (
                        <button
                          key={role}
                          onClick={() => switchRole(role)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#165534] text-white font-semibold'
                              : 'hover:bg-[#E6F4EC] text-[#0F2D1F]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-1.5 rounded-md ${
                                isSelected ? 'bg-white/20' : 'bg-[#E6F4EC]'
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 ${
                                  isSelected ? 'text-white' : 'text-[#1E7B4E]'
                                }`}
                              />
                            </div>
                            <div>
                              <p>{conf.label}</p>
                              <p
                                className={`text-3xs ${
                                  isSelected ? 'text-emerald-200' : 'text-[#567567]'
                                }`}
                              >
                                {role === 'ADMIN' && '23 Enterprise Modules'}
                                {role === 'HOD' && '13 Dept Modules'}
                                {role === 'REGULAR_TEACHER' && '11 Faculty Modules'}
                                {role === 'VISITING_TEACHER' && '10 Contract Modules'}
                              </p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3BA96F]" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative p-2 text-[#1E7B4E] hover:text-[#165534] hover:bg-[#E6F4EC] rounded-lg transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full text-[10px] font-extrabold w-4 h-4 flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#E2EFE6] py-3 z-50 animate-fade-in">
                <div className="px-4 pb-2 border-b border-[#E2EFE6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#0F2D1F] uppercase tracking-wider">
                      System Notifications
                    </h3>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 text-3xs font-bold bg-[#E6F4EC] text-[#15803D] rounded-full">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllNotifications}
                    className="text-3xs font-semibold text-[#567567] hover:text-[#1E7B4E]"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#E2EFE6]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#567567]">
                      No recent notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.linkModule) onNavigateToModule(n.linkModule);
                          setShowNotifDrawer(false);
                        }}
                        className={`p-3 text-xs hover:bg-[#F6FAF7] cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-[#E6F4EC]/60 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#15803D]" />}
                            {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                            {n.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                            {n.type === 'info' && <Bell className="w-4 h-4 text-[#1E7B4E]" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#0F2D1F]">{n.title}</p>
                            <p className="text-[#567567] text-2xs mt-0.5 leading-normal">{n.message}</p>
                            <p className="text-3xs text-[#567567]/70 mt-1">{n.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#E6F4EC] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#1E7B4E] text-white p-0.5 flex items-center justify-center ring-2 ring-[#E2EFE6] shrink-0">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser?.name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-extrabold text-[#0F2D1F] leading-tight">
                  {activeRole === 'HOD' ? (currentUser?.name || 'HOD') : `Hello, ${currentUser?.name?.split(' ')[0] || 'User'}`}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 leading-tight">
                  {activeRole === 'HOD'
                    ? `${currentUser?.departmentName || 'Department'} • ${currentUser?.campus || (currentUser as any)?.campusName || 'Attock Campus'}`
                    : currentRoleConf?.label || 'Authorized User'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E2EFE6] py-2 z-50 animate-fade-in"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-3 border-b border-[#E2EFE6]">
                  <p className="text-xs font-bold text-[#0F2D1F]">{currentUser?.name || 'User'}</p>
                  <p className="text-3xs text-[#567567] truncate">{currentUser?.email || ''}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E6F4EC] text-[#15803D] text-3xs font-semibold">
                    <span>Dept: {(currentUser?.departmentName || 'University of Education').replace('Department of ', '')}</span>
                  </div>
                </div>

                <div className="py-1 divide-y divide-[#E2EFE6]">
                  <div>
                    <button
                      onClick={() => onNavigateToModule(activeRole === 'HOD' ? 'HOD Profile' : 'My Profile')}
                      className="w-full text-left px-4 py-2 text-xs text-[#0F2D1F] hover:bg-[#E6F4EC] flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#1E7B4E]" />
                      <span>{activeRole === 'HOD' ? 'HOD Profile' : 'My Profile'}</span>
                    </button>
                    {activeRole !== 'HOD' && (
                      <button
                        onClick={() => onNavigateToModule('Settings')}
                        className="w-full text-left px-4 py-2 text-xs text-[#0F2D1F] hover:bg-[#E6F4EC] flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#1E7B4E]" />
                        <span>Settings & Security</span>
                      </button>
                    )}
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
