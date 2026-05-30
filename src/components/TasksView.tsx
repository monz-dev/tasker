import { Calendar, ChevronRight, Inbox, Plus, Star,  ArrowUpRight } from "lucide-react";

export function TasksView() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12 space-y-10">
      
      {/* Quick Task Entry */}
      <section className="w-full">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 border border-stone-bg focus-within:ring-2 focus-within:ring-sage-accent/20 transition-all">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-sage-accent" />
            <input 
              type="text" 
              id="quick-task-input" 
              placeholder="Añadir una tarea rápida..." 
              className="bg-transparent border-none focus:ring-0 w-full text-base placeholder:text-outline-variant/70 outline-none"
            />
            <button className="bg-petroleum-blue text-white px-5 py-2 rounded-lg text-xs font-semibold hover:shadow-md transition-shadow active:scale-95 cursor-pointer flex-shrink-0 tracking-wide">
              Guardar
            </button>
          </div>
        </div>
      </section>

      {/* Bento Layout for Groups */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* Main Content Area: Hoy */}
        <section className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-petroleum-blue flex items-center gap-3 tracking-tight">
              <Calendar className="w-6 h-6 text-primary" />
              Hoy
            </h2>
            <span className="text-[11px] font-semibold bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full tracking-wide">4 PENDIENTES</span>
          </div>
          
          <div className="space-y-3">
            {/* Task List Item 1 */}
            <label className="group flex items-center justify-between bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:translate-x-1 border-l-4 border-sage-accent cursor-pointer ring-1 ring-stone-bg/50">
              <div className="flex items-center gap-5">
                <input type="checkbox" className="w-5 h-5 rounded-full border-2 border-sage-accent text-sage-accent focus:ring-sage-accent transition-colors appearance-none checked:bg-sage-accent checked:border-sage-accent" />
                <span className="text-base text-on-surface select-none font-medium group-has-[:checked]:line-through group-has-[:checked]:opacity-50">Revisar propuesta del cliente de Londres</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Star className="w-5 h-5 text-outline-variant hover:text-soft-terracotta transition-colors" />
              </div>
            </label>

            {/* Task List Item 2 */}
            <label className="group flex items-center justify-between bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:translate-x-1 border-l-4 border-petroleum-blue cursor-pointer ring-1 ring-stone-bg/50">
              <div className="flex items-center gap-5">
                <input type="checkbox" className="w-5 h-5 rounded-full border-2 border-petroleum-blue text-petroleum-blue focus:ring-petroleum-blue transition-colors appearance-none checked:bg-petroleum-blue checked:border-petroleum-blue" />
                <span className="text-base text-on-surface select-none font-medium group-has-[:checked]:line-through group-has-[:checked]:opacity-50">Llamada de seguimiento: Proyecto Sage</span>
              </div>
              <div className="flex items-center gap-2">
                 <Star className="w-5 h-5 text-dim-amber fill-dim-amber" />
              </div>
            </label>

            {/* Task List Item 3 */}
             <label className="group flex items-center justify-between bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:translate-x-1 border-l-4 border-soft-terracotta cursor-pointer ring-1 ring-stone-bg/50">
              <div className="flex items-center gap-5">
                <input type="checkbox" className="w-5 h-5 rounded-full border-2 border-soft-terracotta text-soft-terracotta focus:ring-soft-terracotta transition-colors appearance-none checked:bg-soft-terracotta checked:border-soft-terracotta" />
                <span className="text-base text-on-surface select-none font-medium group-has-[:checked]:line-through group-has-[:checked]:opacity-50">Finalizar reporte trimestral</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Star className="w-5 h-5 text-outline-variant hover:text-soft-terracotta transition-colors" />
              </div>
            </label>
          </div>
        </section>

        {/* Sidebar Area: Favoritos & Inbox */}
        <aside className="md:col-span-4 space-y-10">
          
          {/* Favoritos Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-petroleum-blue flex items-center gap-2">
              <Star className="w-5 h-5" />
              Favoritos
            </h2>
            <div className="bg-stone-bg/70 rounded-2xl p-4 space-y-1">
              
              <div className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group">
                <div className="w-2.5 h-2.5 rounded-full bg-soft-terracotta flex-shrink-0"></div>
                <span className="text-sm text-on-surface-variant font-medium flex-1 group-hover:text-petroleum-blue transition-colors">Estrategia 2024</span>
                <ChevronRight className="w-4 h-4 text-outline-variant opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>

              <div className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group">
                <div className="w-2.5 h-2.5 rounded-full bg-sage-accent flex-shrink-0"></div>
                <span className="text-sm text-on-surface-variant font-medium flex-1 group-hover:text-petroleum-blue transition-colors">Diseño UI/UX</span>
                <ChevronRight className="w-4 h-4 text-outline-variant opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>

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
              <button className="text-[12px] font-semibold text-sage-accent hover:underline decoration-sage-accent/30 underline-offset-4">Ver archivados</button>
            </div>
          </section>

          {/* Stats Visual */}
          <div className="bg-petroleum-blue text-white rounded-2xl p-8 relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <p className="text-[11px] font-semibold text-primary-fixed opacity-80 uppercase tracking-[0.2em] mb-1">Productividad</p>
              <h3 className="text-3xl font-semibold mt-1 tracking-tight">85% completado</h3>
              <div className="w-full bg-white/20 h-2 rounded-full mt-6">
                <div className="bg-primary-fixed w-[85%] h-full rounded-full shadow-[0_0_10px_rgba(200,232,242,0.4)]"></div>
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
