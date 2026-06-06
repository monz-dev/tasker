'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, CheckCircle2, Upload, Target, Plus, Loader2, FolderPlus, AlertCircle, Activity } from 'lucide-react';
import { getActiveProjects } from '@/services/projectService';
import { getPendingTasks, addQuickTask, toggleTaskDone } from '@/services/taskService';
import { getRecentActivity } from '@/services/activityService';
import { getWeeklyStats } from '@/services/dashboardService';
import type { ProjectWithMembers, PendingTask, ActivityLog, WeeklyStats } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  commented: <MessageCircle className="w-4 h-4" />,
  completed_task: <CheckCircle2 className="w-4 h-4" />,
  created_task: <Target className="w-4 h-4" />,
  updated_task: <Activity className="w-4 h-4" />,
  uploaded: <Upload className="w-4 h-4" />,
  created_project: <FolderPlus className="w-4 h-4" />,
  updated_project: <FolderPlus className="w-4 h-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  commented: 'bg-secondary-container text-on-secondary-container',
  completed_task: 'bg-primary-container text-white',
  created_task: 'bg-primary-fixed text-on-primary-fixed',
  updated_task: 'bg-surface-dim text-on-surface-variant',
  uploaded: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  created_project: 'bg-secondary-container text-on-secondary-container',
  updated_project: 'bg-secondary-container text-on-secondary-container',
};

