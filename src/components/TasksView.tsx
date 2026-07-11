'use client';

import { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronRight, Inbox, Plus, Star, ArrowUpRight, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { getPendingTasks, addQuickTask, toggleTaskDone } from "@/services/taskService";
import { getActiveProjects } from "@/services/projectService";
import type { PendingTask, ProjectWithMembers } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";

const PRIORITY_BORDER_COLORS = {
  urgent: "border-soft-terracotta",
  high: "border-dim-amber",
  medium: "border-petroleum-blue",
  low: "border-sage-accent",
};

export function TasksView() {
  const { loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [proj, tasks] = await Promise.all([
        getActiveProjects(),
        getPendingTasks(),
      ]);
      setProjects(proj);
      setPendingTasks(tasks);
    } catch (err: any) {
      console.error("Error loading tasks view:", err);
      setError(err?.message || "No se pudieron cargar las tareas. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || projects.length === 0) return;
    setAddingTask(true);
    setError(null);
    try {
      await addQuickTask({
        title: newTaskTitle.trim(),
        project_id: projects[0].id,
      });
      setNewTaskTitle("");
      const tasks = await getPendingTasks();
      setPendingTasks(tasks);
    } catch (err: any) {
      console.error("Error adding quick task:", err);
      setError(err.message || "Error al añadir la tarea rápida. Verifique sus permisos.");
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await toggleTaskDone(taskId, currentStatus);
      const tasks = await getPendingTasks();
      setPendingTasks(tasks);
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  const completedPercentage = pendingTasks.length > 0 ? 0 : 100;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12 space-y-10">
      
      {/* Quick Task Entry */}
      <section className="w-full">
        {projects.length > 0 ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 border border-stone-bg focus-within:ring-2 focus-within:ring-sage-accent/20 transition-all">
            <div className="flex items-center gap-3">
              {addingTask ? (
                <Loader2 className="w-6 h-6 text-sage-accent animate-spin" />
              ) : (
                <Plus className="w-6 h-6 text-sage-accent" />
              )}
              <input 
                type="text" 
                id="quick-task-input" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Añadir una tarea rápida..." 
                className="bg-transparent border-none focus:ring-0 w-full text-base placeholder:text-outline-variant/70 outline-none"
                disabled={addingTask}
              />
              <button 
                onClick={handleAddTask}
                disabled={addingTask || !newTaskTitle.trim()}
                className="bg-petroleum-blue text-white px-5 py-2 rounded-lg text-xs font-semibold hover:shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0 tracking-wide disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-dashed border-outline-variant text-center">
            <p className="text-sm text-outline">Creá un proyecto primero desde la pestaña de Proyectos para poder añadir tareas.</p>
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-soft-terracotta/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-soft-terracotta flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-soft-terracotta">{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-[11px] font-semibold text-petroleum-blue hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reintentar
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bento Layout for Groups */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* Main Content Area: Hoy */}
        <section className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-petroleum-blue flex items-center gap-3 tracking-tight">
              <Calendar className="w-6 h-6 text-primary" />
              Tareas Pendientes
            </h2>
            <span className="text-[11px] font-semibold bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full tracking-wide">
              {pendingTasks.length} PENDIENTES
            </span>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-petroleum-blue animate-spin" />
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-dashed border-outline-variant text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-sage-accent mb-2" />
                <p className="text-sm text-on-surface-variant font-medium">¡Todo al día!</p>
                <p className="text-xs text-outline mt-1">No tenés tareas pendientes asignadas.</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <label 
                  key={task.id}
                  className={`group flex items-center justify-between bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:translate-x-1 border-l-4 ${PRIORITY_BORDER_COLORS[task.priority] || "border-outline"} cursor-pointer ring-1 ring-stone-bg/50`}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={task.status === "done"}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      className="w-5 h-5 rounded-full border-2 border-outline-variant text-sage-accent focus:ring-sage-accent transition-colors appearance-none checked:bg-sage-accent checked:border-sage-accent cursor-pointer flex-shrink-0" 
                    />
                    <div className="truncate pr-4">
                      <span className="text-base text-on-surface select-none font-medium truncate block">
                        {task.title}
                      </span>
                      {task.project_name && (
                        <span className="text-xs text-outline block mt-0.5 font-semibold uppercase tracking-wider">
                          {task.project_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority === "urgent" && (
                      <span className="text-[9px] font-bold bg-error-container text-on-error-container px-2 py-0.5 rounded uppercase tracking-wider">
                        Crítica
                      </span>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Area: Favoritos & Inbox */}
        <aside className="md:col-span-4 space-y-10">
          
          {/* Favoritos Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-petroleum-blue flex items-center gap-2">
              <Star className="w-5 h-5" />
              Proyectos
            </h2>
            <div className="bg-stone-bg/70 rounded-2xl p-4 space-y-1">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group">
                  <div className="w-2.5 h-2.5 rounded-full bg-petroleum-blue flex-shrink-0"></div>
                  <span className="text-sm text-on-surface-variant font-medium flex-1 group-hover:text-petroleum-blue transition-colors truncate">
                    {p.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-outline-variant opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-xs text-outline p-3 text-center">No hay proyectos activos.</p>
              )}
            </div>
          </section>

          {/* Inbox Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-petroleum-blue flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Inbox
            </h2>
            <div className="bg-surface-container-low rounded-2xl p-8 border border-dashed border-outline-variant/60 flex flex-col items-center justify-center text-center space-y-3">
              <Inbox className="w-8 h-8 text-outline-variant/60" strokeWidth={1.5} />
              <p className="text-[11px] uppercase tracking-widest font-semibold text-outline">Tu bandeja está limpia</p>
            </div>
          </section>

          {/* Stats Visual */}
          <div className="bg-petroleum-blue text-white rounded-2xl p-8 relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <p className="text-[11px] font-semibold text-primary-fixed opacity-80 uppercase tracking-[0.2em] mb-1">Productividad</p>
              <h3 className="text-3xl font-semibold mt-1 tracking-tight">
                {pendingTasks.length === 0 ? "100%" : "Al día"}
              </h3>
              <div className="w-full bg-white/20 h-2 rounded-full mt-6">
                <div 
                  className="bg-primary-fixed h-full rounded-full shadow-[0_0_10px_rgba(200,232,242,0.4)] transition-all duration-500" 
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.07] z-0">
               <ArrowUpRight className="w-40 h-40" strokeWidth={3} />
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
