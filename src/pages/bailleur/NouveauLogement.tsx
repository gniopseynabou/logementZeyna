import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLandlordLogement } from "@/services/logement-service";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, ImageIcon } from "lucide-react";

interface ChambreForm {
  nom: string;
  nombre_personnes: number;
  prix_bailleur: number;
  caution: number;
  description: string;
}

const NouveauLogement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    conditions_electricite: "Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.",
    latitude: "",
    longitude: "",
  });

  const [chambres, setChambres] = useState<ChambreForm[]>([
    { nom: "Chambre 1", nombre_personnes: 1, prix_bailleur: 15000, caution: 15000, description: "" },
  ]);

  const addChambre = () => {
    setChambres([...chambres, { nom: `Chambre ${chambres.length + 1}`, nombre_personnes: 1, prix_bailleur: 15000, caution: 15000, description: "" }]);
  };

  const removeChambre = (index: number) => {
    if (chambres.length > 1) setChambres(chambres.filter((_, i) => i !== index));
  };

  const updateChambre = (index: number, key: keyof ChambreForm, value: any) => {
    const updated = [...chambres];
    (updated[index] as any)[key] = value;
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
    if (!user) return;

    setSaving(true);

    try {
      await createLandlordLogement({
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
      });

      toast({ title: "Logement soumis ✅", description: "Votre logement sera visible après validation par l'administrateur Zeyna." });
      navigate("/bailleur/logements");
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
        <h1 className="font-serif text-2xl font-bold">Ajouter un logement</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="résidence">Résidence</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="chambre">Chambre</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="appartement">Appartement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Décrivez votre logement..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Conditions d'électricité</Label>
                <Textarea value={form.conditions_electricite} onChange={(e) => setForm({ ...form, conditions_electricite: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
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

          {/* Image Upload */}
          <Card className="border-0 shadow-premium">
            <CardHeader><CardTitle className="font-serif text-lg">Photos du logement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="grid grid-cols-2 sm:grid-cols-2 sm:grid-cols-3 gap-3">
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
              <p className="text-xs text-muted-foreground">Maximum 6 photos. Formats acceptés : JPG, PNG, WebP</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg">
                {form.type === "studio" || form.type === "appartement" ? "Unités" : "Chambres"}
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addChambre}><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {chambres.map((c, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {form.type === "studio" || form.type === "appartement" ? `Unité ${i + 1}` : `Chambre ${i + 1}`}
                    </h4>
                    {chambres.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeChambre(i)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nom</Label>
                      <Input value={c.nom} onChange={(e) => updateChambre(i, "nom", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nb personnes</Label>
                      <Input type="number" min={1} value={c.nombre_personnes} onChange={(e) => updateChambre(i, "nombre_personnes", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix bailleur (FCFA)</Label>
                      <Input type="number" value={c.prix_bailleur} onChange={(e) => updateChambre(i, "prix_bailleur", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Caution (FCFA)</Label>
                      <Input type="number" value={c.caution} onChange={(e) => updateChambre(i, "caution", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input placeholder="Description de la chambre" value={c.description} onChange={(e) => updateChambre(i, "description", e.target.value)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-gradient-gold text-accent-foreground shadow-gold" disabled={saving || uploading}>
            {uploading ? "Upload des images..." : saving ? "Envoi en cours..." : "Soumettre le logement"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Le logement sera visible après validation par l'administrateur</p>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NouveauLogement;
