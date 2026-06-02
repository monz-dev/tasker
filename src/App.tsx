import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { KanbanView } from './components/KanbanView';
import { TasksView } from './components/TasksView';
import { TimelineView } from './components/TimelineView';
import { AgileView } from './components/AgileView';
import { SettingsView } from './components/SettingsView';
import { AuthGuard } from './components/AuthGuard';

export type ViewType = 'dash' | 'projects' | 'kanban' | 'tasks' | 'timeline' | 'agile' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dash');

  return (
    <AuthGuard>
      {({ user, profile, signOut }) => (
        <div className="min-h-screen bg-warm-white text-on-surface font-sans flex flex-col md:pl-20">
          <Navigation currentView={currentView} onChange={setCurrentView} onSignOut={signOut} profile={profile} />
          
          <main className="flex-1 w-full relative">
            {currentView === 'dash' && (
              <DashboardView
                userName={user.user_metadata?.full_name}
                profile={profile}
              />
            )}
            {currentView === 'projects' && <ProjectsView />}
            {currentView === 'kanban' && <KanbanView />}
            {currentView === 'tasks' && <TasksView />}
            {currentView === 'timeline' && <TimelineView />}
            {currentView === 'agile' && <AgileView />}
            {currentView === 'settings' && (
              <SettingsView 
                user={user} 
                profile={profile} 
                onSignOut={signOut} 
              />
            )}
          </main>
        </div>
      )}
    </AuthGuard>
  );
}
