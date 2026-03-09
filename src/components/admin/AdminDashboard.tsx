import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInCalendarDays } from "date-fns";
import StatsCards from "./StatsCards";
import ActivityChart from "./ActivityChart";
import RetentionSection from "./RetentionSection";
import HermandadesSection from "./HermandadesSection";

const AdminDashboard = () => {
  const [avgRetention, setAvgRetention] = useState<string | null>(null);

  const handleAvgRetentionChange = useCallback((value: string | null) => {
    setAvgRetention(value);
  }, []);

  // KPIs principales
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { data: publicProfiles } = await supabase.rpc("get_public_profiles");
      const totalUsers = publicProfiles?.length || 0;
      const totalGames =
        publicProfiles?.reduce((sum, p) => sum + (p.games_played || 0), 0) || 0;

      const LAUNCH_DATE = new Date(2025, 11, 30);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      LAUNCH_DATE.setHours(0, 0, 0, 0);

      const daysSinceLaunch = Math.max(
        differenceInCalendarDays(today, LAUNCH_DATE) + 1,
        1
      );
      const avgDailyGames = (totalGames / daysSinceLaunch).toFixed(1);
      const avgDailyUsers = ((totalUsers || 0) / daysSinceLaunch).toFixed(1);

      return {
        totalUsers: totalUsers || 0,
        totalGames,
        avgDailyGames,
        avgDailyUsers,
        daysSinceLaunch,
        allGamesInDb: allGamesCount || 0,
        abandonedGames: abandonedCount || 0,
      };
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} avgRetention={avgRetention} />
      <ActivityChart avgDailyGames={stats?.avgDailyGames} />
      <RetentionSection onAvgRetentionChange={handleAvgRetentionChange} />
      <HermandadesSection />
    </div>
  );
};

export default AdminDashboard;
