import { Bell, Lock, Palette, User, Globe, Database } from "lucide-react";

export function SettingsView() {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8 mb-24 md:mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-petroleum-blue mb-2 tracking-tight">Configuración</h2>
        <p className="text-sm text-on-surface-variant">Gestiona tus preferencias personales y del espacio de trabajo.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-stone-bg/50 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Settings Nav */}
          <div className="w-full md:w-64 bg-warm-white border-b md:border-b-0 md:border-r border-stone-bg p-4 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar">
             <SettingsTab icon={<User className="w-4 h-4" />} label="Cuenta" active />
             <SettingsTab icon={<Palette className="w-4 h-4" />} label="Apariencia" />
             <SettingsTab icon={<Bell className="w-4 h-4" />} label="Notificaciones" />
             <SettingsTab icon={<Lock className="w-4 h-4" />} label="Seguridad & Privacidad" />
             <SettingsTab icon={<Globe className="w-4 h-4" />} label="Idioma y Región" />
             <div className="hidden md:block my-2 border-t border-stone-bg"></div>
             <SettingsTab icon={<Database className="w-4 h-4" />} label="Datos del Espacio" />
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 p-6 md:p-8">
             <div className="max-w-md space-y-8">
                
                {/* Profile Section */}
                <section>
                   <h3 className="text-lg font-semibold text-primary mb-4">Perfil Público</h3>
                   
                   <div className="flex items-center gap-6 mb-6">
                     <div className="w-20 h-20 rounded-full bg-stone-bg border-4 border-white shadow-sm overflow-hidden">
                       <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlgFLYhwvqaWsN2eHwoL1viTINNRac03eFbjoHXtUkpgJWrhK27lDTlAIRElvWSyVrurWmzCd49Se5zaxbOvZPaGW0B2cis4obF9Gt-gkz2bQSC6oclCRhTlGZQbM5RJpPjLHJwiPP5XpP5vA0t9Wgnfr1dKxnyv77CrkW56ypi747KkpwoYpIA-b_dtmJc9JOx40NHjMhvXiRWWezsSS6frCZyA-x3VKIm5twlI1Zny3Oi6PUknpTNNMfRZ3JSd0TGbM87dDhbw" className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <button className="px-4 py-2 bg-stone-bg hover:bg-stone-bg/80 text-petroleum-blue text-xs font-semibold rounded-lg transition-colors">
                         Cambiar Avatar
                       </button>
                       <p className="text-[11px] text-outline mt-2">JPG o PNG, max 2MB.</p>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-semibold text-petroleum-blue mb-1.5">Nombre Completo</label>
                       <input 
                         type="text" 
                         defaultValue="Stone & Sage Admin"
                         className="w-full bg-warm-white border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-sage-accent focus:ring-1 focus:ring-sage-accent transition-all"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-petroleum-blue mb-1.5">Cargo / Rol</label>
                       <input 
                         type="text" 
                         defaultValue="Lead Product Designer"
                         className="w-full bg-warm-white border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-sage-accent focus:ring-1 focus:ring-sage-accent transition-all"
                       />
                     </div>
                   </div>
                </section>

                <hr className="border-stone-bg" />

                {/* Email Section */}
                <section>
                   <h3 className="text-lg font-semibold text-primary mb-4">Información de Contacto</h3>
                   <div>
                     <label className="block text-xs font-semibold text-petroleum-blue mb-1.5">Correo Electrónico</label>
                     <input 
                       type="email" 
                       defaultValue="admin@stonesage.co"
                       disabled
                       className="w-full bg-stone-bg/50 border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-outline-variant cursor-not-allowed"
                     />
                     <p className="text-[11px] text-outline mt-2">Ponte en contacto con el soporte técnico para cambiar tu correo.</p>
                   </div>
                </section>

                <div className="pt-4 flex justify-end gap-3">
                  <button className="px-5 py-2 text-on-surface-variant font-semibold text-sm hover:bg-stone-bg rounded-lg transition-colors">Cancelar</button>
                  <button className="px-5 py-2 bg-petroleum-blue text-white font-semibold text-sm rounded-lg hover:bg-primary transition-colors hover:shadow-md">Guardar Cambios</button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, active }: any) {
  return (
    <button 
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal
        ${active 
          ? 'bg-secondary-container text-on-secondary-container' 
          : 'text-on-surface-variant hover:bg-stone-bg hover:text-petroleum-blue'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
