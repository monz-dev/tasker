'use client';

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Clock, MessageSquare, MoreVertical, PlusCircle, AlertCircle, X, Loader2, ArrowRight, ArrowLeft, Plus, Calendar, Trash2 } from "lucide-react";
import { getActiveProjects } from "@/services/projectService";
import { getTasksByProject, createTask, updateTaskStatus, softDeleteTask } from "@/services/taskService";
import type { ProjectWithMembers, Task } from "@/types/models";

const COLUMNS = [
  { id: "todo" as const, label: "Por Hacer", color: "bg-soft-terracotta" },
  { id: "in_progress" as const, label: "En Progreso", color: "bg-petroleum-blue" },
  { id: "review" as const, label: "En Revisión", color: "bg-dim-amber" },
  { id: "done" as const, label: "Hecho", color: "bg-sage-accent" },
];

const PRIORITY_COLORS = {
  low: "bg-secondary-container text-on-secondary-container",
  medium: "bg-primary-fixed text-on-primary-fixed",
  high: "bg-error-container text-on-error-container",
  urgent: "bg-soft-terracotta text-white",
};

const PRIORITY_LABELS = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Crítica",
};

const withTimeout = <T extends unknown>(promise: Promise<T>, ms = 6000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("La base de datos tardó demasiado en responder (Tiempo de espera agotado).")), ms)
    )
  ]);
};

