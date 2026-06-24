import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";

const AdminLogements = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: logements, isLoading } = useQuery({
    queryKey: ["admin-all-logements"],
    queryFn: async () => {
      const { data } = await supabase.from("logements").select("*, chambres(*)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateStatut = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const { error } = await supabase.from("logements").update({ statut: statut as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-all-logements"] });
      toast({ title: "Statut mis à jour ✅" });
    },
  });

  const enAttente = logements?.filter(l => l.statut === "en_attente") || [];
  const valides = logements?.filter(l => l.statut === "valide") || [];
  const rejetes = logements?.filter(l => l.statut === "rejete") || [];

  const renderList = (list: any[]) => (
    list.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Aucun logement</p>
    ) : (
      <div className="space-y-4">
        {list.map(l => (
          <Card key={l.id} className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg">{l.nom}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {l.adresse}, {l.ville}</div>
                  <p className="text-sm text-muted-foreground mt-1">{l.chambres?.length || 0} chambre(s) • {l.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {l.statut === "en_attente" && (
                    <>
                      <Button size="sm" className="bg-gradient-gold text-accent-foreground" onClick={() => updateStatut.mutate({ id: l.id, statut: "valide" })}>Valider</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatut.mutate({ id: l.id, statut: "rejete" })}>Rejeter</Button>
                    </>
                  )}
                  {l.statut === "rejete" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatut.mutate({ id: l.id, statut: "valide" })}>Réactiver</Button>
                  )}
                  <Badge variant={l.statut === "valide" ? "default" : l.statut === "rejete" ? "destructive" : "secondary"}>
                    {l.statut === "valide" ? "Validé" : l.statut === "rejete" ? "Rejeté" : "En attente"}
                  </Badge>
                </div>
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
        <h1 className="font-serif text-2xl font-bold">Gestion des logements</h1>

        <Tabs defaultValue="en_attente">
          <TabsList>
            <TabsTrigger value="en_attente">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="valides">Validés ({valides.length})</TabsTrigger>
            <TabsTrigger value="rejetes">Rejetés ({rejetes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="en_attente" className="mt-4">{renderList(enAttente)}</TabsContent>
          <TabsContent value="valides" className="mt-4">{renderList(valides)}</TabsContent>
          <TabsContent value="rejetes" className="mt-4">{renderList(rejetes)}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogements;
