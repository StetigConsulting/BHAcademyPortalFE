"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/auth-jwt";
import type { DashboardApiResponse, DashboardData } from "./types";

export async function getDashboardDataAction(): Promise<{
  success: boolean;
  data: DashboardData;
  error?: string;
}> {
  const user = await getCurrentUser();
  const userPerms = user ? [...user.roles, ...user.permissions] : [];

  if (!hasPermission(userPerms, "dashboard.read")) {
    return {
      success: false,
      error: "You do not have permission to view dashboard data.",
      data: {},
    };
  }

  try {
    const res = await apiFetch<DashboardApiResponse>("/v1/dashboard");
    return {
      success: true,
      data: res.data || {},
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    const message =
      error instanceof ApiError ? error.message : "Failed to load dashboard data. Please try again.";
    return {
      success: false,
      error: message,
      data: {},
    };
  }
}
