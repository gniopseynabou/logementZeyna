import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBailleurs, updateBailleurValidation, type AdminBailleur } from "@/services/admin-bailleur-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminBailleurs = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bailleurs, isLoading, isError, error } = useQuery({
    queryKey: ["admin-bailleurs"],
    queryFn: getAdminBailleurs,
  });

  const toggleValidation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      updateBailleurValidation(id, validated),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bailleurs"] });
      toast({ title: "Statut mis à jour ✅" });
    },
    onError: (mutationError) => {
      toast({
        title: "Erreur de mise à jour",
        description: mutationError.message,
        variant: "destructive",
      });
    },
  });

  const enAttente = bailleurs?.filter(b => !b.is_validated) || [];
  const valides = bailleurs?.filter(b => b.is_validated) || [];

  const renderList = (list: AdminBailleur[]) => (
    list.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Aucun bailleur</p>
    ) : (
      <div className="space-y-4">
        {list.map((b) => (
          <Card key={b.id} className="border-0 shadow-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">{b.profile?.prenom} {b.profile?.nom}</p>
                <p className="text-sm text-muted-foreground">{b.profile?.telephone || "Pas de téléphone"}</p>
              </div>
              <div className="flex items-center gap-2">
                {!b.is_validated ? (
                  <Button size="sm" className="bg-gradient-gold text-accent-foreground" disabled={toggleValidation.isPending} onClick={() => toggleValidation.mutate({ id: b.id, validated: true })}>Valider</Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-destructive" disabled={toggleValidation.isPending} onClick={() => toggleValidation.mutate({ id: b.id, validated: false })}>Désactiver</Button>
                )}
                <Badge variant={b.is_validated ? "default" : "secondary"}>{b.is_validated ? "Validé" : "En attente"}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-serif text-2xl font-bold">Gestion des bailleurs</h1>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <p>Impossible de charger les bailleurs.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : (
        <Tabs defaultValue="en_attente">
          <TabsList>
            <TabsTrigger value="en_attente">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="valides">Validés ({valides.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="en_attente" className="mt-4">{renderList(enAttente)}</TabsContent>
          <TabsContent value="valides" className="mt-4">{renderList(valides)}</TabsContent>
        </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBailleurs;
