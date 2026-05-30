import { ArrowUpRight, BarChart2, TrendingUp, Users } from "lucide-react";

export function ReportsView() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-petroleum-blue mb-2 tracking-tight">Reportes de Equipo</h2>
        <p className="text-sm text-on-surface-variant">Analiza la velocidad, eficiencia y puntos bloqueantes.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Velocity Promedio" value="48 pts" trend="+12%" icon={<TrendingUp />} />
        <KPICard title="Tiempo de Ciclo" value="3.2 días" trend="-0.5 días" isGood icon={<BarChart2 />} />
        <KPICard title="Tareas Completadas" value="124" trend="+8%" icon={<CheckItem />} />
        <KPICard title="Carga de Equipo" value="85%" trend="Estable" neutral icon={<Users />} />
      </div>

      {/* Charts / Data visualization area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Burnup/Velocity Chart Mock */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm ring-1 ring-stone-bg/50">
          <h3 className="text-base font-semibold text-petroleum-blue mb-6">Velocidad del Equipo (Últimos 5 Sprints)</h3>
          
          <div className="h-64 flex items-end justify-between gap-2 border-b border-stone-bg pb-4">
             {/* Mock bars */}
             <ChartBar value={34} label="Sprint 38" />
             <ChartBar value={42} label="Sprint 39" />
             <ChartBar value={38} label="Sprint 40" />
             <ChartBar value={50} label="Sprint 41" />
             <ChartBar value={48} label="Sprint 42" active />
          </div>
        </div>

        {/* Breakdown by Category */}
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-stone-bg/50 flex flex-col justify-between">
           <div>
              <h3 className="text-base font-semibold text-petroleum-blue mb-2">Distribución de Esfuerzo</h3>
              <p className="text-xs text-on-surface-variant mb-8">Desglose por área en el trimestre actual.</p>
           </div>
           
           <div className="space-y-4">
              <ProgressBar label="Desarrollo Backend" percentage={45} color="bg-petroleum-blue" />
              <ProgressBar label="Diseño UI/UX" percentage={30} color="bg-sage-accent" />
              <ProgressBar label="QA & Testing" percentage={15} color="bg-dim-amber" />
              <ProgressBar label="Gestión & Otros" percentage={10} color="bg-outline-variant" />
           </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isGood, neutral, icon }: any) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-stone-bg relative overflow-hidden group hover:border-stone-bg/80 transition-colors">
       <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-stone-bg rounded-lg text-petroleum-blue">
            {icon}
          </div>
          {!neutral && (
            <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isGood || trend.startsWith('+') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
               <ArrowUpRight className={`w-3 h-3 ${!isGood && !trend.startsWith('+') ? 'rotate-90' : ''}`} />
               {trend}
            </span>
          )}
          {neutral && (
             <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant">
               {trend}
             </span>
          )}
       </div>
       <h4 className="text-outline text-xs font-semibold uppercase tracking-wider mb-1">{title}</h4>
       <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function ChartBar({ value, label, active }: any) {
  const height = `${(value / 60) * 100}%`;
  return (
    <div className="flex flex-col items-center gap-2 flex-1 group">
      <div className="w-full flex justify-center h-full items-end relative">
         <span className="opacity-0 group-hover:opacity-100 absolute -top-8 text-xs font-bold text-petroleum-blue transition-opacity">{value}</span>
         <div 
           className={`w-full max-w-[40px] rounded-t-md transition-all ${active ? 'bg-petroleum-blue' : 'bg-stone-bg group-hover:bg-sage-accent'}`} 
           style={{ height }}
         ></div>
      </div>
      <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-primary' : 'text-outline-variant'}`}>{label}</span>
    </div>
  );
}

function ProgressBar({ label, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-primary">{label}</span>
        <span className="text-xs font-bold text-outline">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-stone-bg rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function CheckItem() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
}
