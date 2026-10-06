import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationControlsProps) => {
  // Sécuriser les limites
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, safeTotalPages));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-muted-foreground flex items-center gap-4">
        <span>
          Total : <span className="font-medium text-foreground">{totalItems}</span>
        </span>
        <div className="flex items-center gap-2">
          <span>Afficher</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage <= 1 || isLoading}
            title="Première page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1 || isLoading}
            title="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm font-medium px-4">
          Page {safeCurrentPage} sur {safeTotalPages}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= safeTotalPages || isLoading}
            title="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safeCurrentPage >= safeTotalPages || isLoading}
            title="Dernière page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
