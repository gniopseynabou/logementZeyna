import { invalidateGroup } from "@/lib/invalidate-helpers";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBailleurs, updateBailleurValidation, type AdminBailleur } from "@/services/admin-bailleur-service";
import { inviteUser, updateAdminUserProfile } from "@/services/admin-user-service";
import { getDemandesPartenariat, updateDemandeStatut, type DemandePartenariat, type StatutDemande } from "@/services/partenariat-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Mail, Plus, Eye, Pencil, UserX, Phone, AlertCircle, MessageSquare, Building2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/* ─────────────────────────────────────────────
   Formulaire d'édition de profil bailleur
───────────────────────────────────────────── */
const EditProfileDialog = ({
  bailleur,
  onClose,
}: {
  bailleur: AdminBailleur;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [nom, setNom] = useState(bailleur.profile?.nom ?? "");
  const [prenom, setPrenom] = useState(bailleur.profile?.prenom ?? "");
  const [telephone, setTelephone] = useState(bailleur.profile?.telephone ?? "");

  const update = useMutation({
    mutationFn: () =>
      updateAdminUserProfile(bailleur.user_id, { nom, prenom, telephone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bailleurs"] });
      toast({ title: "Profil mis à jour ✅" });
      onClose();
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); update.mutate(); }}
      className="space-y-4 mt-2"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prénom</Label>
          <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Nom</Label>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Téléphone</Label>
        <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+221 77 000 00 00" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-white" disabled={update.isPending}>
          {update.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────
   Dialog détail bailleur
───────────────────────────────────────────── */
const BailleurDetailDialog = ({
  bailleur,
  open,
  onClose,
}: {
  bailleur: AdminBailleur | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const revoke = useMutation({
    mutationFn: () => updateBailleurValidation(bailleur!.id, false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-bailleurs"] });
      toast({ title: "Accès révoqué" });
      onClose();
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (!bailleur) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setEditing(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Modifier le profil" : "Fiche bailleur"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifiez les informations de ce bailleur."
                : "Informations et actions sur ce bailleur."}
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <EditProfileDialog bailleur={bailleur} onClose={() => setEditing(false)} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-700 shrink-0">
                  {bailleur.profile?.prenom?.[0] ?? "?"}{bailleur.profile?.nom?.[0] ?? ""}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {bailleur.profile?.prenom} {bailleur.profile?.nom}
                  </p>
                  <Badge variant={bailleur.is_validated ? "default" : "secondary"} className="text-xs mt-0.5">
                    {bailleur.is_validated ? "Validé" : "En attente"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {bailleur.profile?.email || "Non renseigné"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {bailleur.profile?.telephone || "Non renseigné"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Inscrit le</span>
                  <span className="font-medium">
                    {format(new Date(bailleur.created_at), "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Rôle</span>
                  <span className="font-medium">Bailleur</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button variant="outline" className="w-full gap-2" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" /> Modifier le profil
                </Button>
                {bailleur.is_validated && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setConfirmRevoke(true)}
                  >
                    <UserX className="h-4 w-4" /> Révoquer l'accès
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer l'accès ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte de {bailleur.profile?.prenom} {bailleur.profile?.nom} sera désactivé.
              Il ne pourra plus se connecter jusqu'à réactivation manuelle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => revoke.mutate()}
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/* ─────────────────────────────────────────────
   Config statut demandes
───────────────────────────────────────────── */
const statutConfig: Record<StatutDemande, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente",  variant: "secondary"   },
  contacte:   { label: "Contacté",    variant: "default"     },
  acceptee:   { label: "Accepté",     variant: "default"     },
  rejetee:    { label: "Rejeté",      variant: "destructive" },
};

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
const AdminBailleurs = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNom, setInviteNom] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedBailleur, setSelectedBailleur] = useState<AdminBailleur | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const { data: bailleurs, isLoading, isError, error } = useQuery({
    queryKey: ["admin-bailleurs"],
    queryFn: getAdminBailleurs,
  });

  const { data: demandes = [], isLoading: demandesLoading } = useQuery({
    queryKey: ["demandes-partenariat"],
    queryFn: getDemandesPartenariat,
  });

  const toggleValidation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      updateBailleurValidation(id, validated),
    onSuccess: async () => {
      await invalidateGroup(qc, "BAILLEUR_CHANGED");
      toast({ title: "Statut mis à jour ✅" });
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const changeStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutDemande }) =>
      updateDemandeStatut(id, statut),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demandes-partenariat"] });
      toast({ title: "Statut mis à jour ✅" });
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      await inviteUser(inviteEmail, "bailleur");
      await invalidateGroup(qc, "BAILLEUR_CHANGED");
      toast({ title: "Invitation envoyée ✅", description: `Email envoyé à ${inviteEmail}` });
      setInviteEmail("");
      setInviteNom("");
      setIsInviteOpen(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInviteFromDemande = (d: DemandePartenariat) => {
    setInviteEmail(d.email || "");
    setInviteNom(`${d.prenom} ${d.nom}`);
    setIsInviteOpen(true);
  };

  const enAttente = bailleurs?.filter((b) => !b.is_validated) ?? [];
  const valides   = bailleurs?.filter((b) => b.is_validated) ?? [];
  const demandesEnAttente = demandes.filter((d) => d.statut === "en_attente").length;

  /* ── carte bailleur ── */
  const renderCard = (b: AdminBailleur) => (
    <Card key={b.id} className="border-0 shadow-premium">
      <CardContent className="p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
            {b.profile?.prenom?.[0] ?? "?"}{b.profile?.nom?.[0] ?? ""}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{b.profile?.prenom} {b.profile?.nom}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {b.profile?.email || b.profile?.telephone || "Email non disponible"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="icon" variant="ghost" onClick={() => setSelectedBailleur(b)} title="Voir détail">
            <Eye className="h-4 w-4" />
          </Button>
          {!b.is_validated ? (
            <Button
              size="sm"
              className="bg-gradient-gold text-accent-foreground"
              disabled={toggleValidation.isPending}
              onClick={() => toggleValidation.mutate({ id: b.id, validated: true })}
            >
              Valider
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              disabled={toggleValidation.isPending}
              onClick={() => toggleValidation.mutate({ id: b.id, validated: false })}
            >
              Désactiver
            </Button>
          )}
          <Badge variant={b.is_validated ? "default" : "secondary"}>
            {b.is_validated ? "Validé" : "En attente"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderList = (list: AdminBailleur[]) =>
    list.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Aucun bailleur</p>
    ) : (
      <div className="space-y-3">{list.map(renderCard)}</div>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Gestion des bailleurs</h1>
            <p className="text-muted-foreground text-sm">
              {bailleurs?.length ?? "–"} bailleur(s) - {demandesEnAttente} demande(s) en attente
            </p>
          </div>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white gap-2">
                <Plus className="h-4 w-4" /> Inviter un bailleur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Envoyer une invitation</DialogTitle>
                <DialogDescription>
                  {inviteNom
                    ? `Invitation pour ${inviteNom} - un lien d'activation sera envoyé.`
                    : "Un lien d'inscription unique sera envoyé à cette adresse email."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Email du bailleur</Label>
                  <Input
                    type="email"
                    placeholder="email@exemple.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  disabled={inviteLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {inviteLoading ? "Envoi en cours..." : "Envoyer l'invitation"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Contenu principal ── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive opacity-60" />
              <p>Impossible de charger les bailleurs.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Erreur inattendue."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="en_attente">
            <TabsList>
              <TabsTrigger value="en_attente">En attente ({enAttente.length})</TabsTrigger>
              <TabsTrigger value="valides">Validés ({valides.length})</TabsTrigger>
              <TabsTrigger value="demandes" className="gap-1.5">
                Demandes
                {demandesEnAttente > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {demandesEnAttente}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Bailleurs en attente */}
            <TabsContent value="en_attente" className="mt-4">{renderList(enAttente)}</TabsContent>

            {/* Bailleurs validés */}
            <TabsContent value="valides" className="mt-4">{renderList(valides)}</TabsContent>

            {/* Demandes de partenariat */}
            <TabsContent value="demandes" className="mt-4">
              {demandesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
                </div>
              ) : demandes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Aucune demande de partenariat</p>
                  <p className="text-xs mt-1">
                    Les demandes soumises via la page publique apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {demandes.map((d) => (
                    <Card key={d.id} className="border-0 shadow-premium">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                          {/* Infos contact */}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="font-semibold">{d.prenom} {d.nom}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {d.telephone}
                              </p>
                              {d.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {d.email}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                {d.ville && <span>📍 {d.ville}</span>}
                                {d.nombre_logements && (
                                  <span>🏠 {d.nombre_logements} logement(s)</span>
                                )}
                                <span>
                                  📅 {format(new Date(d.created_at!), "dd MMM yyyy", { locale: fr })}
                                </span>
                              </div>
                              {d.message && (
                                <p className="text-sm text-foreground/70 bg-muted/50 rounded-lg p-2 mt-2 italic">
                                  « {d.message} »
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <Badge variant={statutConfig[d.statut ?? "en_attente"].variant}>
                              {statutConfig[d.statut ?? "en_attente"].label}
                            </Badge>
                            <Select
                              value={d.statut ?? "en_attente"}
                              onValueChange={(v) =>
                                changeStatut.mutate({ id: d.id!, statut: v as StatutDemande })
                              }
                            >
                              <SelectTrigger className="h-8 text-xs w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="contacte">Contacté</SelectItem>
                                <SelectItem value="acceptee">Accepté</SelectItem>
                                <SelectItem value="rejetee">Rejeté</SelectItem>
                              </SelectContent>
                            </Select>
                            {d.email && (
                              <Button
                                size="sm"
                                className="gap-2 bg-accent hover:bg-accent/90 text-white"
                                onClick={() => handleInviteFromDemande(d)}
                              >
                                <Send className="h-3.5 w-3.5" /> Inviter
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BailleurDetailDialog
        bailleur={selectedBailleur}
        open={!!selectedBailleur}
        onClose={() => setSelectedBailleur(null)}
      />
    </DashboardLayout>
  );
};

export default AdminBailleurs;
