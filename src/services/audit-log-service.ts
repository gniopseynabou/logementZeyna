import { supabase } from "@/integrations/supabase/client";
import type { PaginatedResponse } from "./admin-user-service";

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  success: boolean;
  created_at: string;
}

export interface GetAuditLogsParams {
  page?: number;
  pageSize?: number;
  actionFilter?: string;
  successFilter?: string; // 'all' | 'true' | 'false'
}

export const getAuditLogs = async ({
  page = 1,
  pageSize = 25,
  actionFilter = "",
  successFilter = "all",
}: GetAuditLogsParams = {}): Promise<PaginatedResponse<AuditLog>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" });

  if (actionFilter) {
    query = query.ilike("action", `%${actionFilter}%`);
  }

  if (successFilter !== "all") {
    query = query.eq("success", successFilter === "true");
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: (data || []) as AuditLog[],
    pagination: { page, pageSize, total, totalPages },
  };
};
