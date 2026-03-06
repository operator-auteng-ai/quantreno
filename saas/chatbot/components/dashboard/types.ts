import type { DashboardData } from "@/lib/db/dashboard-queries";
import type { KalshiDashboardData } from "@/lib/kalshi/dashboard-data";

export type DashboardTab = "overview" | "strategies" | "positions" | "chat";

export type DashboardProps = {
  dashboardData: DashboardData;
  kalshiData: KalshiDashboardData;
};
