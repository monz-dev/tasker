import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Calendar, Loader2, AlertCircle, Clock } from "lucide-react";
import { getActiveProjects } from "../services/projectService";
import { getTasksByProject } from "../services/taskService";
import type { ProjectWithMembers, Task } from "../types/models";

const STATUS_COLORS = {
  todo: "bg-soft-terracotta/90",
  in_progress: "bg-petroleum-blue/90",
  review: "bg-dim-amber/90",
  done: "bg-sage-accent/90",
};

const STATUS_LABELS = {
  todo: "Por Hacer",
  in_progress: "En Progreso",
  review: "En Revisión",
  done: "Completada",
};

// Helper: calculate difference in days
function getDaysDiff(date1: Date, date2: Date) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper: format date to YYYY-MM-DD safely
function formatDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TimelineView() {
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Load active projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projs = await getActiveProjects();
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    } catch (err) {
      console.error("Error loading projects for timeline:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load tasks for selected project
  const loadTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoadingTasks(true);
    try {
      const ts = await getTasksByProject(selectedProjectId);
      setTasks(ts);
    } catch (err) {
      console.error("Error loading tasks for timeline:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks that have due_date
  const timelineTasks = useMemo(() => {
    return tasks.filter(t => t.due_date);
  }, [tasks]);

  // Generate dynamic date range
  const { days, rangeStart, monthLabel } = useMemo(() => {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
    let end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 11);

    if (timelineTasks.length > 0) {
      const dates = timelineTasks.map(t => new Date(t.due_date!));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

      start = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() - 3);
      end = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate() + 4);
    }

    const totalDays = getDaysDiff(start, end) + 1;
    const daysArr: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      daysArr.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }

    // Format current month / year label
    const middleDay = daysArr[Math.floor(daysArr.length / 2)] || today;
    const label = middleDay.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

    return {
      days: daysArr,
      rangeStart: start,
      monthLabel: formattedLabel,
    };
  }, [timelineTasks]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Each day column width is 56px
  const dayColWidth = 56;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden pb-24 md:pb-0 bg-warm-white text-on-surface">
      {/* Timeline Controls */}
      <div className="px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-warm-white z-20 relative border-b border-stone-bg/50">
        <div className="flex items-center space-x-3">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-petroleum-blue">
            {loadingTasks ? "Cargando..." : monthLabel}
          </span>
        </div>

        {/* Project selector */}
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

      {/* Gantt Chart Container */}
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-petroleum-blue animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-outline mb-4" />
          <h3 className="text-lg font-bold text-petroleum-blue mb-1">Sin proyectos activos</h3>
          <p className="text-sm text-on-surface-variant">Crea primero un proyecto para ver su línea de tiempo.</p>
        </div>
      ) : timelineTasks.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
          <Clock className="w-12 h-12 text-outline-variant mb-4" />
          <h3 className="text-lg font-bold text-petroleum-blue mb-1">Sin fechas límites</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            Para ver la línea de tiempo, asigna fechas límite a las tareas del proyecto "{selectedProject?.name}" en el Tablero Kanban.
          </p>
        </div>
      ) : (
        <div className="flex-grow flex overflow-hidden relative">
          
          {/* Left Fixed Column (Tasks) */}
          <div className="w-[140px] md:w-[240px] flex-shrink-0 bg-warm-white z-20 border-r border-stone-bg shadow-[2px_0_4px_rgba(0,0,0,0.02)] flex flex-col">
            <div className="h-12 border-b border-stone-bg flex items-center px-4 md:px-6">
              <span className="text-xs tracking-wider font-semibold text-outline uppercase">Tareas</span>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
              {timelineTasks.map((task) => (
                <div key={task.id} className="px-4 md:px-6 h-10 flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 hidden md:block flex-shrink-0 bg-petroleum-blue`}></div>
                  <span className="truncate text-sm font-medium text-primary" title={task.title}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Scrollable Timeline (Gantt area) */}
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative gantt-bg-pattern bg-warm-white">
            <div className="relative h-full" style={{ width: `${days.length * dayColWidth}px` }}>
              
              {/* Days Header */}
              <div className="h-12 border-b border-stone-bg flex absolute top-0 left-0 right-0 bg-warm-white/95 backdrop-blur-sm z-10 sticky-header">
                {days.map((day, idx) => {
                  const isToday = getDaysDiff(new Date(), day) === 0;
                  return (
                    <div 
                      key={idx} 
                      style={{ width: `${dayColWidth}px` }}
                      className={`flex-shrink-0 flex flex-col items-center justify-center text-[10px] border-r border-stone-bg/30 font-semibold ${
                        isToday ? "text-petroleum-blue bg-primary-fixed/20 font-bold" : "text-outline"
                      }`}
                    >
                      <span>{day.toLocaleDateString("es-ES", { weekday: "narrow" })}</span>
                      <span className="text-xs mt-0.5">{day.getDate()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Today's Vertical Line */}
              {days.map((day, idx) => {
                const isToday = getDaysDiff(new Date(), day) === 0;
                if (!isToday) return null;
                return (
                  <div 
                    key={idx}
                    className="absolute top-12 bottom-0 w-px bg-petroleum-blue/30 z-10 pointer-events-none"
                    style={{ left: `${idx * dayColWidth + (dayColWidth / 2)}px` }}
                  />
                );
              })}

              {/* Gantt Task Rows */}
              <div className="pt-18 pb-8 space-y-6 relative z-0">
                {timelineTasks.map((task) => {
                  const taskDueDate = new Date(task.due_date!);
                  
                  // Let's assume a dynamic task duration of 3 days
                  const durationDays = 3;
                  const taskStartDate = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate() - (durationDays - 1));

                  // Calculate start offset in pixels
                  const startOffsetDays = getDaysDiff(rangeStart, taskStartDate);
                  const leftPx = startOffsetDays * dayColWidth + 6;
                  const widthPx = durationDays * dayColWidth - 12;

                  return (
                    <div key={task.id} className="h-10 relative">
                      <div 
                        className={`absolute h-9 top-0.5 ${STATUS_COLORS[task.status] || "bg-outline"} rounded-[6px] shadow-sm flex items-center px-3 cursor-pointer hover:brightness-95 hover:shadow transition-all group overflow-hidden`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`${task.title} (Límite: ${taskDueDate.toLocaleDateString("es-ES")}) - ${STATUS_LABELS[task.status]}`}
                      >
                        <span className="text-[11px] font-semibold tracking-wide text-white truncate relative z-10 w-full text-center">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
