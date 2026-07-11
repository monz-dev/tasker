import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { KanbanView } from '@/components/KanbanView';

export const metadata = {
  title: 'Kanban — Stone & Sage',
};

export default function KanbanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-petroleum-blue animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">Cargando tablero...</p>
        </div>
      }
    >
      <KanbanView />
    </Suspense>
  );
}
