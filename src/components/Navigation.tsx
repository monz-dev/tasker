import { 
  Bell, 
  CheckCircle2, 
  Folder, 
  KanbanSquare, 
  LayoutDashboard, 
  Menu,
  Clock,
  MoreHorizontal,
  LayoutTemplate,
  BarChart2,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import type { ViewType } from '../App';

interface NavigationProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
}

export function Navigation({ currentView, onChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXRCexdeztCaSQkjv5pxqZ-lpqZXEN43Ci5UsmNUFz_Lw3MAR6A4x7HRCRl02_xvEKOXMEP_4sHp-s9igQrI3ObAnJkURgoxSttFEnbzLqWvvUl65cDbbghlPm2pjlmWEN8MUMJuFchwrfHDqqZRxknJABfzcDkW8pH8xed1W506Pwesn0Ue_BCIG5KxzNfoaywt-VqvWEtKTUd5mrkrh1pBJirlboY1RxYcK31ggxiwr7NDiQfv-Mnyf98tP4ypA3pLjlbN4nJQ" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-petroleum-blue tracking-tight">Stone & Sage</h1>
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
        <NavItem icon={<LayoutDashboard className="w-6 h-6" />} label="Dash" isActive={currentView === 'dash'} onClick={() => { onChange('dash'); setMobileMenuOpen(false); }} />
        <NavItem icon={<KanbanSquare className="w-6 h-6" />} label="Kanban" isActive={currentView === 'kanban'} onClick={() => { onChange('kanban'); setMobileMenuOpen(false); }} />
        <NavItem icon={<CheckCircle2 className="w-6 h-6" />} label="Tasks" isActive={currentView === 'tasks'} onClick={() => { onChange('tasks'); setMobileMenuOpen(false); }} />
        <NavItem icon={<LayoutTemplate className="w-6 h-6" />} label="Agile" isActive={currentView === 'agile'} onClick={() => { onChange('agile'); setMobileMenuOpen(false); }} />
        
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
           <SidebarItem icon={<Folder className="w-5 h-5 mr-3"/>} label="Proyectos" isActive={currentView === 'projects'} onClick={() => {onChange('projects'); setMobileMenuOpen(false)}} />
           <SidebarItem icon={<Clock className="w-5 h-5 mr-3"/>} label="Timeline" isActive={currentView === 'timeline'} onClick={() => {onChange('timeline'); setMobileMenuOpen(false)}} />
           <SidebarItem icon={<BarChart2 className="w-5 h-5 mr-3"/>} label="Reportes" isActive={currentView === 'reports'} onClick={() => {onChange('reports'); setMobileMenuOpen(false)}} />
           <SidebarItem icon={<Settings className="w-5 h-5 mr-3"/>} label="Configuración" isActive={currentView === 'settings'} onClick={() => {onChange('settings'); setMobileMenuOpen(false)}} />
        </div>
      )}

      {/* Desktop Sidebar (Left side, fixed depth) */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-stone-bg flex-col items-center py-8 gap-8 border-r border-outline-variant/20 z-50 overflow-y-auto no-scrollbar">
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlgFLYhwvqaWsN2eHwoL1viTINNRac03eFbjoHXtUkpgJWrhK27lDTlAIRElvWSyVrurWmzCd49Se5zaxbOvZPaGW0B2cis4obF9Gt-gkz2bQSC6oclCRhTlGZQbM5RJpPjLHJwiPP5XpP5vA0t9Wgnfr1dKxnyv77CrkW56ypi747KkpwoYpIA-b_dtmJc9JOx40NHjMhvXiRWWezsSS6frCZyA-x3VKIm5twlI1Zny3Oi6PUknpTNNMfRZ3JSd0TGbM87dDhbw" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
        </div>
        <div className="flex flex-col gap-3 mt-2 w-full px-3">
          <SidebarIcon icon={<LayoutDashboard />} title="Dashboard" isActive={currentView === 'dash'} onClick={() => onChange('dash')} />
          <SidebarIcon icon={<Folder />} title="Proyectos" isActive={currentView === 'projects'} onClick={() => onChange('projects')} />
          <SidebarIcon icon={<KanbanSquare />} title="Kanban" isActive={currentView === 'kanban'} onClick={() => onChange('kanban')} />
          <SidebarIcon icon={<CheckCircle2 />} title="Mis Tareas" isActive={currentView === 'tasks'} onClick={() => onChange('tasks')} />
          <SidebarIcon icon={<Clock />} title="Timeline" isActive={currentView === 'timeline'} onClick={() => onChange('timeline')} />
          <div className="w-8 h-px bg-outline-variant/30 mx-auto my-1"></div>
          <SidebarIcon icon={<LayoutTemplate />} title="Agile Sprints" isActive={currentView === 'agile'} onClick={() => onChange('agile')} />
          <SidebarIcon icon={<BarChart2 />} title="Reportes" isActive={currentView === 'reports'} onClick={() => onChange('reports')} />
        </div>
        <div className="mt-auto w-full px-3">
           <SidebarIcon icon={<Settings />} title="Configuración" isActive={currentView === 'settings'} onClick={() => onChange('settings')} />
        </div>
      </div>
    </>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
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

function SidebarIcon({ icon, title, isActive, onClick }: { icon: React.ReactNode, title: string, isActive: boolean, onClick: () => void }) {
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

function SidebarItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
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
