import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, BookOpen, TrendingUp, Percent, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [logements, reservations, paiements, bailleurs, chambres] = await Promise.all([
        supabase.from("logements").select("id, statut"),
        supabase.from("reservations").select("id, statut, montant_total"),
        supabase.from("paiements").select("id, montant, est_confirme"),
        supabase.from("user_roles").select("id, role, is_validated").eq("role", "bailleur"),
        supabase.from("chambres").select("id, est_disponible"),
      ]);

      const totalChambres = chambres.data?.length || 0;
      const chambresOccupees = chambres.data?.filter(c => !c.est_disponible).length || 0;

      return {
        totalLogements: logements.data?.length || 0,
        logValides: logements.data?.filter(l => l.statut === "valide").length || 0,
        logEnAttente: logements.data?.filter(l => l.statut === "en_attente").length || 0,
        totalReservations: reservations.data?.length || 0,
        resConfirmees: reservations.data?.filter(r => r.statut === "confirmee").length || 0,
        resEnAttente: reservations.data?.filter(r => r.statut === "en_attente").length || 0,
        revenus: paiements.data?.filter(p => p.est_confirme).reduce((s, p) => s + p.montant, 0) || 0,
        totalBailleurs: bailleurs.data?.length || 0,
        bailleursValides: bailleurs.data?.filter(b => b.is_validated).length || 0,
        bailleursEnAttente: bailleurs.data?.filter(b => !b.is_validated).length || 0,
        tauxOccupation: totalChambres > 0 ? Math.round((chambresOccupees / totalChambres) * 100) : 0,
        totalChambres,
        chambresOccupees,
      };
    },
  });

  const cards = [
    { label: "Logements", value: stats?.totalLogements || 0, sub: `${stats?.logValides || 0} validés · ${stats?.logEnAttente || 0} en attente`, icon: <Building className="h-5 w-5" />, color: "text-primary", href: "/admin/logements" },
    { label: "Réservations", value: stats?.totalReservations || 0, sub: `${stats?.resConfirmees || 0} confirmées · ${stats?.resEnAttente || 0} en attente`, icon: <BookOpen className="h-5 w-5" />, color: "text-accent", href: "/admin/reservations" },
    { label: "Revenus", value: `${(stats?.revenus || 0).toLocaleString()} F`, sub: "Total encaissé", icon: <TrendingUp className="h-5 w-5" />, color: "text-green-600", href: "/admin/paiements" },
    { label: "Bailleurs", value: stats?.totalBailleurs || 0, sub: `${stats?.bailleursValides || 0} validés · ${stats?.bailleursEnAttente || 0} en attente`, icon: <Users className="h-5 w-5" />, color: "text-primary", href: "/admin/bailleurs" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Administration Zeyna</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Link to={c.href} key={c.label}>
              <Card className="border-0 shadow-premium hover:shadow-gold transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-muted ${c.color}`}>{c.icon}</div>
                  </div>
                  <p className="text-2xl font-bold font-ui">{c.value}</p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-premium">
            <CardHeader><CardTitle className="font-serif">Actions rapides</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/admin/logements">📋 Valider les logements en attente ({stats?.logEnAttente || 0})</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/admin/bailleurs">👤 Valider les bailleurs ({stats?.bailleursEnAttente || 0})</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/admin/tarifs">💰 Gérer les tarifs Zeyna</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/admin/reservations">📖 Gérer les réservations</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/admin/paiements">💳 Superviser les paiements</Link></Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardHeader><CardTitle className="font-serif">Indicateurs de performance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Percent className="h-4 w-4" /> Taux d'occupation</span>
                <span className="font-bold font-ui">{stats?.tauxOccupation || 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${stats?.tauxOccupation || 0}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2"><Home className="h-4 w-4" /> Chambres occupées</span>
                <span className="font-bold font-ui">{stats?.chambresOccupees || 0} / {stats?.totalChambres || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Logements publiés</span>
                <span className="font-bold font-ui">{stats?.logValides || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Partenaires actifs</span>
                <span className="font-bold font-ui">{stats?.bailleursValides || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Réservations actives</span>
                <span className="font-bold font-ui">{stats?.resConfirmees || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
