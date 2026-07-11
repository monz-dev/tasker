import { supabase } from '@/lib/supabase/client';
import { fetchWithRetry } from '@/lib/fetch-utils';
import type { WeeklyStats } from '@/types/models';

const EMPTY_STATS: WeeklyStats = {
  total_completed: 0,
  daily: [
    { day: 1, count: 0 },
    { day: 2, count: 0 },
    { day: 3, count: 0 },
    { day: 4, count: 0 },
    { day: 5, count: 0 },
    { day: 6, count: 0 },
    { day: 7, count: 0 },
  ],
};

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const { data, error } = await fetchWithRetry(() => supabase.rpc('get_weekly_stats'));

  if (error) {
    console.error('Error fetching weekly stats:', error);
    throw new Error(`Error al cargar estadísticas: ${error.message}`);
  }

  return (data as WeeklyStats) ?? EMPTY_STATS;
}
