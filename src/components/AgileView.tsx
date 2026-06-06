'use client';

import { useEffect, useState } from "react";
import { ChevronDown, Flag, MoreVertical, Plus, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getSprintsByProject, createSprint } from "@/services/sprintService";
import { getActiveProjects } from "@/services/projectService";
import { getTasksByProject, createTask, updateTaskSprint as dbUpdateTaskSprint } from "@/services/taskService";
import { Task, ProjectWithMembers } from "@/types/models";

export function AgileView() {
  const { sprints, tasks, setSprints, setTasks, addSprint, addTask, updateTaskSprint } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const projs = await getActiveProjects();
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      }
      setLoading(false);
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadProjectData() {
      if (selectedProjectId) {
        try {
          const [ts, sps] = await Promise.all([
            getTasksByProject(selectedProjectId),
            getSprintsByProject(selectedProjectId)
          ]);
          setTasks(ts);
          setSprints(sps);
        } catch (err) {
          console.error("Error loading project data:", err);
        }
      } else {
        setTasks([]);
        setSprints([]);
      }
    }
    loadProjectData();
  }, [selectedProjectId, setTasks, setSprints]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-petroleum-blue animate-spin" />
      </div>
    );
  }

  const activeSprint = sprints.find(s => s.status === 'active');
  const sprintTasks = activeSprint ? tasks.filter(t => t.sprint_id === activeSprint.id) : [];
  const backlogTasks = tasks.filter(t => !t.sprint_id);

  const donePoints = sprintTasks.filter(t => t.status === 'done').reduce((acc, t) => acc + (t.story_points || 0), 0);
  const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.story_points || 0), 0);

  const handleCreateSprint = async () => {
    if (!selectedProjectId) {
      alert("Selecciona un proyecto primero.");
      return;
    }
    const name = window.prompt("Nombre del nuevo sprint:");
    if (!name) return;
    
    try {
      const newSprint = await createSprint({
        name,
        project_id: selectedProjectId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: sprints.some(s => s.status === 'active') ? 'planned' : 'active'
      });
      addSprint(newSprint);
    } catch (err) {
      console.error("Error creating sprint:", err);
      alert("Hubo un error al crear el sprint.");
    }
  };

  const handleNewStory = async () => {
    if (!selectedProjectId) {
      alert("Selecciona un proyecto primero.");
      return;
    }
    const title = window.prompt("Título de la nueva historia:");
    if (!title) return;
    const pointsStr = window.prompt("Puntos de historia (opcional):", "3");
    const points = pointsStr ? parseInt(pointsStr, 10) : 3;
    
    try {
      const newTask = await createTask({
        title,
        project_id: selectedProjectId,
        status: 'todo',
        priority: 'medium',
        story_points: isNaN(points) ? 3 : points,
      });
      addTask(newTask);
    } catch (err) {
      console.error("Error creating story:", err);
      alert("Hubo un error al crear la historia.");
    }
  };

  const handleMoveToSprint = async (taskId: string) => {
    if (activeSprint) {
      try {
        await dbUpdateTaskSprint(taskId, activeSprint.id);
        updateTaskSprint(taskId, activeSprint.id);
      } catch (err) {
        console.error("Error moving task:", err);
        alert("Hubo un error al mover la historia al sprint.");
      }
    } else {
      alert("No hay un sprint activo.");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-petroleum-blue mb-2 tracking-tight">Sprints & Backlog</h2>
          <p className="text-sm text-on-surface-variant">Planifica, prioriza y entrega valor de forma continua.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {projects.length > 0 && (
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
          <div className="flex gap-3">
            <button onClick={handleCreateSprint} className="px-4 py-2 bg-stone-bg text-petroleum-blue font-semibold text-sm rounded-lg hover:bg-stone-bg/80 transition-colors">
              Crear Sprint
            </button>
            <button onClick={handleNewStory} className="px-4 py-2 bg-petroleum-blue text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva Historia
            </button>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center border border-dashed border-outline-variant/60 rounded-xl mt-12">
          <AlertCircle className="w-12 h-12 text-outline mb-4" />
          <h3 className="text-lg font-bold text-petroleum-blue mb-1">Sin proyectos activos</h3>
          <p className="text-sm text-on-surface-variant mb-6">Primero tenés que crear un proyecto para poder gestionar sus sprints.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Active Sprint Section */}
          <section className="w-full lg:w-2/3">
            {activeSprint ? (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-stone-bg/50 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-stone-bg flex items-center justify-between bg-warm-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                       <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary leading-tight">{activeSprint.name}</h3>
                      <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                        {new Date(activeSprint.start_date).toLocaleDateString()} - {new Date(activeSprint.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden sm:flex text-xs font-semibold text-outline-variant items-center gap-2">
                       <span className="text-sage-accent">{donePoints} pts hechos</span>
                       <span>/ {totalPoints} total</span>
                     </div>
                     <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-bg transition-colors">
                       <ChevronDown className="w-5 h-5 text-outline" />
                     </button>
                  </div>
                </div>

                {/* Sprint Items */}
                <div className="divide-y divide-stone-bg">
                  {sprintTasks.map(task => (
                    <StoryItem key={task.id} task={task} />
                  ))}
                  {sprintTasks.length === 0 && (
                    <div className="p-8 text-center text-on-surface-variant text-sm">
                      No hay tareas en este sprint. Mueve algunas desde el backlog.
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-stone-bg/30 text-center">
                   <button className="text-xs font-semibold text-petroleum-blue hover:underline">Ver tablero Kanban del Sprint</button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-stone-bg/50 overflow-hidden p-8 text-center text-on-surface-variant">
                No hay un sprint activo. ¡Crea uno para empezar a planificar!
              </div>
            )}
          </section>

          {/* Backlog Sidebar */}
          <section className="w-full lg:w-1/3">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-stone-bg/50 overflow-hidden flex flex-col max-h-[600px]">
              <div className="p-5 border-b border-stone-bg bg-warm-white sticky top-0">
                 <h3 className="text-base font-semibold text-primary">Product Backlog</h3>
                 <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-1">{backlogTasks.length} issues</p>
              </div>
              <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                 {backlogTasks.map(task => (
                   <BacklogItem key={task.id} task={task} onMove={() => handleMoveToSprint(task.id)} />
                 ))}
                 {backlogTasks.length === 0 && (
                   <div className="p-4 text-center text-sm text-on-surface-variant">
                     El backlog está vacío.
                   </div>
                 )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StoryItem({ task }: { task: Task }) {
  const statusColors = {
    todo: 'bg-surface-variant text-on-surface-variant',
    in_progress: 'bg-primary-fixed text-on-primary-fixed',
    review: 'bg-primary-fixed text-on-primary-fixed',
    done: 'bg-secondary-container text-on-secondary-container'
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done'
  };

  const status = task.status;

  return (
    <div className="p-4 flex items-center justify-between hover:bg-stone-bg/40 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
         <div className={`w-2 h-2 rounded-full ${status === 'done' ? 'bg-sage-accent' : status === 'in_progress' ? 'bg-petroleum-blue' : 'bg-outline-variant'}`}></div>
         <div>
           <p className={`text-sm font-medium ${status === 'done' ? 'text-on-surface-variant line-through' : 'text-primary'}`}>{task.title}</p>
           <p className="text-xs text-outline font-mono mt-0.5">{task.id.slice(0, 8)}</p>
         </div>
      </div>
      <div className="flex items-center gap-4">
         <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${statusColors[status]}`}>
            {statusLabels[status]}
         </span>
         <div className="w-6 h-6 rounded-full bg-stone-bg flex items-center justify-center text-[10px] font-bold text-petroleum-blue border border-outline-variant/20">
           {task.story_points || 0}
         </div>
         <button className="text-outline-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-petroleum-blue">
           <MoreVertical className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

function BacklogItem({ task, onMove }: { task: Task, onMove: () => void }) {
  return (
    <div className="p-3 bg-warm-white hover:bg-stone-bg rounded-lg border border-transparent hover:border-stone-bg/80 transition-all group flex items-center justify-between">
       <div className="truncate pr-3 cursor-grab active:cursor-grabbing">
          <p className="text-sm font-medium text-primary truncate">{task.title}</p>
          <p className="text-[10px] text-outline font-mono mt-1">{task.id.slice(0, 8)}</p>
       </div>
       <div className="flex items-center gap-2">
         <button onClick={onMove} className="opacity-0 group-hover:opacity-100 p-1 text-petroleum-blue hover:bg-stone-bg rounded transition-all" title="Mover al Sprint Activo">
           <ArrowLeft className="w-4 h-4" />
         </button>
         <div className="w-6 h-6 flex-shrink-0 rounded-full bg-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-surface-variant border border-outline-variant/20 group-hover:bg-white transition-colors">
           {task.story_points || 0}
         </div>
       </div>
    </div>
  );
}
