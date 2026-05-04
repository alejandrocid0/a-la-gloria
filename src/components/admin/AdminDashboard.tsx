import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInCalendarDays } from "date-fns";
import StatsCards from "./StatsCards";
import ActivityChart from "./ActivityChart";
import RetentionSection from "./RetentionSection";
import HermandadesSection from "./HermandadesSection";
import AccountDeletionsSection from "./AccountDeletionsSection";

const AdminDashboard = () => {
  const [avgRetention, setAvgRetention] = useState<string | null>(null);

  const handleAvgRetentionChange = useCallback((value: string | null) => {
    setAvgRetention(value);
  }, []);

  // KPIs principales
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      // Paginate to get ALL profiles (Supabase limits to 1000 per call)
      const allProfiles: any[] = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .rpc("get_public_profiles")
          .range(offset, offset + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProfiles.push(...data);
          offset += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const totalUsers = allProfiles.length;
      const totalGames =
        allProfiles.reduce((sum, p) => sum + (p.games_played || 0), 0);

      const LAUNCH_DATE = new Date(2025, 11, 30);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      LAUNCH_DATE.setHours(0, 0, 0, 0);

      const daysSinceLaunch = Math.max(
        differenceInCalendarDays(today, LAUNCH_DATE) + 1,
        1
      );
      const avgDailyGames = (totalGames / daysSinceLaunch).toFixed(1);
      const avgDailyUsers = (totalUsers / daysSinceLaunch).toFixed(1);

      const recurringUsers = allProfiles.filter(p => (p.games_played || 0) >= 7).length;

      return {
        totalUsers,
        totalGames,
        avgDailyGames,
        avgDailyUsers,
        daysSinceLaunch,
        recurringUsers,
      };
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} avgRetention={avgRetention} />
      <ActivityChart avgDailyGames={stats?.avgDailyGames} />
      <RetentionSection onAvgRetentionChange={handleAvgRetentionChange} />
      <HermandadesSection />
      <AccountDeletionsSection />
    </div>
  );
};

export default AdminDashboard;
