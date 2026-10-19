import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createReservation, getLogementDetail } from "@/services/logement-service";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Zap, ArrowLeft, Shield, ChevronLeft, ChevronRight, UserCheck, Calendar, Info } from "lucide-react";
import logement1 from "@/assets/logement-1.jpg";
import logement2 from "@/assets/logement-2.jpg";
import logement3 from "@/assets/logement-3.jpg";

import SEOHead from "@/components/SEOHead";

const fallbackImages = [logement1, logement2, logement3];

const LogementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [selectedChambre, setSelectedChambre] = useState<string | null>(null);
  const [selectedPlaces, setSelectedPlaces] = useState<number>(1);
  const [dateDebut, setDateDebut] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [dateFin, setDateFin] = useState<string>("");
  const [imgIndex, setImgIndex] = useState(0);
  const [reserving, setReserving] = useState(false);

  const { data: logement, isLoading } = useQuery({
    queryKey: ["logement-detail", id],
    queryFn: () => getLogementDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!logement) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="font-serif text-2xl font-bold">Logement non trouvé</h1>
          <Button asChild className="mt-4"><Link to="/logements">Retour aux logements</Link></Button>
        </div>
      </div>
    );
  }

  const images = logement.images && logement.images.length > 0 ? logement.images : fallbackImages;
  const chambres = logement.chambres || [];
  const currentChambre = chambres.find((c: any) => c.id === selectedChambre);

  const isParPersonne = !!currentChambre?.tarification_par_personne;
  const isCollectif = currentChambre?.mode_reservation === "collectif";
  const capaciteChambre = currentChambre?.nombre_personnes || 1;

  // Calculs détaillés
  const effectivePlaces = isCollectif ? capaciteChambre : Math.min(selectedPlaces, capaciteChambre);
  const loyerUnitaire = currentChambre?.prix_zeyna || currentChambre?.prix_bailleur || 0;
  const cautionUnitaire = currentChambre?.caution || 0;

  const loyerTotal = isParPersonne ? loyerUnitaire * effectivePlaces : loyerUnitaire;
  const cautionTotale = isParPersonne ? cautionUnitaire * effectivePlaces : cautionUnitaire;
  // À la réservation / validation : seul le dépôt de garantie (caution) est à payer pour sécuriser le logement
  const totalAPayer = cautionTotale;

  const handleChambreSelect = (chambre: any) => {
    setSelectedChambre(chambre.id);
    if (chambre.mode_reservation === "collectif") {
      setSelectedPlaces(chambre.nombre_personnes || 1);
    } else {
      setSelectedPlaces(1);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour réserver.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (role !== "etudiant") {
      toast({ title: "Réservation réservée aux étudiants", description: "Seuls les étudiants peuvent réserver.", variant: "destructive" });
      return;
    }
    if (!selectedChambre || !currentChambre) {
      toast({ title: "Sélectionnez une chambre", description: "Veuillez choisir une chambre.", variant: "destructive" });
      return;
    }

    setReserving(true);

    try {
      const { error } = await createReservation({
        studentId: user.id,
        roomId: selectedChambre,
        logementId: logement.id,
        amount: totalAPayer,
        nombrePlaces: effectivePlaces,
        typeReservation: isCollectif ? "collectif" : "individuel",
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
      });

      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Demande de réservation envoyée ✅",
          description: isCollectif
            ? `Votre demande collective pour l'ensemble des ${capaciteChambre} places est en cours de vérification.`
            : `Votre demande pour ${effectivePlaces} place(s) est en cours de vérification.`,
        });
        navigate("/etudiant/reservations");
      }
    } finally {
      setReserving(false);
    }
  };

  const getUnitLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "studio": return "Studio";
      case "appartement": return "Appartement";
      case "villa":
      case "maison": return "Chambre";
      case "résidence": return "Chambre";
      default: return "Unité";
    }
  };

  const unitLabel = getUnitLabel(logement.type);

  return (
    <div className="min-h-screen bg-sand-50/30 flex flex-col justify-between">
      <SEOHead 
        title={logement.nom}
        description={logement.description ? logement.description.slice(0, 150) : `Logement ${logement.type} disponible à ${logement.ville}`}
        canonical={`/logements/${id}`}
        ogImage={images[0]}
      />
      <div>
        <Navbar />
        <div className="pt-24 md:pt-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            <Link to="/logements" className="inline-flex items-center gap-2 text-xs font-ui uppercase tracking-wider text-muted-foreground hover:text-accent mb-6 transition-colors font-medium">
              <ArrowLeft className="h-4 w-4" /> Retour au catalogue
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Colonne gauche (Galerie & Détails) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                
                {/* Galerie d'architecte */}
                <div className="space-y-3">
                  <div className="relative rounded-sm overflow-hidden bg-muted aspect-[16/10] border border-border">
                    <img src={images[imgIndex]} alt={logement.nom} className="w-full h-full object-cover" />
                    
                    {images.length > 1 && (
                      <>
                        <button
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-basalt/70 hover:bg-basalt text-white rounded-sm p-2 backdrop-blur-sm transition-colors"
                          onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}
                          aria-label="Image précédente"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-basalt/70 hover:bg-basalt text-white rounded-sm p-2 backdrop-blur-sm transition-colors"
                          onClick={() => setImgIndex((imgIndex + 1) % images.length)}
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-2.5 py-1 text-[11px] font-semibold font-ui uppercase tracking-wider bg-white/95 text-basalt backdrop-blur-md">
                        {logement.type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                      {images.map((_: any, i: number) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-accent scale-125" : "bg-white/50"}`}
                          onClick={() => setImgIndex(i)}
                          aria-label={`Photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img: string, i: number) => (
                        <button
                          key={i}
                          className={`w-24 h-16 rounded-sm overflow-hidden border-2 flex-shrink-0 transition-all ${
                            i === imgIndex ? "border-accent opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                          onClick={() => setImgIndex(i)}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Présentation principale */}
                <div className="bg-card border border-border rounded-sm p-6 sm:p-8 space-y-6">
                  <div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground">
                      {logement.nom}
                    </h1>
                    <div className="flex items-center gap-2 mt-2.5 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 text-accent shrink-0" />
                      <span>{logement.adresse}, {logement.ville}, {logement.pays}</span>
                    </div>
                  </div>

                  {logement.description && (
                    <div className="pt-6 border-t border-border space-y-3">
                      <h2 className="font-serif text-xl font-normal text-foreground">Description du bien</h2>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        {logement.description}
                      </p>
                    </div>
                  )}

                  {logement.conditions_electricite && (
                    <div className="pt-6 border-t border-border space-y-3">
                      <h2 className="font-serif text-xl font-normal text-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" /> Gestion de l'électricité & utilités
                      </h2>
                      <div className="bg-sand-50/80 border border-border p-4 rounded-sm text-sm text-muted-foreground">
                        {logement.conditions_electricite}
                      </div>
                    </div>
                  )}

                  {logement.latitude && logement.longitude && (
                    <div className="pt-6 border-t border-border space-y-3">
                      <h2 className="font-serif text-xl font-normal text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" /> Situation géographique
                      </h2>
                      <div className="rounded-sm overflow-hidden border border-border h-64">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          title="Carte du logement"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${logement.longitude - 0.01},${logement.latitude - 0.01},${logement.longitude + 0.01},${logement.latitude + 0.01}&layer=mapnik&marker=${logement.latitude},${logement.longitude}`}
                        />
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${logement.latitude},${logement.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-ui text-accent hover:underline font-semibold"
                      >
                        📍 Itinéraire Google Maps vers la résidence
                      </a>
                    </div>
                  )}
                </div>

              </div>

              {/* Colonne droite : Sélecteur d'unités & Bloc de réservation */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                <div className="bg-card border border-border rounded-sm p-6 shadow-sm lg:sticky lg:top-28 space-y-5">
                  
                  <div className="border-b border-border pb-3 flex items-center justify-between">
                    <h2 className="font-serif text-lg font-normal text-foreground">
                      {unitLabel}s disponibles
                    </h2>
                    <span className="text-xs font-ui text-muted-foreground">
                      {chambres.length} option(s)
                    </span>
                  </div>

                  {chambres.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Aucune chambre répertoriée pour le moment.</p>
                  ) : (
                    <div className="space-y-3">
                      {chambres.map((chambre: any) => {
                        const isChambreCollectif = chambre.mode_reservation === "collectif";
                        const isChambreParPersonne = !!chambre.tarification_par_personne;

                        return (
                          <button
                            key={chambre.id}
                            className={`w-full text-left p-4 rounded-sm border transition-all ${
                              selectedChambre === chambre.id
                                ? "border-accent bg-accent/5 ring-1 ring-accent"
                                : chambre.est_disponible
                                ? "border-border hover:border-accent/40 bg-card"
                                : "border-border/50 opacity-40 cursor-not-allowed bg-muted/20"
                            }`}
                            onClick={() => chambre.est_disponible && handleChambreSelect(chambre)}
                            disabled={!chambre.est_disponible}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-foreground text-sm">{chambre.nom}</p>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-sm font-ui uppercase font-semibold ${
                                      isChambreCollectif
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                                    }`}
                                  >
                                    {isChambreCollectif ? "Réservation Collective" : "Réservation Individuelle"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{chambre.nombre_personnes} personne(s) max</span>
                                  {isChambreCollectif && (
                                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                                      • Groupe complet ({chambre.nombre_personnes} lits)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-base font-bold text-accent font-ui">
                                  {chambre.prix_zeyna ? `${chambre.prix_zeyna.toLocaleString()} F` : "N/A"}
                                </p>
                                <span className="text-[10px] text-muted-foreground block font-ui uppercase">
                                  {isChambreParPersonne ? "Loyer / pers" : "Loyer total"}
                                </span>
                              </div>
                            </div>

                            {chambre.caution > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3 text-accent" />
                                  Caution : <strong className="text-foreground">{chambre.caution.toLocaleString()} F</strong>
                                  {isChambreParPersonne ? " /pers" : ""}
                                </span>
                                {!chambre.est_disponible && (
                                  <span className="text-[10px] uppercase font-ui font-semibold text-destructive">
                                    Complet
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Paramètres et validation de la réservation */}
                  {currentChambre && (
                    <div className="p-4 rounded-sm bg-sand-50/80 border border-border space-y-4 text-xs">
                      <div className="flex items-center justify-between font-ui font-semibold text-xs uppercase tracking-wider text-foreground">
                        <span>Récapitulatif de réservation</span>
                        <span className="px-2 py-0.5 bg-card border border-border text-foreground">
                          {isCollectif ? "Groupe complet" : `${effectivePlaces} place(s)`}
                        </span>
                      </div>

                      {/* Sélecteur de places si individuel */}
                      {!isCollectif && capaciteChambre > 1 ? (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-foreground">Nombre de places souhaitées :</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={capaciteChambre}
                              value={selectedPlaces}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(capaciteChambre, Number(e.target.value) || 1));
                                setSelectedPlaces(val);
                              }}
                              className="h-9 text-xs max-w-[100px] rounded-sm bg-card"
                            />
                            <span className="text-muted-foreground">sur {capaciteChambre} place(s)</span>
                          </div>
                        </div>
                      ) : isCollectif ? (
                        <div className="p-2.5 rounded-sm bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                          <strong>Mode collectif :</strong> Vous réservez l'intégralité des {capaciteChambre} places pour votre groupe.
                        </div>
                      ) : null}

                      {/* Choix des dates */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Date d'entrée
                          </Label>
                          <Input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="h-9 text-xs rounded-sm bg-card"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Date de fin (opt.)
                          </Label>
                          <Input
                            type="date"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                            className="h-9 text-xs rounded-sm bg-card"
                          />
                        </div>
                      </div>

                      {/* Calcul transparent du montant */}
                      <div className="space-y-2 pt-3 border-t border-border">
                        <div className="flex justify-between text-muted-foreground">
                          <span>
                            Dépôt de garantie (Caution) {isParPersonne && effectivePlaces > 1 ? `(${cautionUnitaire.toLocaleString()} F × ${effectivePlaces})` : ""} :
                          </span>
                          <span className="font-semibold text-foreground font-ui">{cautionTotale.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground italic">
                          <span>
                            Loyer mensuel prévu {isParPersonne && effectivePlaces > 1 ? `(${loyerUnitaire.toLocaleString()} F × ${effectivePlaces})` : ""} :
                          </span>
                          <span>{loyerTotal.toLocaleString()} FCFA / mois</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border text-sm font-bold text-foreground">
                          <span>Exigible à la confirmation :</span>
                          <span className="text-accent font-ui">{totalAPayer.toLocaleString()} FCFA</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal pt-1">
                          Seule la caution est due à la validation pour réserver le logement. Le loyer ne débutera qu'à votre emménagement.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm font-ui uppercase tracking-wider font-semibold h-12 text-xs"
                    disabled={!selectedChambre || reserving}
                    onClick={handleReserve}
                  >
                    {reserving ? "Transmission de votre demande..." : "Réserver ce logement"}
                  </Button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    Après validation administrative, vous disposerez de 24h pour régler la caution via Mobile Money ou carte.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LogementDetail;
