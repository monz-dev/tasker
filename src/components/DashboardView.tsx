import { MessageCircle, CheckCircle2, Upload, Target } from "lucide-react";

export function DashboardView() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 mb-24 md:mb-12">
      {/* Welcome Header */}
      <section className="mb-8 pl-1">
        <h2 className="text-[32px] leading-tight font-semibold text-primary mb-1 tracking-tight">Hola, Equipo</h2>
        <p className="text-base text-on-surface-variant">Aquí tienes el resumen de hoy para tus proyectos.</p>
      </section>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Active Projects Summary */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm ring-1 ring-stone-bg/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-petroleum-blue">Proyectos Activos</h3>
            <button className="text-xs font-semibold text-sage-accent hover:underline">Ver todos</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Card 1 */}
            <div className="relative p-4 rounded-lg bg-warm-white group hover:shadow-md transition-shadow duration-300">
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-sage-accent rounded-r"></div>
              <div className="pl-3">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Diseño UI/UX</span>
                <h4 className="text-lg font-semibold mt-1 mb-3 text-petroleum-blue">Rediseño Nexus</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-grow bg-stone-bg h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sage-accent h-full w-[75%] rounded-full"></div>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">75%</span>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-secondary-container"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-primary-container"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-surface-dim"></div>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="relative p-4 rounded-lg bg-warm-white group hover:shadow-md transition-shadow duration-300">
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-soft-terracotta rounded-r"></div>
              <div className="pl-3">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Desarrollo</span>
                <h4 className="text-lg font-semibold mt-1 mb-3 text-petroleum-blue">API Integración</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-grow bg-stone-bg h-1.5 rounded-full overflow-hidden">
                    <div className="bg-soft-terracotta h-full w-[40%] rounded-full"></div>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">40%</span>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-tertiary-fixed-dim"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-primary-container"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Mini-Widget */}
        <div className="col-span-12 md:col-span-4 bg-petroleum-blue rounded-xl p-6 text-white shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div>
            <h3 className="text-xs font-semibold text-primary-fixed mb-4 uppercase tracking-widest opacity-90">Métricas Semanales</h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-semibold leading-none tracking-tighter">12</span>
              <span className="text-sm opacity-80 mb-1">Tasks completadas</span>
            </div>
          </div>
          
          {/* Custom Mini Bar Chart Visualization */}
          <div className="mt-8 flex gap-1 items-end h-12 w-full">
            <div className="bg-sage-accent/40 w-full h-[40%] rounded-t-sm"></div>
            <div className="bg-sage-accent/60 w-full h-[60%] rounded-t-sm"></div>
            <div className="bg-sage-accent/30 w-full h-[30%] rounded-t-sm"></div>
            <div className="bg-sage-accent w-full h-[80%] rounded-t-sm"></div>
            <div className="bg-sage-accent/50 w-full h-[50%] rounded-t-sm"></div>
            <div className="bg-white w-full h-[100%] rounded-t-sm shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
            <div className="bg-sage-accent/70 w-full h-[70%] rounded-t-sm"></div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm ring-1 ring-stone-bg/50">
          <h3 className="text-lg font-semibold text-petroleum-blue mb-4">Tareas Pendientes</h3>
          <div className="space-y-2">
            
            <div className="flex items-center gap-3 p-3 hover:bg-stone-bg transition-colors rounded-lg group cursor-pointer">
              <Target className="w-5 h-5 text-outline group-hover:text-petroleum-blue" />
              <div className="flex-grow">
                <p className="text-sm text-primary font-medium">Revisar feedback del cliente</p>
                <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">Hoy, 14:00</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 hover:bg-stone-bg transition-colors rounded-lg group cursor-pointer">
              <Target className="w-5 h-5 text-outline group-hover:text-petroleum-blue" />
              <div className="flex-grow">
                <p className="text-sm text-primary font-medium">Subir prototipos a Figma</p>
                <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">Mañana</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 hover:bg-stone-bg transition-colors rounded-lg group cursor-pointer">
               <Target className="w-5 h-5 text-outline group-hover:text-petroleum-blue" />
              <div className="flex-grow">
                <p className="text-sm text-primary font-medium">Sprint planning Q3</p>
                <p className="text-[11px] font-medium text-soft-terracotta mt-0.5">Atrasado</p>
              </div>
            </div>

          </div>
          <button className="w-full mt-5 py-2.5 border border-dashed border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-stone-bg transition-all hover:text-petroleum-blue">
            + Añadir tarea
          </button>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 md:col-span-6 lg:col-span-8 bg-stone-bg/40 rounded-xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-stone-bg">
          <h3 className="text-lg font-semibold text-petroleum-blue mb-6">Actividad Reciente</h3>
          
          <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 relative">
            
            {/* Activity Item 1 */}
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container z-10 relative">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/40"></div>
              </div>
              <div className="pb-4">
                <p className="text-sm text-primary"><span className="font-semibold">Elena Marín</span> comentó en <span className="text-petroleum-blue font-medium">Layout v2</span></p>
                <p className="text-xs text-on-surface-variant mt-1.5">Hace 15 minutos</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white z-10 relative">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/40"></div>
              </div>
              <div className="pb-4">
                <p className="text-sm text-primary"><span className="font-semibold">Carlos Ruiz</span> completó la tarea <span className="text-petroleum-blue font-medium">Setup Database</span></p>
                <p className="text-xs text-on-surface-variant mt-1.5">Hace 2 horas</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant z-10 relative">
                  <Upload className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-sm text-primary"><span className="font-semibold">Marta Gil</span> subió 4 archivos a <span className="text-petroleum-blue font-medium">Assets Proyecto</span></p>
                <p className="text-xs text-on-surface-variant mt-1.5">Ayer, 18:45</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
