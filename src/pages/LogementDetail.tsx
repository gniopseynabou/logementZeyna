import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Zap, ArrowLeft, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import logement1 from "@/assets/logement-1.jpg";
import logement2 from "@/assets/logement-2.jpg";
import logement3 from "@/assets/logement-3.jpg";

const fallbackImages = [logement1, logement2, logement3];

const LogementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [selectedChambre, setSelectedChambre] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [reserving, setReserving] = useState(false);

  const { data: logement, isLoading } = useQuery({
    queryKey: ["logement-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logements")
        .select("*, chambres(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
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
    if (!selectedChambre) {
      toast({ title: "Sélectionnez une chambre", description: "Veuillez choisir une chambre.", variant: "destructive" });
      return;
    }

    setReserving(true);
    const chambre = chambres.find((c: any) => c.id === selectedChambre);
    const montant = chambre?.caution || chambre?.prix_zeyna || 0;

    const { error } = await supabase.from("reservations").insert({
      etudiant_id: user.id,
      chambre_id: selectedChambre,
      logement_id: logement.id,
      montant_total: montant,
      date_debut: new Date().toISOString().split("T")[0],
      statut: "en_attente",
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Réservation créée !", description: "Procédez au paiement de la caution pour confirmer." });
      navigate("/etudiant/reservations");
    }
    setReserving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <Link to="/logements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour aux logements
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:grid-cols-3 gap-6 lg:gap-8">
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

              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{logement.description || "Logement étudiant de qualité à Saint-Louis."}</p>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" /> Conditions d'électricité
                </h2>
                <p className="text-muted-foreground">{logement.conditions_electricite || "Éclairage et chauffe-eau inclus."}</p>
              </div>

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
              <Card className="borlg:sticky lg:hadow-premium sticky top-24">
                <CardHeader>
                  <CardTitle className="font-serif">Chambres disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chambres.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune chambre disponible</p>
                  ) : (
                    chambres.map((chambre: any) => (
                      <button
                        key={chambre.id}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedChambre === chambre.id
                            ? "border-accent bg-accent/5"
                            : chambre.est_disponible
                            ? "border-border hover:border-accent/30"
                            : "border-border opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => chambre.est_disponible && setSelectedChambre(chambre.id)}
                        disabled={!chambre.est_disponible}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{chambre.nom}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Users className="h-3.5 w-3.5" />
                              {chambre.nombre_personnes} personne(s)
                            </div>
                            {chambre.description && (
                              <p className="text-xs text-muted-foreground mt-1">{chambre.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent font-ui">
                              {chambre.prix_zeyna ? `${chambre.prix_zeyna.toLocaleString()} F` : "N/A"}
                            </p>
                            <span className="text-xs text-muted-foreground">/mois</span>
                          </div>
                        </div>
                        {chambre.caution > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                              <Shield className="h-3 w-3 inline mr-1" />
                              Caution : {chambre.caution.toLocaleString()} FCFA
                            </p>
                          </div>
                        )}
                        {!chambre.est_disponible && (
                          <Badge variant="secondary" className="mt-2">Complet</Badge>
                        )}
                      </button>
                    ))
                  )}

                  <Button
                    className="w-full bg-gradient-gold text-accent-foreground shadow-gold mt-4"
                    disabled={!selectedChambre || reserving}
                    onClick={handleReserve}
                  >
                    {reserving ? "Réservation..." : "Réserver maintenant"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    La réservation sera confirmée après paiement de la caution
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
