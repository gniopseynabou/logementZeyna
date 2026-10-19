import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { invalidateGroup } from "@/lib/invalidate-helpers";
import {
  updateAdminLogement,
  saveAdminChambre,
  deleteAdminChambre,
  uploadAdminLogementImages,
} from "@/services/logement-service";
import {
  Loader2,
  Plus,
  Trash2,
  X,
  Upload,
  Home,
  BedDouble,
  Image as ImageIcon,
} from "lucide-react";

export interface LogementChambre {
  id?: string;
  nom: string;
  nombre_personnes: number;
  prix_bailleur: number;
  prix_zeyna: number;
  marge?: number;
  caution: number;
  description?: string;
  est_disponible: boolean;
  mode_reservation?: "individuel" | "collectif";
  tarification_par_personne?: boolean;
}

export interface EditableLogement {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  type: string;
  description: string | null;
  conditions_electricite: string | null;
  images: string[] | null;
  statut: "en_attente" | "valide" | "rejete";
  chambres: LogementChambre[];
}

interface EditLogementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logement: EditableLogement | null;
  onSaved?: () => void;
}

export const EditLogementDialog = ({
  open,
  onOpenChange,
  logement,
  onSaved,
}: EditLogementDialogProps) => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    ville: "Saint-Louis",
    type: "résidence",
    description: "",
    conditions_electricite: "",
  });

  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [chambres, setChambres] = useState<LogementChambre[]>([]);
  const [deletedChambreIds, setDeletedChambreIds] = useState<string[]>([]);

  useEffect(() => {
    if (logement) {
      setFormData({
        nom: logement.nom || "",
        adresse: logement.adresse || "",
        ville: logement.ville || "Saint-Louis",
        type: logement.type || "résidence",
        description: logement.description || "",
        conditions_electricite: logement.conditions_electricite || "",
      });
      setCurrentImages(logement.images || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setDeletedChambreIds([]);
      setChambres(
        (logement.chambres || []).map((c: any) => ({
          id: c.id,
          nom: c.nom || "Chambre",
          nombre_personnes: c.nombre_personnes || 1,
          prix_bailleur: c.prix_bailleur || 0,
          prix_zeyna: c.prix_zeyna || 0,
          marge: (c.prix_zeyna || 0) - (c.prix_bailleur || 0),
          caution: c.caution || 0,
          description: c.description || "",
          est_disponible: c.est_disponible ?? true,
          mode_reservation: c.mode_reservation || "individuel",
          tarification_par_personne: !!c.tarification_par_personne,
        }))
      );
    }
  }, [logement]);

  const handleAddChambre = () => {
    const nextIndex = chambres.length + 1;
    setChambres([
      ...chambres,
      {
        nom: `Chambre ${nextIndex}`,
        nombre_personnes: 1,
        prix_bailleur: 20000,
        prix_zeyna: 22000,
        marge: 2000,
        caution: 20000,
        description: "",
        est_disponible: true,
        mode_reservation: "individuel",
        tarification_par_personne: false,
      },
    ]);
  };

  const handleRemoveChambre = (index: number) => {
    const target = chambres[index];
    if (target.id) {
      setDeletedChambreIds((prev) => [...prev, target.id!]);
    }
    setChambres(chambres.filter((_, i) => i !== index));
  };

  const handleUpdateChambre = (
    index: number,
    field: keyof LogementChambre,
    value: any
  ) => {
    const updated = [...chambres];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "prix_bailleur" || field === "prix_zeyna") {
      const pBailleur = field === "prix_bailleur" ? Number(value) : updated[index].prix_bailleur;
      const pZeyna = field === "prix_zeyna" ? Number(value) : updated[index].prix_zeyna;
      updated[index].marge = pZeyna - pBailleur;
    }

    setChambres(updated);
  };

  const handleSelectNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (currentImages.length + newImageFiles.length + files.length > 8) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas associer plus de 8 photos par logement.",
        variant: "destructive",
      });
      return;
    }

    setNewImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveCurrentImage = (index: number) => {
    setCurrentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!logement) return;
    if (!formData.nom.trim()) {
      toast({ title: "Le nom du logement est obligatoire", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // 1. Upload new images if any
      let uploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        uploadedUrls = await uploadAdminLogementImages(logement.id, newImageFiles);
      }
      const finalImages = [...currentImages, ...uploadedUrls];

      // 2. Update logement base info
      await updateAdminLogement(logement.id, {
        nom: formData.nom,
        adresse: formData.adresse,
        ville: formData.ville,
        type: formData.type,
        description: formData.description,
        conditions_electricite: formData.conditions_electricite,
        images: finalImages,
      });

      // 3. Delete removed chambres
      for (const chambreId of deletedChambreIds) {
        await deleteAdminChambre(chambreId);
      }

      // 4. Upsert/save chambres
      for (const ch of chambres) {
        await saveAdminChambre({
          id: ch.id,
          logement_id: logement.id,
          nom: ch.nom,
          nombre_personnes: Number(ch.nombre_personnes) || 1,
          prix_bailleur: Number(ch.prix_bailleur) || 0,
          prix_zeyna: Number(ch.prix_zeyna) || 0,
          marge: (Number(ch.prix_zeyna) || 0) - (Number(ch.prix_bailleur) || 0),
          caution: Number(ch.caution) || 0,
          description: ch.description || "",
          est_disponible: ch.est_disponible,
          mode_reservation: ch.mode_reservation || "individuel",
          tarification_par_personne: ch.tarification_par_personne ?? false,
        });
      }

      // 5. Invalidate caches
      await invalidateGroup(qc, "LOGEMENT_CHANGED");

      toast({
        title: "Logement mis à jour avec succès ✅",
        description: "Les informations, chambres et photos ont été enregistrées.",
      });

      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!logement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[92vh] flex flex-col p-0 rounded-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
              <Home className="h-5 w-5 text-accent shrink-0" />
              <span className="truncate">Modifier : {logement.nom}</span>
            </DialogTitle>
            <Badge variant={logement.statut === "valide" ? "default" : "secondary"} className="shrink-0">
              {logement.statut === "valide" ? "Validé" : logement.statut === "rejete" ? "Rejeté" : "En attente"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 h-auto p-1 gap-1">
              <TabsTrigger value="general" className="flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm">
                <Home className="h-4 w-4 shrink-0" />
                <span className="truncate">Général</span>
              </TabsTrigger>
              <TabsTrigger value="chambres" className="flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm">
                <BedDouble className="h-4 w-4 shrink-0" />
                <span className="truncate">Chambres ({chambres.length})</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm">
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">Photos ({currentImages.length + newImageFiles.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: GENERAL */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom du logement *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="ex: Résidence Teranga"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type">Type de logement</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Choisir le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="résidence">Résidence</SelectItem>
                      <SelectItem value="appartement">Appartement</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="chambre">Chambre individuelle</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ville">Ville</Label>
                  <Select
                    value={formData.ville}
                    onValueChange={(val) => setFormData({ ...formData, ville: val })}
                  >
                    <SelectTrigger id="ville">
                      <SelectValue placeholder="Choisir la ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                      <SelectItem value="Dakar">Dakar</SelectItem>
                      <SelectItem value="Thiès">Thiès</SelectItem>
                      <SelectItem value="Mbour">Mbour</SelectItem>
                      <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adresse">Adresse complète</Label>
                  <Input
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="ex: Sanar, près du campus"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conditions">Conditions électricité / eau</Label>
                <Input
                  id="conditions"
                  value={formData.conditions_electricite}
                  onChange={(e) =>
                    setFormData({ ...formData, conditions_electricite: e.target.value })
                  }
                  placeholder="ex: Électricité compteur Woyofal partagé, eau incluse"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails sur le quartier, les équipements, les commodités..."
                />
              </div>
            </TabsContent>

            {/* TAB 2: CHAMBRES */}
            <TabsContent value="chambres" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Gestion des unités / chambres</h4>
                  <p className="text-xs text-muted-foreground">
                    Configurez le prix bailleur, le prix Zeyna, et la disponibilité de chaque chambre.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddChambre}
                  className="gap-1.5 border-dashed"
                >
                  <Plus className="h-4 w-4" /> Ajouter une chambre
                </Button>
              </div>

              {chambres.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed text-muted-foreground">
                  <p>Aucune chambre enregistrée.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    onClick={handleAddChambre}
                    className="text-accent"
                  >
                    + Créer une première chambre
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chambres.map((chambre, idx) => (
                    <div
                      key={chambre.id || `new-${idx}`}
                      className="border rounded-xl p-4 bg-muted/20 space-y-3 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">#{idx + 1}</span>
                          <Input
                            value={chambre.nom}
                            onChange={(e) => handleUpdateChambre(idx, "nom", e.target.value)}
                            placeholder="Nom de la chambre"
                            className="h-8 max-w-[200px] font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-background px-2.5 py-1 rounded-md border text-xs">
                            <span className={chambre.est_disponible ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                              {chambre.est_disponible ? "Disponible" : "Occupé / Indispo"}
                            </span>
                            <Switch
                              checked={chambre.est_disponible}
                              onCheckedChange={(checked) =>
                                handleUpdateChambre(idx, "est_disponible", checked)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveChambre(idx)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Supprimer cette chambre"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <Label className="text-xs">Capacité (pers.)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={chambre.nombre_personnes}
                            onChange={(e) =>
                              handleUpdateChambre(idx, "nombre_personnes", Number(e.target.value))
                            }
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Mode réservation</Label>
                          <Select
                            value={chambre.mode_reservation || "individuel"}
                            onValueChange={(val: "individuel" | "collectif") =>
                              handleUpdateChambre(idx, "mode_reservation", val)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individuel">Individuelle (par place)</SelectItem>
                              <SelectItem value="collectif">Collective (tout le groupe)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">Type de tarification</Label>
                          <Select
                            value={chambre.tarification_par_personne ? "personne" : "chambre"}
                            onValueChange={(val) =>
                              handleUpdateChambre(idx, "tarification_par_personne", val === "personne")
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chambre">Prix fixe (chambre entière)</SelectItem>
                              <SelectItem value="personne">Prix par personne (loyer & caution / pers)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">
                            Prix total Bailleur (FCFA)
                          </Label>
                          <Input
                            type="number"
                            step="500"
                            value={chambre.prix_bailleur}
                            onChange={(e) =>
                              handleUpdateChambre(idx, "prix_bailleur", Number(e.target.value))
                            }
                            className="h-8 text-xs"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Loyer total dû au bailleur
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-accent">
                            Prix Zeyna (FCFA){chambre.tarification_par_personne ? " /pers" : " total"}
                          </Label>
                          <Input
                            type="number"
                            step="500"
                            value={chambre.prix_zeyna}
                            onChange={(e) =>
                              handleUpdateChambre(idx, "prix_zeyna", Number(e.target.value))
                            }
                            className="h-8 text-xs font-semibold border-accent"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            {chambre.tarification_par_personne
                              ? `Total Zeyna : ${((chambre.prix_zeyna || 0) * (chambre.nombre_personnes || 1)).toLocaleString()} F`
                              : "Montant payé par le locataire"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">
                            Caution (FCFA){chambre.tarification_par_personne ? " /pers" : " totale"}
                          </Label>
                          <Input
                            type="number"
                            step="500"
                            value={chambre.caution}
                            onChange={(e) =>
                              handleUpdateChambre(idx, "caution", Number(e.target.value))
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
                        <span>
                          Marge ZEYNA totale à pleine capacité :{" "}
                          <strong className={
                            chambre.tarification_par_personne
                              ? (((chambre.prix_zeyna || 0) * (chambre.nombre_personnes || 1)) - (chambre.prix_bailleur || 0)) >= 0
                                ? "text-emerald-600"
                                : "text-destructive"
                              : ((chambre.prix_zeyna || 0) - (chambre.prix_bailleur || 0)) >= 0
                              ? "text-emerald-600"
                              : "text-destructive"
                          }>
                            {(
                              chambre.tarification_par_personne
                                ? ((chambre.prix_zeyna || 0) * (chambre.nombre_personnes || 1)) - (chambre.prix_bailleur || 0)
                                : (chambre.prix_zeyna || 0) - (chambre.prix_bailleur || 0)
                            ).toLocaleString()} FCFA
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: PHOTOS */}
            <TabsContent value="photos" className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Galerie photos</h4>
                <p className="text-xs text-muted-foreground">
                  Supprimez les photos obsolètes ou importez-en de nouvelles.
                </p>
              </div>

              {/* Photos existantes */}
              {currentImages.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Photos actuelles ({currentImages.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentImages.map((url, idx) => (
                      <div key={url} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                        <img
                          src={url}
                          alt={`Logement ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCurrentImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-destructive transition"
                          title="Supprimer la photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles photos à uploader */}
              {newImagePreviews.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-accent">
                    Nouvelles photos à ajouter ({newImagePreviews.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {newImagePreviews.map((preview, idx) => (
                      <div key={preview} className="relative group rounded-lg overflow-hidden border-2 border-accent aspect-video bg-muted">
                        <img
                          src={preview}
                          alt={`Nouvelle photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-destructive transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload trigger */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent transition">
                <input
                  type="file"
                  id="admin-image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleSelectNewImages}
                  className="hidden"
                />
                <label
                  htmlFor="admin-image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="p-3 rounded-full bg-accent/10 text-accent">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-accent hover:underline">
                      Cliquez pour ajouter des photos
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      JPG, PNG, WEBP (Max 8 photos au total)
                    </p>
                  </div>
                </label>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-3.5 sm:p-4 border-t bg-muted/10 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white gap-2 min-w-[140px] w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
