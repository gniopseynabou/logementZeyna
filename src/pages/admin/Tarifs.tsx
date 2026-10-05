import { invalidateGroups } from "@/lib/invalidate-helpers";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getValidatedLogementsForTariffs, updateRoomTariff } from "@/services/logement-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminTarifs = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: logements, isLoading, isError, error } = useQuery({
    queryKey: ["admin-tarifs-logements"],
    queryFn: getValidatedLogementsForTariffs,
  });

  const updatePrix = useMutation({
    mutationFn: ({ chambreId, prix_zeyna, marge }: { chambreId: string; prix_zeyna: number; marge: number }) =>
      updateRoomTariff(chambreId, prix_zeyna, marge),
    onSuccess: async () => {
      await invalidateGroups(qc, ["LOGEMENT_CHANGED"]);
      toast({ title: "Prix mis à jour ✅" });
    },
    onError: (mutationError) => {
      toast({
        title: "Erreur de mise à jour",
        description: mutationError.message,
        variant: "destructive",
      });
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrix, setEditPrix] = useState(0);

  const handleSave = (chambre: any) => {
    const marge = editPrix - chambre.prix_bailleur;
    updatePrix.mutate({ chambreId: chambre.id, prix_zeyna: editPrix, marge });
    setEditingId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Gestion des tarifs</h1>
          <p className="text-muted-foreground">Définissez le prix Zeyna pour chaque chambre</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-40 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <p>Impossible de charger les tarifs.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : (!logements || logements.length === 0) ? (
          <Card className="border-0 shadow-premium"><CardContent className="py-12 text-center text-muted-foreground">Aucun logement validé</CardContent></Card>
        ) : (
          logements.map(l => (
            <Card key={l.id} className="border-0 shadow-premium">
              <CardHeader>
                <CardTitle className="font-serif text-lg">{l.nom}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chambre</TableHead>
                        <TableHead>Personnes</TableHead>
                        <TableHead>Prix bailleur</TableHead>
                        <TableHead>Prix Zeyna</TableHead>
                        <TableHead>Marge</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((l as any).chambres || []).map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.nom}</TableCell>
                          <TableCell>{c.nombre_personnes}</TableCell>
                          <TableCell className="font-ui">{c.prix_bailleur.toLocaleString()} F</TableCell>
                          <TableCell>
                            {editingId === c.id ? (
                              <Input type="number" value={editPrix} onChange={(e) => setEditPrix(Number(e.target.value))} className="w-28" />
                            ) : (
                              <span className="font-ui font-bold text-accent">{c.prix_zeyna ? `${c.prix_zeyna.toLocaleString()} F` : "Non défini"}</span>
                            )}
                          </TableCell>
                          <TableCell className="font-ui">
                            {c.marge ? `${c.marge.toLocaleString()} F` : "-"}
                          </TableCell>
                          <TableCell>
                            {editingId === c.id ? (
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-gradient-gold text-accent-foreground" onClick={() => handleSave(c)}>Sauver</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => { setEditingId(c.id); setEditPrix(c.prix_zeyna || c.prix_bailleur); }}>Modifier</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTarifs;
