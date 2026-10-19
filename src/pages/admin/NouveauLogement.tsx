import { invalidateGroup } from "@/lib/invalidate-helpers";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLandlordLogement } from "@/services/logement-service";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, ArrowLeft, CheckCircle, Shield, Phone, Mail, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChambreForm {
  nom: string;
  nombre_personnes: number;
  prix_bailleur: number;
  prix_zeyna: number;
  marge: number;
  caution: number;
  description: string;
  mode_reservation: "individuel" | "collectif";
  tarification_par_personne: boolean;
}

const AdminNouveauLogement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    ville: "Saint-Louis",
    type: "résidence",
    description: "",
    conditions_electricite: "Éclairage et chauffe-eau inclus.",
    latitude: "",
    longitude: "",
  });

  const [proprietaire, setProprietaire] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
  });

  const [chambres, setChambres] = useState<ChambreForm[]>([
    {
      nom: "Chambre 1",
      nombre_personnes: 1,
      prix_bailleur: 15000,
      prix_zeyna: 16500,
      marge: 1500,
      caution: 15000,
      description: "",
      mode_reservation: "individuel",
      tarification_par_personne: false,
    },
  ]);

  const addChambre = () => {
    setChambres([...chambres, {
      nom: `Chambre ${chambres.length + 1}`,
      nombre_personnes: 1,
      prix_bailleur: 15000,
      prix_zeyna: 16500,
      marge: 1500,
      caution: 15000,
      description: "",
      mode_reservation: "individuel",
      tarification_par_personne: false,
    }]);
  };

  const removeChambre = (index: number) => {
    if (chambres.length > 1) setChambres(chambres.filter((_, i) => i !== index));
  };

  const updateChambre = (index: number, key: keyof ChambreForm, value: string | number) => {
    const updated = [...chambres];
    (updated[index] as any)[key] = value;
    
    // Auto-calcul de la marge si prix_bailleur ou prix_zeyna change
    if (key === "prix_bailleur" || key === "prix_zeyna") {
      updated[index].marge = updated[index].prix_zeyna - updated[index].prix_bailleur;
    }
    
    setChambres(updated);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 6) {
      toast({ title: "Maximum 6 images", variant: "destructive" });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proprietaire.prenom.trim() || !proprietaire.nom.trim() || !proprietaire.telephone.trim()) {
      toast({
        title: "Coordonnées du propriétaire requises",
        description: "Veuillez renseigner le prénom, le nom et le numéro de téléphone du propriétaire.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const logement = await createLandlordLogement({
        nom: form.nom,
        adresse: form.adresse,
        ville: form.ville,
        type: form.type,
        description: form.description,
        conditionsElectricite: form.conditions_electricite,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        landlordId: user.id,
        chambres,
        images: imageFiles,
        onUploadingImages: setUploading,
        proprietaire: {
          prenom: proprietaire.prenom.trim(),
          nom: proprietaire.nom.trim(),
          telephone: proprietaire.telephone.trim(),
          email: proprietaire.email.trim() || undefined,
        },
      });

      // L'admin valide le logement immédiatement
      await supabase
        .from("logements")
        .update({ statut: "valide" })
        .eq("id", logement.id);

      // Invalider tous les caches liés aux logements
      await invalidateGroup(qc, "LOGEMENT_CHANGED");

      toast({
        title: "Logement ajouté et validé ✅",
        description: "Le logement est immédiatement visible dans le catalogue.",
      });
      navigate("/admin/logements");
    } catch (error) {
      toast({
        title: "Erreur lors de la création",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/logements")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold">Ajouter un logement</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="h-3.5 w-3.5 text-accent" />
              Ce logement sera validé et publié immédiatement
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du propriétaire (Usage Interne Administrateur) */}
          <Card className="border-0 shadow-premium border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Informations du Propriétaire
                </CardTitle>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Confidentiel Admin
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ces coordonnées sont strictement réservées aux administrateurs pour joindre le propriétaire (disponibilités, réservations, incidents). Elles ne sont jamais affichées aux étudiants ni au public.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proprio-prenom">Prénom du propriétaire *</Label>
                  <Input
                    id="proprio-prenom"
                    placeholder="Ex: Ibrahima"
                    value={proprietaire.prenom}
                    onChange={(e) => setProprietaire({ ...proprietaire, prenom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proprio-nom">Nom du propriétaire *</Label>
                  <Input
                    id="proprio-nom"
                    placeholder="Ex: Sarr"
                    value={proprietaire.nom}
                    onChange={(e) => setProprietaire({ ...proprietaire, nom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proprio-tel" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-accent" /> Téléphone *
                  </Label>
                  <Input
                    id="proprio-tel"
                    placeholder="Ex: +221 77 123 45 67"
                    value={proprietaire.telephone}
                    onChange={(e) => setProprietaire({ ...proprietaire, telephone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proprio-email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Adresse e-mail (facultative)
                  </Label>
                  <Input
                    id="proprio-email"
                    type="email"
                    placeholder="Ex: proprietaire@email.com"
                    value={proprietaire.email}
                    onChange={(e) => setProprietaire({ ...proprietaire, email: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card className="border-0 shadow-premium">
            <CardHeader><CardTitle className="font-serif text-lg">Informations du logement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du logement *</Label>
                <Input placeholder="Ex: Résidence Sanar" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Adresse complète *</Label>
                <Input placeholder="Ex: Quartier Sanar, près de l'UGB" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type de bien</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="résidence">Résidence</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="chambre">Chambre</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Décrivez le logement..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Conditions d'électricité</Label>
                <Textarea value={form.conditions_electricite} onChange={(e) => setForm({ ...form, conditions_electricite: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude (GPS)</Label>
                  <Input type="number" step="any" placeholder="16.0617" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude (GPS)</Label>
                  <Input type="number" step="any" placeholder="-16.4350" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-0 shadow-premium">
            <CardHeader><CardTitle className="font-serif text-lg">Photos du logement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      onClick={() => removeImage(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 6 && (
                  <button
                    type="button"
                    className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Maximum 6 photos. Formats : JPG, PNG, WebP</p>
            </CardContent>
          </Card>

          {/* Chambres / Unités */}
          <Card className="border-0 shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg">
                {form.type === "studio" || form.type === "appartement" ? "Unités" : "Chambres / Espaces"}
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addChambre}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {chambres.map((c, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {form.type === "studio" ? `Unité ${i + 1}` : `Chambre ${i + 1}`}
                    </h4>
                    {chambres.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeChambre(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nom</Label>
                      <Input value={c.nom} onChange={(e) => updateChambre(i, "nom", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Capacité max (personnes)</Label>
                      <Input type="number" min={1} value={c.nombre_personnes} onChange={(e) => updateChambre(i, "nombre_personnes", Number(e.target.value))} />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Mode de réservation</Label>
                      <Select
                        value={c.mode_reservation}
                        onValueChange={(val: "individuel" | "collectif") => {
                          const updated = [...chambres];
                          updated[i].mode_reservation = val;
                          setChambres(updated);
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individuel">Réservation Individuelle (place par place)</SelectItem>
                          <SelectItem value="collectif">Réservation Collective (tout le groupe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Type de tarification</Label>
                      <Select
                        value={c.tarification_par_personne ? "personne" : "chambre"}
                        onValueChange={(val) => {
                          const updated = [...chambres];
                          updated[i].tarification_par_personne = (val === "personne");
                          setChambres(updated);
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chambre">Prix fixe (pour la chambre entière)</SelectItem>
                          <SelectItem value="personne">Prix par personne (loyer & caution / pers)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        Prix total bailleur (FCFA)
                      </Label>
                      <Input
                        type="number"
                        value={c.prix_bailleur}
                        onChange={(e) => updateChambre(i, "prix_bailleur", Number(e.target.value))}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Loyer total reversé au bailleur pour la chambre entière
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-accent">
                        Loyer Zeyna (FCFA) {c.tarification_par_personne ? "/ personne" : "total"}
                      </Label>
                      <Input
                        type="number"
                        value={c.prix_zeyna}
                        onChange={(e) => updateChambre(i, "prix_zeyna", Number(e.target.value))}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {c.tarification_par_personne
                          ? `Soit ${(c.prix_zeyna * c.nombre_personnes).toLocaleString()} FCFA au total si complet`
                          : "Prix total payé par le locataire"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        Caution (FCFA) {c.tarification_par_personne ? "/ personne" : "totale"}
                      </Label>
                      <Input
                        type="number"
                        value={c.caution}
                        onChange={(e) => updateChambre(i, "caution", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input placeholder="Description optionnelle" value={c.description} onChange={(e) => updateChambre(i, "description", e.target.value)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base"
            disabled={saving || uploading}
          >
            {uploading ? "Upload des photos en cours..." : saving ? "Publication en cours..." : "Publier le logement"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminNouveauLogement;
