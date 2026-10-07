import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/services/audit-log-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useDebounce } from "@/hooks/use-debounce";
import { ShieldAlert, Search, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Actions connues avec labels lisibles
const ACTION_LABELS: Record<string, string> = {
  MAINTENANCE_ACTIVATED:   "Maintenance activée",
  MAINTENANCE_DEACTIVATED: "Maintenance désactivée",
  UNAUTHORIZED_ATTEMPT:    "Tentative non autorisée",
  SUPER_ADMIN_CREATED:     "Super-Admin créé",
  CONFIG_CHANGED:          "Configuration modifiée",
};

const actionLabel = (action: string) => ACTION_LABELS[action] ?? action;

const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [actionFilter, setActionFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("all");

  const debouncedAction = useDebounce(actionFilter, 400);

  const { data: logsData, isLoading, isError, error } = useQuery({
    queryKey: ["audit-logs", page, pageSize, debouncedAction, successFilter],
    queryFn: () => getAuditLogs({ page, pageSize, actionFilter: debouncedAction, successFilter }),
  });

  const logs = logsData?.data || [];

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            Journal d'audit
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Traçabilité des actions techniques et sensibles effectuées sur la plateforme.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrer par action..."
              className="pl-10"
              value={actionFilter}
              onChange={(e) => handleFilterChange(setActionFilter)(e.target.value)}
            />
          </div>
          <Select value={successFilter} onValueChange={handleFilterChange(setSuccessFilter)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Résultat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les résultats</SelectItem>
              <SelectItem value="true">Succès uniquement</SelectItem>
              <SelectItem value="false">Échecs uniquement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tableau */}
        <Card className="border-0 shadow-premium">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-medium text-muted-foreground">
              {logsData ? `${logsData.pagination.total} événement(s) enregistré(s)` : "…"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-12 text-center" role="alert">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive opacity-60" />
                <p className="font-medium">Impossible de charger le journal d'audit.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Erreur inattendue."}
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Aucun événement enregistré.</p>
                <p className="text-sm mt-1">Les actions sensibles apparaîtront ici une fois enregistrées.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell">Ressource</TableHead>
                        <TableHead className="hidden lg:table-cell">Utilisateur (ID)</TableHead>
                        <TableHead className="hidden lg:table-cell">IP</TableHead>
                        <TableHead>Résultat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss", { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm">{actionLabel(log.action)}</span>
                            {log.details && Object.keys(log.details).length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                                {JSON.stringify(log.details)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {log.resource_type
                              ? <span>{log.resource_type}{log.resource_id ? ` #${log.resource_id.slice(0, 8)}…` : ""}</span>
                              : "-"
                            }
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                            {log.user_id ? `${log.user_id.slice(0, 8)}…` : "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {log.ip_address || "-"}
                          </TableCell>
                          <TableCell>
                            {log.success ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200 gap-1 text-xs">
                                <CheckCircle2 className="h-3 w-3" /> Succès
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-200 gap-1 text-xs">
                                <XCircle className="h-3 w-3" /> Échec
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {logsData && logsData.pagination.totalPages > 1 && (
                  <div className="border-t">
                    <PaginationControls
                      currentPage={logsData.pagination.page}
                      totalPages={logsData.pagination.totalPages}
                      pageSize={logsData.pagination.pageSize}
                      totalItems={logsData.pagination.total}
                      onPageChange={setPage}
                      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
