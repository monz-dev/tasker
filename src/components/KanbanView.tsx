import { CheckCircle2, Clock, MessageSquare, MoreVertical, PlusCircle } from "lucide-react";

export function KanbanView() {
  return (
    <div className="pt-6 pb-24 md:pb-12 h-screen flex flex-col">
      {/* Dashboard Header */}
      <div className="px-4 md:px-8 mb-6 max-w-[1200px] mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-semibold text-petroleum-blue mb-1 tracking-tight">Tablero de Proyectos</h2>
        <p className="text-sm text-on-surface-variant">Gestiona tus tareas con calma y precisión.</p>
      </div>

      {/* Kanban Board (Horizontal Scroll container) */}
      <div className="flex-1 overflow-x-auto gap-4 px-4 md:px-8 no-scrollbar snap-x snap-mandatory flex w-full max-w-[1200px] mx-auto pb-8 items-start h-full">
        
        {/* Column: To Do */}
        <section className="min-w-[85vw] md:min-w-[320px] max-w-[320px] flex flex-col snap-center h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-petroleum-blue flex items-center gap-2">
              Por Hacer
              <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] font-medium text-on-surface-variant">4</span>
            </h3>
            <button className="text-outline hover:text-petroleum-blue transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {/* Task Card 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform border border-stone-bg/50">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-soft-terracotta"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide">DISEÑO UI</span>
                <button className="text-outline hover:text-primary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-base font-semibold text-primary mb-4 leading-snug">Redefinir paleta de colores para el sistema</h4>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcjEvqkTJBqZMf-wov1TdLkjuoFR1mx8hAEjt6gIj69i5NCYSWe37HXRRGB9MQAEmxaN_rEGbAomvQNcAdn_9F36aoJ0gQahBJz4rG_IKXOEJr2nNClxTPp2ZigewTz3fbZ8WRxKb3s5mUGbNVjWGhHpvMGEaf2EPQUd7E4aAVGP93Il47paMOqSoOPHqrgmEXvEslhudHOjDjCXqdpERmGaPW1AcicusBJ3KN7y1Fp0HAhkucFxySlmLoJJxORZiO9zaw2znB4Q" className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover bg-stone-bg" />
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWCFHsKqYqyW93YaiXpTQteLaeZXpsm5K1lRg4pnnnZtCHTtFoSR3tMXdYAK_Uu24zUfhCroHU735owOGMuKkdg093cVW2PzjO-JfmV3gNe3TyEoQX-sX_iYeJankT1CXZ_ex53y4J7bAvizcaNWy5KtMKj6A86JuH_d5hZzHjGIUkLvCntXe_L_eM2ykDT2eYMdLVCzj_kxQATBgozMNRAFtaQb86dATmHcmCn-2JYEwitcaAMIj6nzQtZJ5fz1FPiB0kceUDZg" className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover bg-stone-bg" />
                </div>
                <div className="flex items-center gap-1.5 text-outline text-[11px] font-medium">
                  <Clock className="w-[14px] h-[14px]" />
                  Hoy
                </div>
              </div>
            </div>

            {/* Task Card 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform border border-stone-bg/50">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-sage-accent"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide">ESTRATEGIA</span>
                <button className="text-outline hover:text-primary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-base font-semibold text-primary mb-4 leading-snug">Análisis de arquitectura de información</h4>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXjIVWJnx8c76fYZJFsEkuGVC_nZxHq1k1GJeqcK5JzMpIp6vA2rij_-x3Sy3zmOauNIqoXZWp4yfscZvlJ7cmp4HSFj4JG5xm9Yxt5_pWU-bFFIfcvp3wGbhjbAuyOuJZlcwlCJ9tRQNwQcCy0rh_mwT0nJKnunx1Nb-7THvpjTdfOW0ETNT0A6h7i9-hWw1Bt8yhkQ9tVrzl7zn_3fCpCHfA3e95udKzjmEZ4z2OT7KCgTAoGi4hwRfUmy8Np-ycOsLhjzzpvw" className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover bg-stone-bg" />
                </div>
                <div className="flex items-center gap-1.5 text-outline text-[11px] font-medium">
                  <MessageSquare className="w-[14px] h-[14px]" />
                  3
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Column: In Progress */}
        <section className="min-w-[85vw] md:min-w-[320px] max-w-[320px] flex flex-col snap-center h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-petroleum-blue flex items-center gap-2">
              En Progreso
              <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] font-medium text-on-surface-variant">2</span>
            </h3>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {/* Task Card 3 */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform border border-stone-bg/50">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-soft-terracotta"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide">DESARROLLO</span>
                <button className="text-outline hover:text-primary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-base font-semibold text-primary mb-1">Implementar transiciones</h4>
              <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">Asegurar que sean inferiores a 200ms.</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsJpNLNDzTW9dPZKJQ7ryfTeO3NCj6fMLVaXAsdGVckfXMaikpT0-TURA6U2kvE7X-AkdgmeUMa7eshNZ9T7NIqZmfdzV8A-wv2X1QucKMt9fNHctpY_WP2ACRXp-iAWnSOrvh-A1t1Rn1fN0ZssVagwIdipbx5p6v3gMuFyLr9vkWh9tB2gy4FqELbA2tuKFJii7wQRZYfRZx2PswOsEMuT6pgPs1i3-HBbGEtq0_WICele5bMrCdi1ZEmhHpAoOXRz1M5fWQWA" className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover bg-stone-bg" />
                </div>
                <div className="flex items-center gap-1.5 text-dim-amber text-[11px] font-bold uppercase tracking-wider">
                  Crítico
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Column: Done */}
        <section className="min-w-[85vw] md:min-w-[320px] max-w-[320px] flex flex-col snap-center h-full opacity-80">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-bold text-petroleum-blue flex items-center gap-2">
              Hecho
              <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] font-medium text-on-surface-variant">12</span>
            </h3>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {/* Task Card 4 */}
            <div className="bg-stone-bg p-5 rounded-xl relative overflow-hidden flex flex-col border border-stone-bg">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-sage-accent/50"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-outline-variant/30 text-on-surface-variant text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide">GENERAL</span>
                <CheckCircle2 className="w-4 h-4 text-sage-accent" />
              </div>
              <h4 className="text-base font-semibold text-on-surface-variant line-through mb-4">Reunión de alineación semanal</h4>
              <div className="flex items-center justify-between mt-auto">
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlmcH0ISAES90M5mJyhz11q4MuXVpH9ki6nfSqMT-1T3x0g6xNANS-VSSzCwwSu7R_k3h3y-teXTsgVz6r9D6h4lwT98339G5JJ9oGShgdtmH9bH2V9MDJvj0grn9vhDh9_iAEh6M1o5tiI3AdfED6FaZCj_b6jMeD6CKhe_V-gebxMJwlueH5JlQBy8zSBzZ83MziNxDw1SeaBL-ZKUoSRVY7_CG9X3MZ7VijTp93HmlJK1NYlO3X9KO7MLPZ9nLXgjXKhGaO_A" className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover grayscale opacity-70" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
