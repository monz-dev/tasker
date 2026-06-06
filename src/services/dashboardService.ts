import { supabase } from '@/lib/supabase/client';
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
  const { data, error } = await supabase.rpc('get_weekly_stats');

  if (error) {
    console.error('Error fetching weekly stats:', error);
    return EMPTY_STATS;
  }

  return (data as WeeklyStats) ?? EMPTY_STATS;
}
