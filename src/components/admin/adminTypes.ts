export type TimeRange = "7d" | "30d" | "all";
export type RetentionCategory = "high" | "medium" | "low" | "none" | "inactive" | null;

export interface UserRetentionInfo {
  id: string;
  name: string;
  email: string;
  hermandad: string;
  daysPlayed: number;
  daysAvailable: number;
  gamesPlayed: number;
  percentage: number;
}
