'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getInvitation, acceptInvitation, type InvitationWithProject } from '@/services/invitationService';
import { Loader2, CheckCircle2, AlertTriangle, UserPlus, LogIn, ArrowRight } from 'lucide-react';

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams ? searchParams.get('id') : null;
  const { user, signOut, loading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationWithProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!invitationId) {
      setError('Falta el identificador de la invitación.');
      setLoading(false);
      return;
    }

    async function loadInvitation() {
      try {
        const data = await getInvitation(invitationId!);
        setInvitation(data);
      } catch (err: any) {
        console.error('Error loading invitation:', err);
        setError('No se pudo encontrar la invitación. Es posible que no exista o haya sido eliminada.');
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    if (!invitationId || !invitation) return;
    const projectId = invitation.project_id;
    setAccepting(true);
    setError(null);
    try {
      await acceptInvitation(invitationId);
      setAccepted(true);
      // Wait a moment for success state visualization, then redirect
      setTimeout(() => {
        router.push(`/kanban?projectId=${projectId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Error al aceptar la invitación.');
      setAccepting(false);
    }
  };

  const handleSignOutAndRedirect = async () => {
    await signOut();
    // Refresh to update useAuth state
    window.location.reload();
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-sage-accent animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">Cargando invitación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50">
        <div className="flex items-center gap-3 text-error mb-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <h2 className="text-lg font-semibold">Error de Invitación</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">{error}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-2.5 bg-stone-bg hover:bg-surface-variant/40 text-petroleum-blue rounded-xl text-sm font-semibold transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (!invitation) return null;

  if (accepted) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-on-secondary-container" />
        </div>
        <h2 className="text-2xl font-bold text-petroleum-blue mb-2">¡Invitación Aceptada!</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Te has unido al proyecto <span className="font-semibold text-primary">{invitation.projects?.name}</span> con éxito. Redirigiendo...
        </p>
        <Loader2 className="w-6 h-6 text-sage-accent animate-spin mx-auto" />
      </div>
    );
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-on-secondary-container animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-petroleum-blue mb-2">Invitación ya procesada</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Esta invitación para unirse a <span className="font-semibold text-primary">{invitation.projects?.name}</span> ya ha sido aceptada previamente.
        </p>
        <button
          onClick={() => router.push('/projects')}
          className="w-full py-2.5 bg-petroleum-blue hover:bg-primary text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Ir a mis Proyectos <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 text-center">
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-on-error-container" />
        </div>
        <h2 className="text-xl font-semibold text-petroleum-blue mb-2">Invitación no disponible</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Esta invitación se encuentra en estado <span className="font-semibold capitalize text-error">{invitation.status}</span> y no puede ser aceptada.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-2.5 bg-stone-bg hover:bg-surface-variant/40 text-petroleum-blue rounded-xl text-sm font-semibold transition-colors"
        >
          Ir al Dashboard
        </button>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    const loginUrl = `/login?email=${encodeURIComponent(invitation.email)}&redirectTo=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`;

    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-on-secondary-container" />
          </div>
          <h2 className="text-2xl font-bold text-petroleum-blue tracking-tight">Invitación a Proyecto</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            Has sido invitado a colaborar en el proyecto
          </p>
          <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-stone-bg">
            <p className="text-lg font-bold text-primary">{invitation.projects?.name}</p>
            <p className="text-xs text-on-secondary-container mt-1 font-medium capitalize bg-secondary-container/50 px-2.5 py-0.5 rounded-full inline-block">
              Rol: {invitation.role}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-center text-on-surface-variant">
            Esta invitación está dirigida a <span className="font-semibold text-primary">{invitation.email}</span>.
            Para aceptarla, debes iniciar sesión o registrarte con este correo.
          </p>
          
          <button
            onClick={() => router.push(loginUrl)}
            className="w-full py-3 bg-petroleum-blue hover:bg-primary text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Registrarse o Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // User is logged in but emails do not match
  if (user.email && user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-error mb-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-error" />
          <h2 className="text-lg font-semibold text-petroleum-blue">Cuenta no coincide</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">
          Esta invitación fue enviada a <span className="font-semibold text-primary">{invitation.email}</span>.
          Sin embargo, estás logueado con la cuenta <span className="font-semibold text-primary">{user.email}</span>.
        </p>
        <p className="text-xs text-on-surface-variant mb-6">
          Por favor, cierra la sesión actual para poder aceptar la invitación con la cuenta de correo correspondiente.
        </p>
        <div className="space-y-2">
          <button
            onClick={handleSignOutAndRedirect}
            className="w-full py-2.5 bg-error-container hover:bg-error-container/80 text-on-error-container rounded-xl text-sm font-semibold transition-colors"
          >
            Cerrar Sesión Actual
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2.5 bg-stone-bg hover:bg-surface-variant/40 text-petroleum-blue rounded-xl text-sm font-semibold transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User is logged in and emails match!
  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-stone-bg/50 animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-6 h-6 text-on-secondary-container" />
        </div>
        <h2 className="text-2xl font-bold text-petroleum-blue tracking-tight">Aceptar Invitación</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Te han invitado a colaborar en
        </p>
        <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-stone-bg">
          <p className="text-lg font-bold text-primary">{invitation.projects?.name}</p>
          <p className="text-xs text-on-secondary-container mt-1 font-medium capitalize bg-secondary-container/50 px-2.5 py-0.5 rounded-full inline-block">
            Rol asignado: {invitation.role}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-center text-on-surface-variant">
          Estás ingresando con la cuenta <span className="font-semibold text-primary">{user.email}</span>.
        </p>

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 bg-petroleum-blue hover:bg-primary text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {accepting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Aceptando...
            </>
          ) : (
            <>Unirse al Proyecto</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-sage-accent animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">Cargando...</p>
        </div>
      }>
        <AcceptInvitationContent />
      </Suspense>
    </div>
  );
}
