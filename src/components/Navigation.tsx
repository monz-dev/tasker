'use client';

import {
  Bell,
  CheckCircle2,
  Folder,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Clock,
  MoreHorizontal,
  Settings,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Profile } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';

const ROUTE_MAP = {
  dashboard: '/dashboard',
  projects: '/projects',
  kanban: '/kanban',
  tasks: '/tasks',
  timeline: '/timeline',
  settings: '/settings',
} as const;

type RouteKey = keyof typeof ROUTE_MAP;

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (route: RouteKey) => {
    router.push(ROUTE_MAP[route]);
    setMobileMenuOpen(false);
  };

  const isActive = (route: RouteKey) => pathname === ROUTE_MAP[route];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Top Header */}
      <header className="w-full sticky top-0 z-40 bg-warm-white/90 backdrop-blur-md md:bg-surface-container md:border-b md:border-stone-bg transition-colors duration-200">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface-variant/50 text-petroleum-blue">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-stone-bg overflow-hidden flex-shrink-0 border border-outline-variant/30 hidden md:block">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-petroleum-blue text-white flex items-center justify-center font-bold text-sm">
                  {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'US'}
                </div>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-petroleum-blue tracking-tight">
              {profile?.full_name || 'Tasker'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors duration-200 text-petroleum-blue">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-4 pt-2 bg-warm-white/90 backdrop-blur-md border-t border-stone-bg shadow-[0_-4px_24px_rgba(0,0,0,0.02)] md:hidden">
        <NavItem icon={<LayoutDashboard className="w-6 h-6" />} label="Dash" isActive={isActive('dashboard')} onClick={() => navigate('dashboard')} />
        <NavItem icon={<KanbanSquare className="w-6 h-6" />} label="Kanban" isActive={isActive('kanban')} onClick={() => navigate('kanban')} />
        <NavItem icon={<CheckCircle2 className="w-6 h-6" />} label="Tasks" isActive={isActive('tasks')} onClick={() => navigate('tasks')} />

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center px-3 py-1.5 transition-colors duration-200 ${mobileMenuOpen ? 'text-petroleum-blue' : 'text-on-surface-variant'}`}
        >
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Más</span>
        </button>
      </nav>

      {/* Mobile Pop-up Menu for extra items */}
      {mobileMenuOpen && (
        <div className="fixed bottom-20 right-4 bg-surface-container-lowest border border-stone-bg p-4 rounded-2xl shadow-lg z-40 flex flex-col gap-4 min-w-[160px] animate-in slide-in-from-bottom-2 md:hidden">
          <SidebarItem icon={<Folder className="w-5 h-5 mr-3" />} label="Proyectos" isActive={isActive('projects')} onClick={() => navigate('projects')} />
          <SidebarItem icon={<Clock className="w-5 h-5 mr-3" />} label="Timeline" isActive={isActive('timeline')} onClick={() => navigate('timeline')} />
          <SidebarItem icon={<Settings className="w-5 h-5 mr-3" />} label="Configuración" isActive={isActive('settings')} onClick={() => navigate('settings')} />
          <>
            <div className="w-full h-px bg-outline-variant/30 my-1" />
            <SidebarItem icon={<LogOut className="w-5 h-5 mr-3" />} label="Cerrar sesión" isActive={false} onClick={handleSignOut} />
          </>
        </div>
      )}

      {/* Desktop Sidebar (Left side, fixed depth) */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-stone-bg flex-col items-center py-8 gap-8 border-r border-outline-variant/20 z-50 overflow-y-auto no-scrollbar">
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-petroleum-blue text-white flex items-center justify-center font-bold text-sm">
              {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'US'}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 mt-2 w-full px-3">
          <SidebarIcon icon={<LayoutDashboard />} title="Dashboard" isActive={isActive('dashboard')} onClick={() => navigate('dashboard')} />
          <SidebarIcon icon={<Folder />} title="Proyectos" isActive={isActive('projects')} onClick={() => navigate('projects')} />
          <SidebarIcon icon={<KanbanSquare />} title="Kanban" isActive={isActive('kanban')} onClick={() => navigate('kanban')} />
          <SidebarIcon icon={<CheckCircle2 />} title="Mis Tareas" isActive={isActive('tasks')} onClick={() => navigate('tasks')} />
          <SidebarIcon icon={<Clock />} title="Timeline" isActive={isActive('timeline')} onClick={() => navigate('timeline')} />
        </div>
        <div className="mt-auto w-full px-3 space-y-2">
          <SidebarIcon icon={<Settings />} title="Configuración" isActive={isActive('settings')} onClick={() => navigate('settings')} />
          <button
            onClick={handleSignOut}
            className="p-3 w-full flex items-center justify-center text-on-surface-variant hover:bg-error-container/50 hover:text-error rounded-xl transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  if (isActive) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-4 py-1.5 transition-transform duration-200"
      >
        {icon}
        <span className="text-[10px] font-medium mt-1">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-on-surface-variant hover:text-petroleum-blue px-3 py-1.5 transition-colors duration-200"
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}

function SidebarIcon({ icon, title, isActive, onClick }: { icon: React.ReactNode; title: string; isActive: boolean; onClick: () => void }) {
  if (isActive) {
    return (
      <button
        onClick={onClick}
        className="p-3 w-full flex items-center justify-center bg-secondary-container rounded-xl text-on-secondary-container transition-all"
        title={title}
      >
        {icon}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="p-3 w-full flex items-center justify-center text-on-surface-variant hover:bg-white/50 hover:text-petroleum-blue rounded-xl transition-all"
      title={title}
    >
      {icon}
    </button>
  );
}

function SidebarItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface hover:bg-stone-bg'}`}
    >
      {icon}
      {label}
    </button>
  );
}
