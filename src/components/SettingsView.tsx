import { useState } from "react";
import { Bell, Lock, Palette, User, Globe, Database, Loader2, AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "../types/models";
import { updateProfile } from "../services/profileService";

interface SettingsViewProps {
  user: SupabaseUser;
  profile: Profile | null;
  onSignOut: () => void;
}

export function SettingsView({ user, profile, onSignOut }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"account" | "appearance" | "notifications" | "security" | "languages">("account");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [role, setRole] = useState<Profile["role"]>(profile?.role || "member");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        role: role,
      });
      setSuccess(true);
      
      // Auto-reload to apply changes system-wide in 1.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "No se pudieron guardar los cambios. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <SettingsTab 
              icon={<User className="w-4 h-4" />} 
              label="Cuenta" 
              active={activeTab === "account"} 
              onClick={() => setActiveTab("account")}
            />
            <SettingsTab 
              icon={<Palette className="w-4 h-4" />} 
              label="Apariencia" 
              active={activeTab === "appearance"} 
              onClick={() => setActiveTab("appearance")}
            />
            <SettingsTab 
              icon={<Bell className="w-4 h-4" />} 
              label="Notificaciones" 
              active={activeTab === "notifications"} 
              onClick={() => setActiveTab("notifications")}
            />
            <SettingsTab 
              icon={<Lock className="w-4 h-4" />} 
              label="Seguridad & Privacidad" 
              active={activeTab === "security"} 
              onClick={() => setActiveTab("security")}
            />
            <SettingsTab 
              icon={<Globe className="w-4 h-4" />} 
              label="Idioma y Región" 
              active={activeTab === "languages"} 
              onClick={() => setActiveTab("languages")}
            />
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 p-6 md:p-8">
            {activeTab === "account" ? (
              <form onSubmit={handleSave} className="max-w-md space-y-8">
                
                {/* Profile Section */}
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary">Perfil Público</h3>
                  
                  {success && (
                    <div className="p-3 bg-green-50 text-sage-accent text-xs rounded-xl flex items-center gap-2 border border-sage-accent/20 animate-in fade-in duration-100">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>¡Cambios guardados con éxito! Aplicando cambios...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 text-soft-terracotta text-xs rounded-xl flex items-center gap-2 border border-soft-terracotta/20 animate-in fade-in duration-100">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-stone-bg border-4 border-white shadow-sm overflow-hidden flex items-center justify-center text-petroleum-blue font-bold text-2xl uppercase">
                      {fullName.slice(0, 2) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{fullName || "Usuario"}</p>
                      <p className="text-[11px] text-outline uppercase tracking-wider mt-1">{role}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-petroleum-blue mb-1.5 uppercase tracking-wide">
                        Nombre Completo
                      </label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-warm-white border border-stone-bg rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-sage-accent focus:ring-1 focus:ring-sage-accent transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-petroleum-blue mb-1.5 uppercase tracking-wide">
                        Cargo / Rol
                      </label>
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value as Profile["role"])}
                        className="w-full bg-warm-white border border-stone-bg rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-sage-accent focus:ring-1 focus:ring-sage-accent cursor-pointer transition-all"
                      >
                        <option value="member">Miembro del equipo</option>
                        <option value="admin">Administrador</option>
                        <option value="viewer">Solo lector (Viewer)</option>
                      </select>
                    </div>
                  </div>
                </section>

                <hr className="border-stone-bg" />

                {/* Email Section */}
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary">Información de Contacto</h3>
                  <div>
                    <label className="block text-xs font-semibold text-petroleum-blue mb-1.5 uppercase tracking-wide">
                      Correo Electrónico
                    </label>
                    <input 
                      type="email" 
                      value={user.email || ""}
                      disabled
                      className="w-full bg-stone-bg/50 border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-outline cursor-not-allowed"
                    />
                    <p className="text-[11px] text-outline mt-2">El correo electrónico está vinculado a su cuenta y no se puede modificar.</p>
                  </div>
                </section>

                <hr className="border-stone-bg" />

                {/* Sign Out Section inside settings */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold text-soft-terracotta">Cerrar Sesión</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    ¿Quieres salir del espacio de trabajo? Puedes volver a iniciar sesión en cualquier momento.
                  </p>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-4 py-2.5 bg-red-50 hover:bg-error-container/20 text-soft-terracotta text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-soft-terracotta/20 active:scale-95"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión Activa
                  </button>
                </section>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-bg">
                  <button 
                    type="submit" 
                    disabled={submitting || !fullName.trim()}
                    className="px-5 py-2.5 bg-petroleum-blue text-white font-semibold text-sm rounded-xl hover:bg-primary transition-colors hover:shadow-md disabled:opacity-40 cursor-pointer flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                <Palette className="w-12 h-12 text-outline-variant mx-auto mb-2" />
                <h3 className="text-lg font-bold text-petroleum-blue">Preferencia en desarrollo</h3>
                <p className="text-sm text-on-surface-variant">Esta sección estará disponible en las próximas versiones para personalizar tu espacio de trabajo.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

interface SettingsTabProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SettingsTab({ icon, label, active, onClick }: SettingsTabProps) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal cursor-pointer
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
