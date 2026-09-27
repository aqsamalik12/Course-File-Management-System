import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import { UELogo } from './UELogo';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  BookOpen,
  CalendarDays,
  FileCheck2,
  CheckCircle,
  FolderTree,
  Clock,
  BarChart3,
  Bell,
  Megaphone,
  Archive,
  Trash2,
  History,
  MessageSquare,
  Calendar as CalendarIcon,
  Lock,
  FileText,
  Sliders,
  User,
  HelpCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  LogOut,
  ClipboardList,
  Landmark,
  UserCheck,
  Key,
  BookMarked,
  Layers,
  Search,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (moduleName: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SubMenuItem {
  name: string;
  badge?: number;
  badgeColor?: string;
}

export interface NavParent {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
  children?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen = false,
  onClose,
  collapsed,
  setCollapsed
}) => {
  const { activeRole, logout, users: allUsers, currentUser } = useAuth();
  const { courseFiles, notifications, teacherRequests = [] } = useCFMS();

  // Dynamic Badges
  const pendingApprovalsCount = courseFiles.filter(
    (f) => f.status === 'Submitted' || f.status === 'In Review'
  ).length;

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Pending teacher profile forms count (for admin badge)
  const pendingFormsCount = allUsers.filter(
    (u) => (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER') && !u.profileFormSubmitted && u.registeredAt
  ).length;

  // 1. Admin Nav Accordions - Exact 22 Modules in Order (Section 4)
  const adminNav: NavParent[] = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Campus Management',
      icon: Landmark,
      children: [
        { name: 'All Campus' },
        { name: 'Add Campus' }
      ]
    },
    {
      name: 'Department Management',
      icon: Building2,
      children: [
        { name: 'All Department' },
        { name: 'Add Department' }
      ]
    },
    {
      name: 'HOD Management',
      icon: UserCheck,
      children: [
        { name: 'Assign HOD' },
        { name: 'HOD Assignments' },
        { name: 'Reassign HOD' }
      ]
    },
    {
      name: 'HOD Access & Permissions',
      icon: Key,
      children: [
        { name: 'HOD Access Control' },
        { name: 'Reset HOD Password' }
      ]
    },
    {
      name: 'Teacher Registration Requests',
      icon: ClipboardList,
      badge: pendingFormsCount > 0 ? pendingFormsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      children: [
        { name: 'Pending Requests', badge: pendingFormsCount > 0 ? pendingFormsCount : undefined, badgeColor: 'bg-amber-500 text-white' },
        { name: 'All Requests' },
        { name: 'Rejected Requests' }
      ]
    },
    {
      name: 'Teacher Registration',
      icon: CheckCircle,
      children: [
        { name: 'Registered Teachers' },
        { name: 'Registration Records' }
      ]
    },
    {
      name: 'Teacher Management',
      icon: GraduationCap,
      children: [
        { name: 'All Teachers' },
        { name: 'Regular Faculty' },
        { name: 'Visiting Faculty' },
        { name: 'Teacher Directory' }
      ]
    },
    {
      name: 'Course Management',
      icon: BookOpen,
      children: [
        { name: 'All Courses' },
        { name: 'Campus Wise' },
        { name: 'Department Wise' },
        { name: 'Semester Wise' }
      ]
    },
    {
      name: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount,
      badgeColor: 'bg-emerald-600 text-white',
      children: [
        { name: 'All Notifications', badge: unreadNotifsCount, badgeColor: 'bg-emerald-600 text-white' },
        { name: 'System Notifications' }
      ]
    },
    {
      name: 'Roles & Permissions',
      icon: ShieldCheck,
      children: [
        { name: 'Roles' },
        { name: 'Permissions' },
        { name: 'Assign Permissions' }
      ]
    },
    {
      name: 'Reports & Analytics',
      icon: BarChart3,
      children: [
        { name: 'Dashboard Reports' },
        { name: 'Department Reports' },
        { name: 'Teacher Reports' },
        { name: 'Course Reports' }
      ]
    },
    {
      name: 'Audit Logs',
      icon: History,
      children: [
        { name: 'User Audit' },
        { name: 'File Audit' },
        { name: 'Approval Audit' }
      ]
    },
    {
      name: 'System Settings',
      icon: Sliders,
      children: [
        { name: 'General Settings' },
        { name: 'University Profile' },
        { name: 'Email Settings' },
        { name: 'Backup & Restore' }
      ]
    },
    {
      name: 'Admin Profile',
      icon: User,
      children: [
        { name: 'Personal Information' },
        { name: 'Security' },
        { name: 'Login History' }
      ]
    },
    {
      name: 'Help / Support',
      icon: HelpCircle,
      children: [
        { name: 'Documentation' },
        { name: 'FAQs' },
        { name: 'Contact Support' }
      ]
    }
  ];

  // 2. Final HOD Nav Modules in exact required sequence (Requirements 3 & 51):
  // Dashboard -> Academic / Course Files (Course Files, Pending Course Files, Approved Course Files) -> Teachers (Teacher Requests, Approved Teachers, Teacher Profiles) -> Progress (Course / File Progress) -> Notifications -> HOD Profile
  const hodNav: NavParent[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    {
      name: 'Academic / Course Files',
      icon: FolderTree,
      children: [
        { name: 'Course Files' },
        { name: 'Pending Course Files' },
        { name: 'Approved Course Files' }
      ]
    },
    {
      name: 'Teachers',
      icon: Users,
      children: [
        {
          name: 'Teacher Requests',
          badge: teacherRequests.filter((r) => r.status === 'PendingHODApproval').length > 0
            ? teacherRequests.filter((r) => r.status === 'PendingHODApproval').length
            : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        { name: 'Approved Teachers' },
        { name: 'Teacher Profiles' }
      ]
    },
    {
      name: 'Progress',
      icon: BarChart2,
      children: [
        { name: 'Course / File Progress' }
      ]
    },
    {
      name: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-emerald-600 text-white'
    },
    { name: 'HOD Profile', icon: User }
  ];

  // 3. Teacher Nav Items (Clean, Minimal Sidebar)
  const teacherFormSubmitted = currentUser?.profileFormSubmitted ?? false;
  const teacherNav: NavParent[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    {
      name: 'My Profile Form',
      icon: ClipboardList,
      badge: !teacherFormSubmitted ? 1 : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { name: 'My Assigned Courses', icon: BookOpen },
    { name: 'Course File Submission', icon: Upload },
    { name: 'Templates & Instructions', icon: FileText },
    { name: 'Submission History', icon: History },
    {
      name: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount,
      badgeColor: 'bg-emerald-600 text-white'
    },
    { name: 'My Profile', icon: User },
    { name: 'Logout', icon: LogOut }
  ];

  const getNavItems = (): NavParent[] => {
    switch (activeRole) {
      case 'ADMIN':
        return adminNav;
      case 'HOD':
        return hodNav;
      case 'REGULAR_TEACHER':
      case 'VISITING_TEACHER':
        return teacherNav;
      default:
        return adminNav;
    }
  };

  const navItems = getNavItems();

  // Accordion State: Stores the currently expanded parent module name
  const [expandedMenu, setExpandedMenu] = useState<string>('');

  // Sync expanded menu when activeModule changes externally
  useEffect(() => {
    const parentForActive = navItems.find(
      (parent) =>
        parent.name === activeModule ||
        parent.children?.some((child) => child.name === activeModule)
    );
    if (parentForActive) {
      setExpandedMenu(parentForActive.name);
    }
  }, [activeModule, activeRole]);

  const handleParentClick = (parent: NavParent) => {
    if (parent.name === 'Logout') {
      logout();
      if (onClose) onClose();
      return;
    }

    if (collapsed) {
      // Uncollapse sidebar if user clicks a parent while collapsed
      setCollapsed(false);
    }

    if (!parent.children || parent.children.length === 0) {
      // Single page item with no dropdown
      onSelectModule(parent.name);
      if (onClose) onClose();
      return;
    }

    // Accordion Toggle Behavior: Only one expanded parent at a time
    if (expandedMenu === parent.name) {
      setExpandedMenu('');
    } else {
      setExpandedMenu(parent.name);
      // Select parent default module or first child
      onSelectModule(parent.children[0]?.name || parent.name);
    }
  };

  const handleChildClick = (childName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectModule(childName);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop & Off-Canvas Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-[80vw] bg-[#165534] text-white flex flex-col h-full shadow-2xl z-50 animate-slide-right select-none">
            {/* Brand Header */}
            <div className="h-16 px-4 border-b border-emerald-800/60 flex items-center justify-between shrink-0 bg-[#12482c]">
              <UELogo size="sm" showText={true} />
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800/60 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Role Scope Indicator */}
            {activeRole === 'HOD' ? (
              <div className="px-4 py-2.5 bg-[#103e26] border-b border-emerald-800/60 text-xs shrink-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs truncate">{currentUser?.name}</span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-700/60">HOD</span>
                </div>
                <div className="text-[11px] text-emerald-200 font-semibold truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{currentUser?.departmentName || 'Department'}</span>
                </div>
                <div className="text-[10px] text-emerald-300/80 font-medium truncate flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-emerald-400/80 shrink-0" />
                  <span>{currentUser?.campus || currentUser?.campusName || 'Attock Campus'}</span>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 bg-[#12482c]/80 border-b border-emerald-800/50 flex items-center justify-between text-2xs shrink-0">
                <span className="text-emerald-200/80 font-medium uppercase tracking-wider">Role</span>
                <span className="font-bold text-white bg-[#1E7B4E] px-2 py-0.5 rounded border border-emerald-600/40">
                  {activeRole === 'ADMIN' ? 'Admin'
                    : activeRole === 'REGULAR_TEACHER' ? 'Teacher'
                    : 'Visiting Faculty'}
                </span>
              </div>
            )}

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-scrollbar">
              {navItems.map((parent) => {
                const Icon = parent.icon;
                const hasChildren = Boolean(parent.children && parent.children.length > 0);
                const isExpanded = expandedMenu === parent.name;
                const isParentActive =
                  activeModule === parent.name ||
                  parent.children?.some((child) => child.name === activeModule);

                return (
                  <div key={parent.name} className="flex flex-col">
                    <button
                      onClick={() => handleParentClick(parent)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group ${
                        isParentActive
                          ? 'bg-[#1E7B4E] text-white font-bold shadow-sm'
                          : 'text-emerald-100/90 hover:text-white hover:bg-[#1A6B43]'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0 text-emerald-200" />
                      <span className="truncate flex-1 text-left">{parent.name}</span>
                      {parent.badge !== undefined && parent.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-bold shrink-0 ${parent.badgeColor || 'bg-emerald-800 text-white'}`}>
                          {parent.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown className={`w-3.5 h-3.5 text-emerald-200 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                      )}
                    </button>

                    {hasChildren && isExpanded && (
                      <div className="ml-5 pl-2.5 my-1 border-l border-emerald-700/60 space-y-1">
                        {parent.children?.map((child) => (
                          <button
                            key={child.name}
                            onClick={(e) => handleChildClick(child.name, e)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              activeModule === child.name
                                ? 'bg-[#1E7B4E] text-white font-bold'
                                : 'text-emerald-100/80 hover:text-white hover:bg-[#1A6B43]/80'
                            }`}
                          >
                            <span className="truncate">{child.name}</span>
                            {child.badge !== undefined && child.badge > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-3xs font-bold bg-amber-500 text-white">
                                {child.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-[#165534] text-white transition-[width] duration-300 ease-in-out select-none shadow-md z-20 h-full overflow-x-hidden ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3 border-b border-emerald-800/60 flex items-center justify-between shrink-0 bg-[#12482c]">
          {!collapsed ? (
            <UELogo size="sm" showText={true} />
          ) : (
            <div className="mx-auto">
              <UELogo size="sm" showText={false} />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors cursor-pointer shrink-0 ml-1"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Scope Indicator */}
        {!collapsed && (
          activeRole === 'HOD' ? (
            <div className="px-3.5 py-2.5 bg-[#103e26] border-b border-emerald-800/60 text-xs shrink-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs truncate">{currentUser?.name}</span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-700/60">HOD</span>
              </div>
              <div className="text-[11px] text-emerald-200 font-semibold truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{currentUser?.departmentName || 'Department'}</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 font-medium truncate flex items-center gap-1">
                <Landmark className="w-3 h-3 text-emerald-400/80 shrink-0" />
                <span>{currentUser?.campus || currentUser?.campusName || 'Attock Campus'}</span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 bg-[#12482c]/80 border-b border-emerald-800/50 flex items-center justify-between text-2xs shrink-0">
              <span className="text-emerald-200/80 font-medium uppercase tracking-wider">Role</span>
              <span className="font-bold text-white bg-[#1E7B4E] px-2 py-0.5 rounded border border-emerald-600/40 capitalize">
                {activeRole === 'ADMIN' ? 'Admin'
                  : activeRole === 'REGULAR_TEACHER' ? 'Teacher'
                  : 'Visiting Faculty'}
              </span>
            </div>
          )
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 custom-scrollbar">
          {navItems.map((parent) => {
            const Icon = parent.icon;
            const hasChildren = Boolean(parent.children && parent.children.length > 0);
            const isExpanded = expandedMenu === parent.name;
            const isParentActive =
              activeModule === parent.name ||
              parent.children?.some((child) => child.name === activeModule);

            return (
              <div key={parent.name} className="flex flex-col relative group">
                {/* Parent Button */}
                <button
                  onClick={() => handleParentClick(parent)}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer relative ${
                    isParentActive
                      ? 'bg-[#1E7B4E] text-white font-bold shadow-sm'
                      : 'text-emerald-100/90 hover:text-white hover:bg-[#1A6B43]'
                  }`}
                  title={collapsed ? parent.name : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isParentActive ? 'text-white' : 'text-emerald-200 group-hover:text-white'
                    }`}
                  />

                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left font-medium">{parent.name}</span>
                      {parent.badge !== undefined && parent.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-3xs font-bold shrink-0 ${
                            parent.badgeColor || 'bg-emerald-800 text-white'
                          }`}
                        >
                          {parent.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-emerald-200/80 transition-transform duration-200 ease-in-out shrink-0 ${
                            isExpanded ? 'rotate-180 text-white' : 'group-hover:text-white'
                          }`}
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Hover Tooltip when Collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0F2D1F] text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 whitespace-nowrap border border-emerald-700/60 flex items-center gap-2">
                    <span>{parent.name}</span>
                    {parent.badge !== undefined && parent.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-3xs font-bold ${
                          parent.badgeColor || 'bg-amber-500 text-white'
                        }`}
                      >
                        {parent.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Submenu Accordion */}
                {!collapsed && hasChildren && (
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[600px] opacity-100 my-1' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="ml-5 pl-2.5 border-l border-emerald-700/60 space-y-0.5">
                      {parent.children?.map((child) => {
                        const isChildActive = activeModule === child.name;

                        return (
                          <button
                            key={child.name}
                            onClick={(e) => handleChildClick(child.name, e)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                              isChildActive
                                ? 'bg-[#1E7B4E] text-white font-bold shadow-2xs'
                                : 'text-emerald-100/80 hover:text-white hover:bg-[#1A6B43]/80 font-normal'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isChildActive ? 'bg-white animate-pulse' : 'bg-emerald-400/60'
                                }`}
                              />
                              <span className="truncate">{child.name}</span>
                            </div>

                            {child.badge !== undefined && child.badge > 0 && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-3xs font-bold ${
                                  child.badgeColor || 'bg-amber-500 text-white'
                                }`}
                              >
                                {child.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t border-emerald-800/60 text-3xs text-emerald-200/70 text-center shrink-0 font-medium">
          {!collapsed ? 'University of Education Attock © 2026' : 'UE'}
        </div>
      </aside>
    </>
  );
};