export function KanbanView() {
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals and menus
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Task["status"]>("todo");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // New task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch projects initially
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projs = await getActiveProjects();
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    } catch (err) {
      console.error("Error fetching projects for Kanban:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Fetch tasks when selected project changes
  const loadTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoadingTasks(true);
    try {
      const ts = await getTasksByProject(selectedProjectId);
      setTasks(ts);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await withTimeout(createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        project_id: selectedProjectId,
        priority,
        status: defaultStatus,
        due_date: dueDate || undefined,
      }), 6000);

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setShowCreateModal(false);

      // Reload
      await withTimeout(loadTasks(), 5000);
    } catch (err: any) {
      console.error("Error creating task:", err);
      setFormError(err.message || "Error al crear la tarea. Verifique sus permisos.");
    } finally {
      setSubmitting(false);
    }
  };

  // Move task to next or previous status
  const handleMoveStatus = async (taskId: string, currentStatus: Task["status"], direction: "next" | "prev") => {
    const statuses: Task["status"][] = ["todo", "in_progress", "review", "done"];
    const currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const nextStatus = statuses[nextIndex];
      try {
        await updateTaskStatus(taskId, nextStatus);
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
      } catch (err) {
        console.error("Error moving task:", err);
      }
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta tarea?")) return;
    try {
      await softDeleteTask(taskId);
      setActiveMenuId(null);
      await loadTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Open task modal for a specific column
  const openCreateModalForColumn = (status: Task["status"]) => {
    setFormError(null);
    setDefaultStatus(status);
    setShowCreateModal(true);
  };

  // Group tasks by status
  const groupedTasks = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<Task["status"], Task[]>);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="pt-6 pb-24 md:pb-12 min-h-screen flex flex-col">
      {/* Dashboard Header & Selector */}
      <div className="px-4 md:px-8 mb-6 max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-petroleum-blue mb-1 tracking-tight">Tablero de Proyectos</h2>
          <p className="text-sm text-on-surface-variant">Gestiona tus tareas con calma y precisión.</p>
        </div>

        {/* Project Selector */}
        {!loading && projects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Proyecto:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-4 py-2 bg-surface-container-lowest border border-stone-bg rounded-xl text-sm font-semibold text-petroleum-blue focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none cursor-pointer transition-all"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Kanban Section */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-petroleum-blue animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-outline mb-4" />
          <h3 className="text-lg font-bold text-petroleum-blue mb-1">Sin proyectos activos</h3>
          <p className="text-sm text-on-surface-variant mb-6">Primero tenés que crear un proyecto en la pestaña de Proyectos para poder gestionar sus tareas.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto gap-4 px-4 md:px-8 no-scrollbar snap-x snap-mandatory flex w-full max-w-[1200px] mx-auto pb-8 items-start h-[calc(100vh-200px)]">
          {COLUMNS.map((col) => {
            const columnTasks = groupedTasks[col.id] || [];
            
            return (
              <section key={col.id} className="min-w-[85vw] md:min-w-[280px] max-w-[280px] flex flex-col snap-center h-full flex-shrink-0">
                {/* Column Title */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-base font-bold text-petroleum-blue flex items-center gap-2">
                    {col.label}
                    <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] font-medium text-on-surface-variant">
                      {loadingTasks ? "..." : columnTasks.length}
                    </span>
                  </h3>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCreateModalForColumn(col.id); }}
                    className="text-outline hover:text-petroleum-blue transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Column Body / Scroll Container */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4 h-[calc(100%-48px)]">
                  {loadingTasks ? (
                    <div className="bg-surface-container-lowest p-5 rounded-xl border border-stone-bg/50 animate-pulse space-y-3">
                      <div className="h-4 bg-stone-bg rounded w-1/4" />
                      <div className="h-6 bg-stone-bg rounded w-3/4" />
                      <div className="h-4 bg-stone-bg rounded w-1/2" />
                    </div>
                  ) : columnTasks.length === 0 ? (
                    <div className="border border-dashed border-outline-variant/60 rounded-xl py-12 px-4 text-center flex flex-col items-center justify-center">
                      <p className="text-xs text-outline font-medium">Sin tareas</p>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCreateModalForColumn(col.id); }}
                        className="text-[10px] font-semibold text-petroleum-blue hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Añadir una
                      </button>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const isDone = task.status === "done";
                      return (
                        <div 
                          key={task.id} 
                          className={`bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-visible group border border-stone-bg/50 hover:shadow-md transition-all duration-200 ${isDone ? "opacity-75 bg-stone-bg/30" : ""}`}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${col.color}`}></div>
                          
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-3 relative">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase ${PRIORITY_COLORS[task.priority]}`}>
                              {PRIORITY_LABELS[task.priority]}
                            </span>
                            
                            <div className="relative">
                              <button 
                                onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                                className="text-outline-variant hover:text-primary p-0.5 rounded-full hover:bg-stone-bg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* Task menu */}
                              {activeMenuId === task.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                  <div className="absolute right-0 mt-2 w-40 bg-surface-container-lowest rounded-xl shadow-xl border border-stone-bg py-1.5 z-50 animate-in fade-in duration-100">
                                    <button 
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="w-full text-left px-4 py-2 text-xs text-soft-terracotta hover:bg-error-container/20 transition-colors flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Eliminar tarea
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Title & Description */}
                          <h4 className={`text-[15px] font-semibold text-primary mb-2 leading-snug ${isDone ? "line-through text-outline" : ""}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`text-xs mb-4 text-on-surface-variant leading-relaxed line-clamp-2 ${isDone ? "line-through text-outline/80" : ""}`}>
                              {task.description}
                            </p>
                          )}

                          {/* Card Footer */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-bg/60">
                            {/* Move task quick actions */}
                            <div className="flex gap-1.5">
                              {task.status !== "todo" && (
                                <button 
                                  onClick={() => handleMoveStatus(task.id, task.status, "prev")}
                                  className="p-1 rounded-md bg-stone-bg/60 text-outline hover:text-primary hover:bg-stone-bg transition-all cursor-pointer"
                                  title="Mover a columna anterior"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {task.status !== "done" && (
                                <button 
                                  onClick={() => handleMoveStatus(task.id, task.status, "next")}
                                  className="p-1 rounded-md bg-stone-bg/60 text-outline hover:text-primary hover:bg-stone-bg transition-all cursor-pointer"
                                  title="Mover a columna siguiente"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Due Date Indicator */}
                            {task.due_date ? (
                              <div className="flex items-center gap-1 text-outline text-[10px] font-semibold">
                                <Clock className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                              </div>
                            ) : (
                              <div className="text-[10px] text-outline-variant font-medium">Sin fecha</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (Quick add task) */}
      {!loading && projects.length > 0 && (
        <button 
          onClick={() => openCreateModalForColumn("todo")}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-petroleum-blue text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-200 z-40 group cursor-pointer"
        >
          <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Premium Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-stone-bg max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-stone-bg/50 border-b border-stone-bg flex justify-between items-center">
              <h3 className="text-lg font-bold text-petroleum-blue">Nueva Tarea</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-outline hover:text-primary p-1 rounded-full hover:bg-stone-bg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-soft-terracotta text-xs rounded-xl flex items-center gap-2 border border-soft-terracotta/20 animate-in fade-in duration-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Título de la tarea <span className="text-soft-terracotta">*</span>
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Rediseñar menú de navegación" 
                  className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Descripción
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre lo que se debe hacer..." 
                  rows={3}
                  className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Prioridad
                  </label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task["priority"])}
                    className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface cursor-pointer"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Fecha límite
                  </label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Columna inicial
                </label>
                <select 
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value as Task["status"])}
                  className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface cursor-pointer"
                >
                  <option value="todo">Por Hacer</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="review">En Revisión</option>
                  <option value="done">Hecho</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-bg">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-stone-bg text-on-surface-variant hover:bg-stone-bg/80 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !title.trim()}
                  className="px-4 py-2.5 bg-petroleum-blue text-white hover:bg-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
