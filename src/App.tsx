import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { KanbanView } from './components/KanbanView';
import { TasksView } from './components/TasksView';
import { TimelineView } from './components/TimelineView';
import { AgileView } from './components/AgileView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

export type ViewType = 'dash' | 'projects' | 'kanban' | 'tasks' | 'timeline' | 'agile' | 'reports' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dash');

  return (
    <div className="min-h-screen bg-warm-white text-on-surface font-sans flex flex-col md:pl-20">
      <Navigation currentView={currentView} onChange={setCurrentView} />
      
      <main className="flex-1 w-full relative">
        {currentView === 'dash' && <DashboardView />}
        {currentView === 'projects' && <ProjectsView />}
        {currentView === 'kanban' && <KanbanView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'timeline' && <TimelineView />}
        {currentView === 'agile' && <AgileView />}
        {currentView === 'reports' && <ReportsView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
