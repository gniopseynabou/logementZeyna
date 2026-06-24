import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminBailleurs = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bailleurs } = useQuery({
    queryKey: ["admin-bailleurs"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("*").eq("role", "bailleur");
      if (!roles || roles.length === 0) return [];
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return roles.map(r => ({
        ...r,
        profile: profiles?.find(p => p.user_id === r.user_id),
      }));
    },
  });

  const toggleValidation = useMutation({
    mutationFn: async ({ id, validated }: { id: string; validated: boolean }) => {
      const { error } = await supabase.from("user_roles").update({ is_validated: validated }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bailleurs"] });
      toast({ title: "Statut mis à jour ✅" });
    },
  });

  const enAttente = bailleurs?.filter(b => !b.is_validated) || [];
  const valides = bailleurs?.filter(b => b.is_validated) || [];

  const renderList = (list: any[]) => (
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
                  <Button size="sm" className="bg-gradient-gold text-accent-foreground" onClick={() => toggleValidation.mutate({ id: b.id, validated: true })}>Valider</Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => toggleValidation.mutate({ id: b.id, validated: false })}>Désactiver</Button>
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
        <Tabs defaultValue="en_attente">
          <TabsList>
            <TabsTrigger value="en_attente">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="valides">Validés ({valides.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="en_attente" className="mt-4">{renderList(enAttente)}</TabsContent>
          <TabsContent value="valides" className="mt-4">{renderList(valides)}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminBailleurs;
