import { Calendar, MoreVertical, Plus, Search } from "lucide-react";

export function ProjectsView() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">Proyectos Activos</h2>
          <p className="text-sm text-on-surface-variant">Gestiona y supervisa el progreso de tu equipo en tiempo real.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
          <input 
            type="text" 
            placeholder="Buscar proyectos..." 
            className="w-full pl-12 pr-4 py-3 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Project Card 1: Completed */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:bg-stone-bg/50 transition-colors duration-300 group">
          <div className="h-1 bg-sage-accent w-full"></div>
          <div className="p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold tracking-wide uppercase">Completado</span>
              <button className="text-outline-variant hover:text-primary">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-[20px] font-semibold text-petroleum-blue mb-2 group-hover:text-primary transition-colors tracking-tight">Identidad Visual Arquetipo</h3>
            <p className="text-sm text-on-surface-variant mb-8 flex-grow leading-relaxed">Rediseño integral de la marca para la firma de arquitectura Arquetipo en Madrid.</p>
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-outline">
                <Calendar className="w-[18px] h-[18px]" />
                <span className="text-xs font-medium">Finalizado: 12 Oct, 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-stone-bg cursor-pointer">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjfzD_uXctcCxU_QsUhw_dkm8JXouLUGFl3XVZG0PdYcF4i3shVXGlr3lQ5LxBqR2bH_TG94FCRNS7pjf6AWvhC2HP5S3HCvUOt-gzKHg3-9eBKuHPtJ3AxBgi6q1xwMVtpHlKMH_kpTIDAQFjsCvP6Ln9xoHw54dRGofz5qJ_ZjOg2d4BpGnyqV6cset5Lq2Xman_cChuaoG_8TEYPFaAjG7h7c9cGxALSlhPtrwoOYoOcHYaUrTgt2umoPrunO98nm9d9a2YdA" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-stone-bg cursor-pointer">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUDAfBL0EFbTQqFsg-11qTDaqbDvL3UkQrTAl0KywKziNKCZ2bdPAOEyaCn6kJCjYG6jSIfuUahB34w7E0v7QuL7V_buOqYvKaXydZfFzWlpvK-lYcvt8mhqsZvtRCJjV1O2raJT2bx7JFP4tG6i4ehImBKCwA6L2w7-9vzewH74aFF_AwQCWQOucxBoa215vIjmpJAfLMDtOrpO6BLch9O5_x6jL5_3KrQ_Oeoo_N-87VUke63pwXBy1TVJ4Op82dQJFJOs65wg" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-stone-bg flex items-center justify-center text-[10px] font-bold text-petroleum-blue z-10">+2</div>
                </div>
                <span className="text-sm text-sage-accent font-semibold">100%</span>
              </div>
              <div className="w-full bg-stone-bg h-1.5 rounded-full overflow-hidden">
                <div className="bg-sage-accent h-full w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Card 2: In Progress */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:bg-stone-bg/50 transition-colors duration-300 group">
          <div className="h-1 bg-petroleum-blue w-full"></div>
          <div className="p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold tracking-wide uppercase">En curso</span>
              <button className="text-outline-variant hover:text-primary">
                 <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-[20px] font-semibold text-petroleum-blue mb-2 group-hover:text-primary transition-colors tracking-tight">Portal E-commerce Sage</h3>
            <p className="text-sm text-on-surface-variant mb-8 flex-grow leading-relaxed">Desarrollo de plataforma B2B con integración de inventario en tiempo real.</p>
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-outline">
                <Calendar className="w-[18px] h-[18px]" />
                <span className="text-xs font-medium">Entrega: 24 Nov, 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-stone-bg cursor-pointer">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOdpGihqSgpCiri1RBM9VXb7E9R7tZEUd-rCxSwFV8Y3-4SPiF-uMzwbNnOf96OY1FZZiHDARoMmdjuszf5T-SnwuyKBxV_CcgaDOuUaNxszoMwiOMgllSTauQFd2c6PsO1AiJHO9tS_PORbqrcTA_z_fngWbtOk-NJVkpXneBwkTmkPXvSPsDvc8lH2OqKn-Bs8Fz-2F2DSEbcrM6T9cC1p9j2XFxK36QZwHtAF7KKOCo3tBTkaH6vsS2O7vkbJz-SNftuOxwBw" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-stone-bg cursor-pointer">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEC_AmP2eYtfwV9EgvamUWaP1M_4ALbiLAAeh3NxTU82NE6cS2f4oiWNRh0mKz74MB5kt3Bup0MZIoVV70GjuyTt_WYwXE0aG19D83ojeVn8ljvBX20akSQwrWH2VBzQdG-_0aBiqNSxevztIvguPwoXmU2KocwIrnQxXrc0RcNFaCKIOg21gsINDxiVihYvEtP3gRkgG1BzEe4iGejaIFxxl8Rs3DPY5YHfF7ZMf953qtsmuV9ZCWjFgwvTQjCNHb0PmTy_nkAA" className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-sm text-petroleum-blue font-semibold">65%</span>
              </div>
              <div className="w-full bg-stone-bg h-1.5 rounded-full overflow-hidden">
                <div className="bg-petroleum-blue h-full w-[65%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Card 3: Delayed */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:bg-stone-bg/50 transition-colors duration-300 group">
          <div className="h-1 bg-soft-terracotta w-full"></div>
          <div className="p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container text-[11px] font-semibold tracking-wide uppercase">Retrasado</span>
              <button className="text-outline-variant hover:text-primary">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-[20px] font-semibold text-petroleum-blue mb-2 group-hover:text-primary transition-colors tracking-tight">Campaña Q4 Exterior</h3>
            <p className="text-sm text-on-surface-variant mb-8 flex-grow leading-relaxed">Producción de materiales gráficos para mupis y pantallas digitales urbanas.</p>
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-error">
                <Calendar className="w-[18px] h-[18px]" />
                <span className="text-xs font-medium">Venció: 01 Nov, 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-stone-bg cursor-pointer">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPdXRh_6Vh75ZrLQk5nx1L9HJv-Ri1YipG87r9N3zcPSA_XipiDwkbRDA0E6DJgDnay73ouIHhVHMxP2hpNvQhrquvEj-l7213_TgERe3pehYlIq5jNSlVjExHY-eS4IDUenZ-fq3zCtlN_k2D81GEoD2u-iEyDIJTk9mmNFWkHmZ6g_qvoRrLQlZ5vfzPHS2d7nfH9hTZlkH2w_c9YzQ9Vnm3rg8qtceCQXq4ROpiONUBeMgN5tUHR4omJssbVqlkAaByjqCyjg" className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-sm text-soft-terracotta font-semibold">30%</span>
              </div>
              <div className="w-full bg-stone-bg h-1.5 rounded-full overflow-hidden">
                <div className="bg-soft-terracotta h-full w-[30%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-petroleum-blue text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-200 z-40 group cursor-pointer">
        <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

    </div>
  );
}
