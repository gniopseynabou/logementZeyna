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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={logement.nom}
        description={logement.description ? logement.description.slice(0, 150) : `Logement ${logement.type} disponible à ${logement.ville}`}
        canonical={`/logements/${id}`}
        ogImage={images[0]}
      />
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <Link to="/logements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour aux logements
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/9]">
                <img src={images[imgIndex]} alt={logement.nom} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card" onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)}>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card" onClick={() => setImgIndex((imgIndex + 1) % images.length)}>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: any, i: number) => (
                    <button key={i} className={`w-2 h-2 rounded-full transition-colors ${i === imgIndex ? "bg-accent" : "bg-card/50"}`} onClick={() => setImgIndex(i)} />
                  ))}
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img: string, i: number) => (
                    <button key={i} className={`w-20 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === imgIndex ? "border-accent" : "border-transparent"}`} onClick={() => setImgIndex(i)}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{logement.nom}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{logement.adresse}, {logement.ville}, {logement.pays}</span>
                </div>
                <Badge className="mt-3" variant="secondary">{logement.type}</Badge>
              </div>

              {logement.description && (
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{logement.description}</p>
                </div>
              )}

              {logement.conditions_electricite && (
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" /> Conditions d'électricité
                  </h2>
                  <p className="text-muted-foreground">{logement.conditions_electricite}</p>
                </div>
              )}

              {logement.latitude && logement.longitude && (
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent" /> Localisation
                  </h2>
                  <div className="rounded-xl overflow-hidden border h-64">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${logement.longitude - 0.01},${logement.latitude - 0.01},${logement.longitude + 0.01},${logement.latitude + 0.01}&layer=mapnik&marker=${logement.latitude},${logement.longitude}`}
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${logement.latitude},${logement.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    📍 Voir l'itinéraire sur Google Maps
                  </a>
                </div>
              )}
            </div>

            {/* Right: Chambres & Reservation */}
            <div className="space-y-4">
              <Card className="border-0 shadow-premium lg:sticky lg:top-24">
                <CardHeader>
                  <CardTitle className="font-serif">{unitLabel}s disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chambres.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune chambre disponible</p>
                  ) : (
                    chambres.map((chambre: any) => {
                      const isChambreCollectif = chambre.mode_reservation === "collectif";
                      const isChambreParPersonne = !!chambre.tarification_par_personne;

                      return (
                        <button
                          key={chambre.id}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedChambre === chambre.id
                              ? "border-accent bg-accent/5"
                              : chambre.est_disponible
                              ? "border-border hover:border-accent/30"
                              : "border-border opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => chambre.est_disponible && handleChambreSelect(chambre)}
                          disabled={!chambre.est_disponible}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-foreground">{chambre.nom}</p>
                                <Badge
                                  variant={isChambreCollectif ? "default" : "secondary"}
                                  className={`text-[10px] ${
                                    isChambreCollectif
                                      ? "bg-purple-600/10 text-purple-700 border-purple-300 dark:text-purple-400"
                                      : "bg-blue-600/10 text-blue-700 border-blue-300 dark:text-blue-400"
                                  }`}
                                >
                                  {isChambreCollectif ? "Réservation Collective" : "Réservation Individuelle"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                <Users className="h-3.5 w-3.5" />
                                {chambre.nombre_personnes} personne(s) max
                                {isChambreCollectif && (
                                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium ml-1">
                                    • Logement entier ({chambre.nombre_personnes} places)
                                  </span>
                                )}
                              </div>

                              {chambre.description && (
                                <p className="text-xs text-muted-foreground mt-1">{chambre.description}</p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold text-accent font-ui">
                                {chambre.prix_zeyna ? `${chambre.prix_zeyna.toLocaleString()} F` : "N/A"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {isChambreParPersonne ? "/pers/mois" : "/mois"}
                              </span>
                            </div>
                          </div>

                          {chambre.caution > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                <Shield className="h-3 w-3 inline mr-1 text-accent" />
                                Caution : {chambre.caution.toLocaleString()} FCFA{isChambreParPersonne ? " /personne" : ""}
                              </span>
                              {isChambreParPersonne && (
                                <Badge variant="outline" className="text-[10px]">
                                  Tarif par personne
                                </Badge>
                              )}
                            </div>
                          )}

                          {!chambre.est_disponible && (
                            <Badge variant="secondary" className="mt-2">Complet</Badge>
                          )}
                        </button>
                      );
                    })
                  )}

                  {/* Options de réservation une fois une chambre sélectionnée */}
                  {currentChambre && (
                    <div className="p-4 rounded-xl bg-muted/40 border space-y-3.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-sm">
                        <span>Détails de votre demande</span>
                        <Badge variant="outline">
                          {isCollectif ? "Groupe complet" : `${effectivePlaces} place(s)`}
                        </Badge>
                      </div>

                      {/* Sélecteur de places si individuel */}
                      {!isCollectif && capaciteChambre > 1 ? (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Nombre de places souhaitées :</Label>
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
                              className="h-8 text-xs max-w-[100px]"
                            />
                            <span className="text-muted-foreground">sur {capaciteChambre} place(s) au total</span>
                          </div>
                        </div>
                      ) : isCollectif ? (
                        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-300">
                          <strong>Réservation collective obligatoire :</strong> Vous réservez l'intégralité des {capaciteChambre} places pour votre groupe et êtes responsable du montant total.
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
                            className="h-8 text-xs"
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
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      {/* Calcul détaillé en temps réel */}
                      <div className="space-y-1.5 pt-2 border-t text-muted-foreground">
                        <div className="flex justify-between">
                          <span>
                            Dépôt de garantie (Caution) {isParPersonne && effectivePlaces > 1 ? `(${cautionUnitaire.toLocaleString()} F × ${effectivePlaces} pers)` : ""} :
                          </span>
                          <span className="font-semibold text-foreground">{cautionTotale.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground italic">
                          <span>
                            Loyer mensuel futur {isParPersonne && effectivePlaces > 1 ? `(${loyerUnitaire.toLocaleString()} F × ${effectivePlaces} pers)` : ""} :
                          </span>
                          <span>{loyerTotal.toLocaleString()} FCFA / mois (exigible à l'entrée)</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t text-sm font-bold text-foreground">
                          <span>Montant à régler à validation (Caution) :</span>
                          <span className="text-accent">{totalAPayer.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-gold text-accent-foreground shadow-gold mt-4"
                    disabled={!selectedChambre || reserving}
                    onClick={handleReserve}
                  >
                    {reserving ? "Envoi de la demande..." : "Soumettre la réservation"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    À validation, seule la caution de {totalAPayer.toLocaleString()} FCFA est demandée pour sécuriser vos places (délai de 24h).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LogementDetail;
