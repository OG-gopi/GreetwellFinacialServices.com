import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  User,
  FileText,
  FolderOpen,
  Package,
  ShieldCheck,
  Settings,
  RefreshCw,
  Bell,
  MessageSquare,
  BarChart3,
  History,
  ChevronDown,
  X,
  Info,
  DollarSign,
  Shield,
  TrendingUp,
  List,
  Menu as MenuIcon,
  Key,
  Sliders,
  PlusCircle,
  Activity,
  CheckSquare,
  Crown,
  HelpCircle,
  Globe,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GFSLogo } from './GFSLogo';
import { api } from '../../services/api';

import { LoanAgentSidebar } from './LoanAgentSidebar';
import { InsuranceAgentSidebar } from './InsuranceAgentSidebar';
import { InvestmentAgentSidebar } from './InvestmentAgentSidebar';
import { CustomerSidebar } from './CustomerSidebar';

const AVAILABLE_ICONS: Record<string, any> = {
  LayoutDashboard,
  Users,
  UserCheck,
  User,
  UserPlus,
  FileText,
  FolderOpen,
  Package,
  ShieldCheck,
  Shield,
  Settings,
  RefreshCw,
  Bell,
  MessageSquare,
  BarChart3,
  History,
  DollarSign,
  TrendingUp,
  List,
  Menu: MenuIcon,
  Key,
  Sliders,
  PlusCircle,
  Activity,
  CheckSquare,
  Globe,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Dynamic Menus State
  const [dynamicMenus, setDynamicMenus] = useState<any[]>([]);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const fetchMyMenus = async () => {
    try {
      const res = await api.get('/menus/my-menus');
      if (res.data.success) {
        const filtered = (res.data.data || []).filter(
          (m: any) => !m.url?.includes('/notifications') && m.name !== 'Notifications'
        );
        setDynamicMenus(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic menus:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyMenus();
    }

    // Listen for menu updates from Superadmin Permission Manager
    const handleUpdate = () => fetchMyMenus();
    window.addEventListener('menuPermissionsUpdated', handleUpdate);
    return () => window.removeEventListener('menuPermissionsUpdated', handleUpdate);
  }, [user]);

  const toggleSubMenu = (menuKey: string) => {
    setOpenSubMenus((prev) => (prev[menuKey] ? {} : { [menuKey]: true }));
  };

  if (!user) return null;

  // Render Role-Specific Sidebar for non-Super Admin roles
  if (user.role === 'LOAN_AGENT') {
    return <LoanAgentSidebar isOpen={isOpen} onClose={onClose} />;
  }
  if (user.role === 'INSURANCE_AGENT') {
    return <InsuranceAgentSidebar isOpen={isOpen} onClose={onClose} />;
  }
  if (user.role === 'INVESTMENT_AGENT') {
    return <InvestmentAgentSidebar isOpen={isOpen} onClose={onClose} />;
  }
  if (user.role === 'CUSTOMER') {
    return <CustomerSidebar isOpen={isOpen} onClose={onClose} />;
  }

  const renderIcon = (iconName: string, isActive: boolean) => {
    const IconComp = AVAILABLE_ICONS[iconName] || FileText;
    return (
      <IconComp
        className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 transition-colors ${
          isActive ? 'text-white' : 'text-[#1d63ed]'
        }`}
      />
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container Matching Reference Image (Soft Light Blue Background) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#e8f1fd] text-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-blue-200/60 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Logo & Super Admin Crown Role Badge Matching Reference */}
          <div className="p-5 flex flex-col items-center justify-center relative bg-[#e8f1fd]">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-900 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* GFS Logo in Dark Navy Rounded Box */}
            <GFSLogo size="lg" variant="dark" />

            {/* Super Admin Pill Badge with Crown Icon */}
            <div className="mt-3.5 px-4 py-1.5 rounded-full bg-white/90 text-[#1e3a8a] border border-blue-200/80 text-xs font-extrabold shadow-sm flex items-center gap-1.5 font-sans">
              <Crown className="w-4 h-4 text-blue-600 fill-blue-100" />
              <span>Super Admin</span>
            </div>
          </div>

          {/* Dynamic Menu Navigation List Matching Reference Image */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1.5 text-[14.5px] font-semibold custom-scrollbar">
            {dynamicMenus.length > 0 ? (
              dynamicMenus.map((m) => {
                const hasChildren = m.children && m.children.length > 0;

                if (!hasChildren) {
                  return (
                    <NavLink
                      key={m.id}
                      to={m.url}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center px-4 h-12 rounded-xl transition-all ${
                          isActive
                            ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                            : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {renderIcon(m.icon, isActive)}
                          <span className="truncate">{m.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                }

                // Collapsible Parent Menu Item
                const isSubOpen = Boolean(openSubMenus[m.id]);
                return (
                  <div key={m.id}>
                    <button
                      onClick={() => toggleSubMenu(m.id)}
                      className={`w-full flex items-center justify-between px-4 h-12 rounded-xl transition-all text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852] ${
                        isSubOpen ? 'bg-blue-100/50' : ''
                      }`}
                    >
                      <div className="flex items-center truncate">
                        {renderIcon(m.icon, false)}
                        <span className="truncate">{m.name}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-blue-500 ml-auto flex-shrink-0 transition-transform ${
                          isSubOpen ? 'rotate-180 text-blue-700' : ''
                        }`}
                      />
                    </button>

                    {isSubOpen && (
                      <div className="pl-11 pr-3 py-1.5 space-y-1 bg-white/70 rounded-xl my-1 border border-blue-100 text-xs shadow-inner">
                        {m.children.map((c: any) => (
                          <NavLink
                            key={c.id}
                            to={c.url}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `block py-1.5 px-2.5 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors font-medium ${
                                isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : ''
                              }`
                            }
                          >
                            {c.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback Default Hardcoded Superadmin Navigation Matching Reference
              <>
                <NavLink
                  to="/superadmin/dashboard"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <LayoutDashboard className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Dashboard</span>
                    </>
                  )}
                </NavLink>

                {/* Collapsible Users Management Menu */}
                <div>
                  <button
                    onClick={() => toggleSubMenu('users-parent')}
                    className={`w-full flex items-center justify-between px-4 h-12 rounded-xl transition-all text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852] ${
                      openSubMenus['users-parent'] ? 'bg-blue-100/50' : ''
                    }`}
                  >
                    <div className="flex items-center truncate">
                      <Users className="h-[22px] w-[22px] mr-3.5 flex-shrink-0 text-[#1d63ed]" />
                      <span className="truncate">Users Management</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-blue-500 ml-auto flex-shrink-0 transition-transform ${
                        openSubMenus['users-parent'] ? 'rotate-180 text-blue-700' : ''
                      }`}
                    />
                  </button>

                  {openSubMenus['users-parent'] && (
                    <div className="pl-11 pr-3 py-1.5 space-y-1 bg-white/70 rounded-xl my-1 border border-blue-100 text-xs shadow-inner">
                      <NavLink
                        to="/superadmin/users"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        All Portal Users
                      </NavLink>
                      <NavLink
                        to="/superadmin/users/create"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Create / Invite User
                      </NavLink>
                      <NavLink
                        to="/superadmin/agents/manage"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Manage & Invite Agents
                      </NavLink>
                      <NavLink
                        to="/superadmin/customers"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Customers
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Collapsible Applications Menu */}
                <div>
                  <button
                    onClick={() => toggleSubMenu('applications')}
                    className={`w-full flex items-center justify-between px-4 h-12 rounded-xl transition-all text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852] ${
                      openSubMenus['applications'] ? 'bg-blue-100/50' : ''
                    }`}
                  >
                    <div className="flex items-center truncate">
                      <FileText className="h-[22px] w-[22px] mr-3.5 flex-shrink-0 text-[#1d63ed]" />
                      <span className="truncate">Applications</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-blue-500 ml-auto flex-shrink-0 transition-transform ${
                        openSubMenus['applications'] ? 'rotate-180 text-blue-700' : ''
                      }`}
                    />
                  </button>

                  {openSubMenus['applications'] && (
                    <div className="pl-11 pr-3 py-1.5 space-y-1 bg-white/70 rounded-xl my-1 border border-blue-100 text-xs shadow-inner">
                      <NavLink
                        to="/superadmin/applications/all"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        All Applications
                      </NavLink>
                      <NavLink
                        to="/superadmin/applications/loans"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Loan Applications
                      </NavLink>
                      <NavLink
                        to="/superadmin/applications/insurance"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Insurance Applications
                      </NavLink>
                      <NavLink
                        to="/superadmin/applications/investments"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Investment Applications
                      </NavLink>
                      <NavLink
                        to="/superadmin/create-application"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-bold text-blue-700 hover:bg-blue-100/70 border-t border-blue-100 mt-1 pt-2 ${
                            isActive ? 'bg-blue-100/80 font-extrabold' : ''
                          }`
                        }
                      >
                        + Create Application
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink
                  to="/superadmin/documents"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <FolderOpen className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Documents</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/superadmin/products/catalog"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Package className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Products & Services</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/superadmin/permissions/menu-items"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <ShieldCheck className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Roles & Permissions</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/superadmin/system/configurations"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Sliders className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>System Management</span>
                    </>
                  )}
                </NavLink>

                {/* Collapsible Website & Portal Management Menu (Placed BELOW System Management and ABOVE Updates & Versions) */}
                <div>
                  <button
                    onClick={() => toggleSubMenu('website')}
                    className={`w-full flex items-center justify-between px-4 h-12 rounded-xl transition-all text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852] ${
                      openSubMenus['website'] ? 'bg-blue-100/50' : ''
                    }`}
                  >
                    <div className="flex items-center truncate">
                      <Globe className="h-[22px] w-[22px] mr-3.5 flex-shrink-0 text-[#1d63ed]" />
                      <span className="truncate">Website & Portal Management</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-blue-500 ml-auto flex-shrink-0 transition-transform ${
                        openSubMenus['website'] ? 'rotate-180 text-blue-700' : ''
                      }`}
                    />
                  </button>

                  {openSubMenus['website'] && (
                    <div className="pl-11 pr-3 py-1.5 space-y-1 bg-white/70 rounded-xl my-1 border border-blue-100 text-xs shadow-inner">
                      <NavLink
                        to="/superadmin/website-management/content"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Website Content
                      </NavLink>
                      <NavLink
                        to="/superadmin/website-management/contact"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Contact Information
                      </NavLink>
                      <NavLink
                        to="/superadmin/website-management/social"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Social Media
                      </NavLink>
                      <NavLink
                        to="/superadmin/website-management/media"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Images & Media
                      </NavLink>
                      <NavLink
                        to="/superadmin/website-management/preview"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Preview Changes
                      </NavLink>
                      <NavLink
                        to="/superadmin/website-management/history"
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block py-2 px-3 rounded-lg transition-colors font-medium ${
                            isActive ? 'text-blue-700 font-extrabold bg-blue-100/60' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                          }`
                        }
                      >
                        Change History
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink
                  to="/superadmin/updates/release-notes"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <RefreshCw className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Updates & Versions</span>
                    </>
                  )}
                </NavLink>


                <NavLink
                  to="/superadmin/enquiries"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <MessageSquare className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Enquiries / Complaints</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/superadmin/reports"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <BarChart3 className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Reports</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/superadmin/audit-logs"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <History className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Audit Logs</span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/superadmin/settings/portal"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 h-12 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2377fc] text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-[#1e3a8a] hover:bg-blue-100/70 hover:text-[#0f2852]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Settings className={`h-[22px] w-[22px] mr-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#1d63ed]'}`} />
                      <span>Settings</span>
                    </>
                  )}
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};
