import { ChevronDown } from "lucide-react";

export function TimelineView() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden pb-24 md:pb-0 bg-warm-white text-on-surface">
      {/* Timeline Controls */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between bg-warm-white z-20 relative border-b border-stone-bg/50">
        <div className="flex items-center space-x-2">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-petroleum-blue">October 2023</span>
          <ChevronDown className="w-5 h-5 text-outline cursor-pointer" />
        </div>
        <div className="flex items-center space-x-1.5 bg-surface-container-low rounded-lg p-1">
          <button className="px-4 py-1.5 rounded-[6px] bg-warm-white shadow-sm text-xs font-semibold text-petroleum-blue transition-colors">Week</button>
          <button className="px-4 py-1.5 rounded-[6px] text-xs font-semibold text-on-surface-variant hover:text-petroleum-blue transition-colors">Month</button>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Fixed Column (Tasks) */}
        <div className="w-[140px] md:w-[220px] flex-shrink-0 bg-warm-white z-20 border-r border-stone-bg shadow-[2px_0_4px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="h-12 border-b border-stone-bg flex items-center px-4 md:px-6">
            <span className="text-xs tracking-wider font-semibold text-outline uppercase">Tasks</span>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
            <div className="px-4 md:px-6 h-10 flex items-center">
              <div className="w-2 h-2 rounded-full bg-sage-accent mr-3 hidden md:block flex-shrink-0"></div>
              <span className="truncate text-sm font-medium text-slate-text">Design UI/UX</span>
            </div>
            
            <div className="px-4 md:px-6 h-10 flex items-center">
              <div className="w-2 h-2 rounded-full bg-petroleum-blue mr-3 hidden md:block flex-shrink-0"></div>
              <span className="truncate text-sm font-medium text-slate-text">API Dev</span>
            </div>
            
            <div className="px-4 md:px-6 h-10 flex items-center">
              <div className="w-2 h-2 rounded-full bg-soft-terracotta mr-3 hidden md:block flex-shrink-0"></div>
              <span className="truncate text-sm font-medium text-slate-text">Testing</span>
            </div>
            
            <div className="px-4 md:px-6 h-10 flex items-center">
              <div className="w-2 h-2 rounded-full bg-dim-amber mr-3 hidden md:block flex-shrink-0"></div>
              <span className="truncate text-sm font-medium text-slate-text">Deployment</span>
            </div>
          </div>
        </div>

        {/* Right Scrollable Timeline (Gantt area) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative gantt-bg-pattern bg-warm-white">
          <div className="min-w-[1000px] relative h-full">
            
            {/* Days Header */}
            <div className="h-12 border-b border-stone-bg flex absolute top-0 left-0 right-0 bg-warm-white/95 backdrop-blur-sm z-10 sticky-header">
              {/* Each day block is 48px wide to align with the gradient background pattern */}
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">12</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">13</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">14</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-bold text-petroleum-blue bg-primary-fixed/20">15</div> 
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">16</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">17</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">18</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">19</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">20</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">21</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">22</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">23</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">24</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">25</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">26</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">27</div>
              <div className="w-[48px] flex items-center justify-center text-[11px] font-semibold text-outline">28</div>
            </div>

            {/* Current Date Vertical Line (Anchored roughly at day 15) */}
            <div className="absolute top-12 bottom-0 left-[168px] w-px bg-petroleum-blue/20 z-0"></div> 

            {/* Gantt Task Rows */}
            <div className="pt-18 pb-8 space-y-6 relative z-0">
              
              {/* Row 1: Design (12 to 16 -> 12px to 228px approx) */}
              <div className="h-10 relative">
                <div className="absolute left-[8px] w-[220px] h-9 top-0.5 bg-sage-accent rounded-[6px] shadow-sm flex items-center px-3 cursor-pointer hover:brightness-95 transition-all group overflow-hidden">
                  <span className="text-[11px] font-semibold tracking-wide text-white truncate relative z-10 w-full text-center">Wireframing & UI</span>
                </div>
                {/* Dependency Link styling */}
                <div className="absolute left-[228px] top-5 w-[16px] h-[32px] border-t-2 border-r-2 border-outline-variant/60 rounded-tr-[8px]"></div>
              </div>

              {/* Row 2: API Dev (16 to 21 -> 192px to 432px approx) */}
              <div className="h-10 relative">
                <div className="absolute left-[244px] w-[236px] h-9 top-0.5 bg-petroleum-blue rounded-[6px] shadow-sm flex items-center px-3 cursor-pointer hover:brightness-95 transition-all">
                  <span className="text-[11px] font-semibold tracking-wide text-white truncate relative z-10 w-full text-center">Backend Services</span>
                </div>
                <div className="absolute left-[480px] top-5 w-[16px] h-[32px] border-t-2 border-r-2 border-outline-variant/60 rounded-tr-[8px]"></div>
              </div>

              {/* Row 3: Testing (21 to 24 -> 432px to 576px approx) */}
              <div className="h-10 relative">
                <div className="absolute left-[496px] w-[140px] h-9 top-0.5 bg-soft-terracotta rounded-[6px] shadow-sm flex items-center px-3 cursor-pointer hover:brightness-95 transition-all">
                  <span className="text-[11px] font-semibold tracking-wide text-white truncate relative z-10 w-full text-center">QA & Bugfixes</span>
                </div>
                <div className="absolute left-[636px] top-5 w-[16px] h-[32px] border-t-2 border-r-2 border-outline-variant/60 rounded-tr-[8px]"></div>
              </div>

              {/* Row 4: Deployment (24 to 25 -> 576px to 624px) */}
              <div className="h-10 relative">
                <div className="absolute left-[652px] w-[90px] h-9 top-0.5 bg-dim-amber rounded-[6px] shadow-sm flex items-center px-3 cursor-pointer hover:brightness-95 transition-all">
                   <span className="text-[11px] font-semibold tracking-wide text-white truncate relative z-10 w-full text-center">V1.0</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
