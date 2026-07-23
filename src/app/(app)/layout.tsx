import { Navigation } from '@/components/Navigation';
import { SessionSync } from '@/components/SessionSync';
import { AutoLogout } from '@/components/AutoLogout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-white text-on-surface font-sans flex flex-col md:pl-20">
      <SessionSync />
      <AutoLogout />
      <Navigation />
      <main className="flex-1 w-full relative">{children}</main>
    </div>
  );
}
