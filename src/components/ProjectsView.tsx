'use client';

import { useState, useEffect, useCallback } from "react";
import { Calendar, MoreVertical, Plus, Search, Loader2, X, AlertCircle, Trash2, CheckCircle2, TrendingUp, User, Building2, UserPlus, Copy, Check } from "lucide-react";
import { getActiveProjects, createProject, updateProjectProgress, updateProjectStatus, softDeleteProject } from "@/services/projectService";
import { createInvitation } from "@/services/invitationService";
import type { ProjectWithMembers } from "@/types/models";


export function ProjectsView() {
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // New project form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // Invitation state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>("member");
  const [invitationLink, setInvitationLink] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInviteCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteProjectId || !inviteEmail.trim()) return;

    setInviteSubmitting(true);
    setInviteError("");
    try {
      const invitation = await createInvitation(inviteProjectId, inviteEmail.trim(), inviteRole);
      const link = `${window.location.origin}/accept-invitation?id=${invitation.id}`;
      setInvitationLink(link);
    } catch (err: any) {
      console.error("Error creating invitation:", err);
      setInviteError(err.message || "Error al generar la invitación.");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!invitationLink) return;
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  // Load projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projs = await getActiveProjects();
      setProjects(projs);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Handle create project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        client: client.trim() || undefined,
        target_date: targetDate || undefined,
      });

      // Reset form
      setName("");
      setDescription("");
      setClient("");
      setTargetDate("");
      setShowCreateModal(false);

      // Reload
      await loadProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Action: Update Progress
  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      await updateProjectProgress(id, progress);
      setActiveMenuId(null);
      await loadProjects();
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // Quick Action: Update Status
  const handleUpdateStatus = async (id: string, status: 'active' | 'completed' | 'delayed') => {
    try {
      await updateProjectStatus(id, status);
      setActiveMenuId(null);
      await loadProjects();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Quick Action: Soft Delete
  const handleDeleteProject = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés archivar este proyecto?")) return;
    try {
      await softDeleteProject(id);
      setActiveMenuId(null);
      await loadProjects();
    } catch (err) {
      console.error("Error archiving project:", err);
    }
  };

  // Filter projects by search
  const filteredProjects = projects.filter((project) => {
    const term = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(term) ||
      (project.description || "").toLowerCase().includes(term) ||
      (project.client || "").toLowerCase().includes(term)
    );
  });

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyectos..." 
            className="w-full pl-12 pr-4 py-3 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
          />
        </div>
      </div>

      {/* Projects Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-6 h-60 animate-pulse border border-stone-bg/50">
              <div className="h-4 bg-stone-bg rounded w-1/3 mb-4" />
              <div className="h-6 bg-stone-bg rounded w-3/4 mb-2" />
              <div className="h-4 bg-stone-bg rounded w-5/6 mb-8" />
              <div className="h-2 bg-stone-bg rounded w-full mb-2" />
              <div className="h-8 bg-stone-bg rounded w-20" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-2xl p-8 border border-stone-bg/50 shadow-sm">
          <AlertCircle className="w-12 h-12 text-outline mb-4" />
          <h3 className="text-lg font-semibold text-petroleum-blue mb-1">No se encontraron proyectos</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">
            {searchQuery ? "No hay proyectos que coincidan con tu búsqueda." : "Crea tu primer proyecto para comenzar a colaborar con tu equipo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isCompleted = project.status === "completed";
            const isDelayed = project.status === "delayed";
            
            let statusLabel = "En curso";
            let statusClass = "bg-primary-fixed text-on-primary-fixed";
            let barColor = "bg-petroleum-blue";
            if (isCompleted) {
              statusLabel = "Completado";
              statusClass = "bg-secondary-container text-on-secondary-container";
              barColor = "bg-sage-accent";
            } else if (isDelayed) {
              statusLabel = "Retrasado";
              statusClass = "bg-error-container text-on-error-container";
              barColor = "bg-soft-terracotta";
            }

            return (
              <div 
                key={project.id} 
                className="bg-surface-container-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-visible flex flex-col hover:bg-stone-bg/50 transition-all duration-300 group border border-stone-bg/50 relative"
              >
                <div className={`h-1 w-full ${barColor}`} />
                <div className="p-6 flex flex-col h-full transition-transform duration-300">
                  <div className="flex justify-between items-start mb-4 relative">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                        className="text-outline-variant hover:text-primary p-1 rounded-full hover:bg-stone-bg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {/* Context menu */}
                      {activeMenuId === project.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-xl border border-stone-bg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-outline uppercase tracking-wider">Acciones rápidas</div>
                            
                            {!isCompleted && (
                              <button 
                                onClick={() => handleUpdateProgress(project.id, 100)}
                                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-stone-bg transition-colors flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-sage-accent" /> Marcar Completado
                              </button>
                            )}

                            {isCompleted && (
                              <button 
                                onClick={() => handleUpdateProgress(project.id, 50)}
                                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-stone-bg transition-colors flex items-center gap-2"
                              >
                                <TrendingUp className="w-4 h-4 text-petroleum-blue" /> Reabrir Proyecto
                              </button>
                            )}

                            {!isDelayed && !isCompleted && (
                              <button 
                                onClick={() => handleUpdateStatus(project.id, "delayed")}
                                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-stone-bg transition-colors flex items-center gap-2"
                              >
                                <AlertCircle className="w-4 h-4 text-soft-terracotta" /> Marcar Retrasado
                              </button>
                            )}

                            {isDelayed && (
                              <button 
                                onClick={() => handleUpdateStatus(project.id, "active")}
                                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-stone-bg transition-colors flex items-center gap-2"
                              >
                                <TrendingUp className="w-4 h-4 text-petroleum-blue" /> Quitar Retrasado
                              </button>
                            )}

                            <button 
                              onClick={() => {
                                setInviteProjectId(project.id);
                                setInviteEmail("");
                                setInviteRole("member");
                                setInvitationLink("");
                                setInviteError("");
                                setCopied(false);
                                setShowInviteModal(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-stone-bg transition-colors flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4 text-sage-accent" /> Invitar colaborador
                            </button>
                            <div className="border-t border-stone-bg my-1" />
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="w-full text-left px-4 py-2 text-xs text-soft-terracotta hover:bg-error-container/20 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-soft-terracotta" /> Archivar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="text-[20px] font-semibold text-petroleum-blue mb-2 group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                    {project.name}
                  </h3>
                  
                  <p className="text-sm text-on-surface-variant mb-6 flex-grow leading-relaxed line-clamp-2">
                    {project.description || "Sin descripción proporcionada."}
                  </p>
                  
                  <div className="space-y-4">
                    {project.client && (
                      <div className="flex items-center gap-2 text-outline">
                        <Building2 className="w-[16px] h-[16px]" />
                        <span className="text-xs font-medium">Cliente: {project.client}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-outline">
                      <Calendar className="w-[16px] h-[16px]" />
                      <span className="text-xs font-medium">
                        {isCompleted ? "Finalizado" : "Entrega"}: {project.target_date ? new Date(project.target_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "Sin fecha"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.members && project.members.length > 0 ? (
                          project.members.slice(0, 3).map((member, i) => (
                            <div 
                              key={member.user_id} 
                              className="w-8 h-8 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-stone-bg cursor-pointer relative group"
                              title={member.full_name}
                            >
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-petroleum-blue ${i % 2 === 0 ? 'bg-secondary-container' : 'bg-primary-container'}`}>
                                  {(member.full_name || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-stone-bg flex items-center justify-center text-outline">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        {project.members && project.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-stone-bg flex items-center justify-center text-[10px] font-bold text-petroleum-blue z-10">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${isCompleted ? 'text-sage-accent' : isDelayed ? 'text-soft-terracotta' : 'text-petroleum-blue'}`}>
                        {project.progress}%
                      </span>
                    </div>

                    <div className="w-full bg-stone-bg h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-petroleum-blue text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-200 z-40 group cursor-pointer"
      >
        <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      {/* Premium Design Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-stone-bg max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-stone-bg/50 border-b border-stone-bg flex justify-between items-center">
              <h3 className="text-lg font-bold text-petroleum-blue">Nuevo Proyecto</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-outline hover:text-primary p-1 rounded-full hover:bg-stone-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Nombre del Proyecto <span className="text-soft-terracotta">*</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Portal E-commerce Sage" 
                  className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                  Descripción
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe brevemente el alcance o meta de este proyecto..." 
                  rows={3}
                  className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Cliente
                  </label>
                  <input 
                    type="text" 
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="ej. Arquetipo SL" 
                    className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Fecha de entrega
                  </label>
                  <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-bg">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-stone-bg text-on-surface-variant hover:bg-stone-bg/80 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !name.trim()}
                  className="px-4 py-2.5 bg-petroleum-blue text-white hover:bg-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Collaborator Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-stone-bg max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-stone-bg/50 border-b border-stone-bg flex justify-between items-center">
              <h3 className="text-lg font-bold text-petroleum-blue">Invitar Colaborador</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-outline hover:text-primary p-1 rounded-full hover:bg-stone-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!invitationLink ? (
              <form onSubmit={handleInviteCollab} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Correo Electrónico <span className="text-soft-terracotta">*</span>
                  </label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colaborador@ejemplo.com" 
                    className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                    Rol en el Proyecto
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                    className="w-full px-4 py-2.5 bg-warm-white border border-stone-bg rounded-xl focus:ring-2 focus:ring-sage-accent/10 focus:border-sage-accent outline-none transition-all text-sm text-on-surface"
                  >
                    <option value="member">Miembro (Puede ver, crear y editar tareas)</option>
                    <option value="admin">Administrador (Control total del proyecto)</option>
                    <option value="viewer">Lector (Solo ver contenido)</option>
                  </select>
                </div>

                {inviteError && (
                  <div className="p-3 bg-error-container/50 border border-error/20 rounded-lg">
                    <p className="text-xs text-on-error-container">{inviteError}</p>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-bg">
                  <button 
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2.5 bg-stone-bg text-on-surface-variant hover:bg-stone-bg/80 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={inviteSubmitting || !inviteEmail.trim()}
                    className="px-4 py-2.5 bg-petroleum-blue text-white hover:bg-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-40"
                  >
                    {inviteSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generar Invitación"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4">
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-on-secondary-container" />
                  </div>
                  <h4 className="text-base font-bold text-petroleum-blue">¡Invitación Creada con Éxito!</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Envía este enlace a <span className="font-semibold text-primary">{inviteEmail}</span> para que se una al proyecto.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Enlace de invitación
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly
                      value={invitationLink}
                      className="flex-1 px-3 py-2 bg-stone-bg border border-stone-bg rounded-xl text-xs text-on-surface font-mono outline-none select-all"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-petroleum-blue hover:bg-primary text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-w-[90px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-stone-bg">
                  <button 
                    onClick={() => setShowInviteModal(false)}
                    className="px-5 py-2.5 bg-petroleum-blue text-white hover:bg-primary text-xs font-semibold rounded-xl transition-colors"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
