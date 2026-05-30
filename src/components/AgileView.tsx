import { ChevronDown, Flag, MoreVertical, Plus } from "lucide-react";

export function AgileView() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-petroleum-blue mb-2 tracking-tight">Sprints & Backlog</h2>
          <p className="text-sm text-on-surface-variant">Planifica, prioriza y entrega valor de forma continua.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-stone-bg text-petroleum-blue font-semibold text-sm rounded-lg hover:bg-stone-bg/80 transition-colors">
            Crear Sprint
          </button>
          <button className="px-4 py-2 bg-petroleum-blue text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Historia
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Active Sprint Section */}
        <section className="w-full lg:w-2/3">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-stone-bg/50 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-stone-bg flex items-center justify-between bg-warm-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                   <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary leading-tight">Sprint 42: Checkout Redesign</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">12 Oct - 26 Oct • 14 days left</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex text-xs font-semibold text-outline-variant items-center gap-2">
                   <span className="text-sage-accent">12 pts hechos</span>
                   <span>/ 34 total</span>
                 </div>
                 <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-bg transition-colors">
                   <ChevronDown className="w-5 h-5 text-outline" />
                 </button>
              </div>
            </div>

            {/* Sprint Items */}
            <div className="divide-y divide-stone-bg">
              <StoryItem 
                title="Integrar pasarela de pago Stripe" 
                id="ENG-102"
                points={8}
                status="in_progress"
              />
              <StoryItem 
                title="Rediseñar modales de confirmación" 
                id="DES-45"
                points={3}
                status="done"
              />
              <StoryItem 
                title="Actualizar validaciones del carrito" 
                id="ENG-105"
                points={5}
                status="todo"
              />
            </div>
            
            <div className="p-3 bg-stone-bg/30 text-center">
               <button className="text-xs font-semibold text-petroleum-blue hover:underline">Ver tablero Kanban del Sprint</button>
            </div>
          </div>
        </section>

        {/* Backlog Sidebar */}
        <section className="w-full lg:w-1/3">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-stone-bg/50 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-5 border-b border-stone-bg bg-warm-white sticky top-0">
               <h3 className="text-base font-semibold text-primary">Product Backlog</h3>
               <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-1">12 issues</p>
            </div>
            <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
               <BacklogItem title="Implementar Dark Mode" id="DES-50" points={5} />
               <BacklogItem title="Refactor de estado global a Zustand" id="ENG-120" points={13} />
               <BacklogItem title="Animaciones para transición de página" id="DES-52" points={3} />
               <BacklogItem title="Optimizar consultas SQL en Dashboard" id="ENG-122" points={8} />
               <BacklogItem title="Soporte para múltiples idiomas" id="ENG-140" points={21} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StoryItem({ title, id, points, status }: { title: string, id: string, points: number, status: 'todo'|'in_progress'|'done' }) {
  const statusColors = {
    todo: 'bg-surface-variant text-on-surface-variant',
    in_progress: 'bg-primary-fixed text-on-primary-fixed',
    done: 'bg-secondary-container text-on-secondary-container'
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done'
  };

  return (
    <div className="p-4 flex items-center justify-between hover:bg-stone-bg/40 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
         <div className={`w-2 h-2 rounded-full ${status === 'done' ? 'bg-sage-accent' : status === 'in_progress' ? 'bg-petroleum-blue' : 'bg-outline-variant'}`}></div>
         <div>
           <p className={`text-sm font-medium ${status === 'done' ? 'text-on-surface-variant line-through' : 'text-primary'}`}>{title}</p>
           <p className="text-xs text-outline font-mono mt-0.5">{id}</p>
         </div>
      </div>
      <div className="flex items-center gap-4">
         <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${statusColors[status]}`}>
            {statusLabels[status]}
         </span>
         <div className="w-6 h-6 rounded-full bg-stone-bg flex items-center justify-center text-[10px] font-bold text-petroleum-blue border border-outline-variant/20">
           {points}
         </div>
         <button className="text-outline-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-petroleum-blue">
           <MoreVertical className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

function BacklogItem({ title, id, points }: { title: string, id: string, points: number }) {
  return (
    <div className="p-3 bg-warm-white hover:bg-stone-bg rounded-lg border border-transparent hover:border-stone-bg/80 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between group">
       <div className="truncate pr-3">
          <p className="text-sm font-medium text-primary truncate">{title}</p>
          <p className="text-[10px] text-outline font-mono mt-1">{id}</p>
       </div>
       <div className="w-6 h-6 flex-shrink-0 rounded-full bg-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-surface-variant border border-outline-variant/20 group-hover:bg-white transition-colors">
         {points}
       </div>
    </div>
  );
}