const ACTION_LABELS: Record<string, string> = {
  commented: 'commented on',
  completed_task: 'completed task',
  created_task: 'created task',
  updated_task: 'updated task',
  uploaded: 'uploaded files to',
  created_project: 'created project',
  updated_project: 'updated project',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-sage-accent',
  delayed: 'bg-soft-terracotta',
  completed: 'bg-petroleum-blue',
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDueDate(task: PendingTask): { text: string; className: string } {
  if (task.urgency === 'overdue') return { text: 'Overdue', className: 'text-soft-terracotta' };
  if (task.urgency === 'today') return { text: 'Today', className: 'text-petroleum-blue font-medium' };
  if (task.urgency === 'tomorrow') return { text: 'Tomorrow', className: 'text-on-surface-variant' };
  if (task.due_date) {
    return {
      text: new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      className: 'text-on-surface-variant',
    };
  }
  return { text: 'No date', className: 'text-outline' };
}

// Skeleton components for loading states
function ProjectSkeleton() {
  return (
    <div className="relative p-4 rounded-lg bg-warm-white animate-pulse">
      <div className="absolute left-0 top-4 bottom-4 w-1 bg-stone-bg rounded-r" />
      <div className="pl-3 space-y-3">
        <div className="h-2.5 bg-stone-bg rounded w-20" />
        <div className="h-5 bg-stone-bg rounded w-36" />
        <div className="h-1.5 bg-stone-bg rounded-full w-full" />
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-stone-bg" />
          <div className="w-6 h-6 rounded-full bg-stone-bg" />
        </div>
      </div>
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-5 h-5 rounded-full bg-stone-bg" />
      <div className="flex-grow space-y-2">
        <div className="h-3.5 bg-stone-bg rounded w-3/4" />
        <div className="h-2.5 bg-stone-bg rounded w-1/3" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-stone-bg/60 flex-shrink-0" />
      <div className="space-y-2 pb-4 flex-grow">
        <div className="h-3.5 bg-stone-bg/60 rounded w-4/5" />
        <div className="h-2.5 bg-stone-bg/60 rounded w-1/4" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Team';

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, tasks, act, stats] = await Promise.all([
        getActiveProjects(),
        getPendingTasks(),
        getRecentActivity(),
        getWeeklyStats(),
      ]);
      setProjects(proj);
      setPendingTasks(tasks);
      setActivity(act);
      setWeeklyStats(stats);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || projects.length === 0) return;
    setAddingTask(true);
    try {
      await addQuickTask({
        title: newTaskTitle.trim(),
        project_id: projects[0].id,
      });
      setNewTaskTitle('');
      // Refresh tasks and activity
      const [tasks, act] = await Promise.all([getPendingTasks(), getRecentActivity()]);
      setPendingTasks(tasks);
      setActivity(act);
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await toggleTaskDone(taskId, currentStatus);
      const [tasks, stats, act] = await Promise.all([
        getPendingTasks(),
        getWeeklyStats(),
        getRecentActivity(),
      ]);
      setPendingTasks(tasks);
      setWeeklyStats(stats);
      setActivity(act);
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const maxDailyCount = weeklyStats?.daily
    ? Math.max(...weeklyStats.daily.map(d => d.count), 1)
    : 1;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 mb-24 md:mb-12">
      {/* Welcome Header */}
      <section className="mb-8 pl-1">
        <h2 className="text-[32px] leading-tight font-semibold text-primary mb-1 tracking-tight">
          Hello, {displayName}
        </h2>
        <p className="text-base text-on-surface-variant">Here's today's summary for your projects.</p>
      </section>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-12 gap-4">

        {/* Active Projects Summary */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm ring-1 ring-stone-bg/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-petroleum-blue">Active Projects</h3>
            <span className="text-xs font-semibold text-on-surface-variant">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProjectSkeleton />
              <ProjectSkeleton />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-bg flex items-center justify-center mb-4">
                <FolderPlus className="w-6 h-6 text-outline" />
              </div>
              <p className="text-sm text-on-surface-variant mb-1">No active projects</p>
              <p className="text-xs text-outline">Create a project in the Projects tab to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="relative p-4 rounded-lg bg-warm-white group hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${STATUS_COLORS[project.status] ?? 'bg-outline-variant'}`}
                  />
                  <div className="pl-3">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      {project.status === 'delayed' ? 'Delayed' : 'Active'}
                    </span>
                    <h4 className="text-lg font-semibold mt-1 mb-3 text-petroleum-blue">{project.name}</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-grow bg-stone-bg h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[project.status] ?? 'bg-sage-accent'}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-on-surface-variant">{project.progress}%</span>
                    </div>
                    {project.members && project.members.length > 0 && (
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((member, i) => (
                          <div
                            key={member.user_id}
                            className="w-6 h-6 rounded-full border-2 border-white bg-surface-dim overflow-hidden"
                            title={member.full_name}
                          >
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-[9px] font-bold text-petroleum-blue ${i % 2 === 0 ? 'bg-secondary-container' : 'bg-primary-container'}`}>
                                {(member.full_name || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-stone-bg flex items-center justify-center text-[9px] font-bold text-petroleum-blue">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Mini-Widget */}
        <div className="col-span-12 md:col-span-4 bg-petroleum-blue rounded-xl p-6 text-white shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div>
            <h3 className="text-xs font-semibold text-primary-fixed mb-4 uppercase tracking-widest opacity-90">
              Weekly Metrics
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-semibold leading-none tracking-tighter">
                {loading ? '—' : weeklyStats?.total_completed ?? 0}
              </span>
              <span className="text-sm opacity-80 mb-1">Tasks completed</span>
            </div>
          </div>

          {/* Mini Bar Chart */}
          <div className="mt-8 flex gap-1 items-end h-12 w-full">
            {(weeklyStats?.daily ?? Array(7).fill({ day: 0, count: 0 })).map((d, i) => {
              const height = d.count > 0 ? Math.max((d.count / maxDailyCount) * 100, 10) : 5;
              const isToday = new Date().getDay() === (d.day % 7);
              return (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    isToday
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      : d.count > 0
                        ? 'bg-sage-accent'
                        : 'bg-sage-accent/20'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`Day ${d.day}: ${d.count} tasks`}
                />
              );
            })}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm ring-1 ring-stone-bg/50">
          <h3 className="text-lg font-semibold text-petroleum-blue mb-4">Pending Tasks</h3>

          {loading ? (
            <div className="space-y-2">
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-sage-accent" />
              </div>
              <p className="text-sm text-on-surface-variant">All caught up!</p>
              <p className="text-xs text-outline mt-1">No pending tasks assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => {
                const due = formatDueDate(task);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 hover:bg-stone-bg transition-colors rounded-lg group cursor-pointer"
                    onClick={() => handleToggleTask(task.id, task.status)}
                  >
                    <Target className={`w-5 h-5 flex-shrink-0 ${
                      task.urgency === 'overdue' ? 'text-soft-terracotta' : 'text-outline group-hover:text-petroleum-blue'
                    }`} />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-primary font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-[11px] font-medium ${due.className}`}>{due.text}</p>
                        {task.project_name && (
                          <>
                            <span className="text-outline">·</span>
                            <p className="text-[11px] text-outline truncate">{task.project_name}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Task Input */}
          {projects.length > 0 ? (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a quick task..."
                className="flex-grow px-3 py-2.5 bg-warm-white border border-dashed border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:border-sage-accent focus:ring-1 focus:ring-sage-accent/10 transition-all"
                disabled={addingTask}
              />
              <button
                onClick={handleAddTask}
                disabled={addingTask || !newTaskTitle.trim()}
                className="px-3 py-2.5 bg-petroleum-blue text-white rounded-lg text-xs font-semibold hover:bg-primary transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                {addingTask ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-outline text-center">Create a project first to add tasks.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 md:col-span-6 lg:col-span-8 bg-stone-bg/40 rounded-xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-stone-bg">
          <h3 className="text-lg font-semibold text-petroleum-blue mb-6">Recent Activity</h3>

          {loading ? (
            <div className="space-y-6">
              <ActivitySkeleton />
              <ActivitySkeleton />
              <ActivitySkeleton />
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-stone-bg flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5 text-outline" />
              </div>
              <p className="text-sm text-on-surface-variant">No activity yet</p>
              <p className="text-xs text-outline mt-1">Activity will appear here as your team works.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 relative">
              {activity.map((item, i) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${ACTION_COLORS[item.action] ?? 'bg-surface-dim text-on-surface-variant'}`}>
                      {ACTION_ICONS[item.action] ?? <Activity className="w-4 h-4" />}
                    </div>
                    {i < activity.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/40" />
                    )}
                  </div>
                  <div className={i < activity.length - 1 ? 'pb-4' : ''}>
                    <p className="text-sm text-primary">
                      <span className="font-semibold">{item.user_name}</span>{' '}
                      {ACTION_LABELS[item.action] ?? item.action}{' '}
                      <span className="text-petroleum-blue font-medium">{item.target_name}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1.5">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
