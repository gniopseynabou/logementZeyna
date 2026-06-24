import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Search, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import logement1 from "@/assets/logement-1.jpg";
import logement2 from "@/assets/logement-2.jpg";
import logement3 from "@/assets/logement-3.jpg";
import logement4 from "@/assets/logement-4.jpg";
import logement5 from "@/assets/logement-5.jpg";
import logement6 from "@/assets/logement-6.jpg";

const fallbackImages = [logement1, logement2, logement3, logement4, logement5, logement6];

const Logements = () => {
  const [search, setSearch] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [personnes, setPersonnes] = useState("all");
  const [quartier, setQuartier] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [disponibilite, setDisponibilite] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 9;

  const { data: logements, isLoading } = useQuery({
    queryKey: ["logements-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logements")
        .select("*, chambres(*)")
        .eq("statut", "valide")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const allLogements = (logements || []).map((l, i) => ({
    id: l.id,
    nom: l.nom,
    ville: l.ville,
    adresse: l.adresse,
    type: l.type,
    images: l.images && l.images.length > 0 ? l.images : [fallbackImages[i % fallbackImages.length]],
    chambres: l.chambres || [],
  }));

  const filtered = allLogements.filter((l) => {
    if (search && !l.nom.toLowerCase().includes(search.toLowerCase()) && !l.adresse.toLowerCase().includes(search.toLowerCase())) return false;
    if (quartier !== "all" && !l.adresse.toLowerCase().includes(quartier.toLowerCase())) return false;
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    const minP = l.chambres.length > 0 ? Math.min(...l.chambres.filter((c: any) => c.prix_zeyna).map((c: any) => c.prix_zeyna)) : 0;
    if (prixMin && minP < Number(prixMin)) return false;
    if (prixMax && minP > Number(prixMax)) return false;
    if (personnes !== "all") {
      const hasCapacity = l.chambres.some((c: any) => c.nombre_personnes === Number(personnes));
      if (!hasCapacity) return false;
    }
    if (disponibilite === "disponible") {
      const hasAvailable = l.chambres.some((c: any) => c.est_disponible);
      if (!hasAvailable) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="bg-gradient-teal py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">Nos logements</h1>
            <p className="text-primary-foreground/70 mt-2">Trouvez votre logement idéal à Saint-Louis et ses environs</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom ou quartier..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-card rounded-xl border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix min (FCFA)</label>
                <Input type="number" placeholder="10 000" value={prixMin} onChange={(e) => { setPrixMin(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix max (FCFA)</label>
                <Input type="number" placeholder="50 000" value={prixMax} onChange={(e) => { setPrixMax(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Personnes</label>
                <Select value={personnes} onValueChange={(v) => { setPersonnes(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="1">1 personne</SelectItem>
                    <SelectItem value="2">2 personnes</SelectItem>
                    <SelectItem value="3">3 personnes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Quartier</label>
                <Select value={quartier} onValueChange={(v) => { setQuartier(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="sanar">Sanar</SelectItem>
                    <SelectItem value="diaminar">Diaminar</SelectItem>
                    <SelectItem value="ngallèle">Ngallèle</SelectItem>
                    <SelectItem value="pikine">Pikine</SelectItem>
                    <SelectItem value="bango">Bango</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="résidence">Résidence</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="chambre">Chambre</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="appartement">Appartement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Disponibilité</label>
                <Select value={disponibilite} onValueChange={(v) => { setDisponibilite(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-4">{filtered.length} logement(s) trouvé(s)</p>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-0 shadow-premium">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucun logement ne correspond à vos critères</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setPrixMin(""); setPrixMax(""); setPersonnes("all"); setQuartier("all"); setTypeFilter("all"); setDisponibilite("all"); }}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {paginated.map((logement, index) => {
                  const minPrice = logement.chambres.length > 0
                    ? Math.min(...logement.chambres.filter((c: any) => c.prix_zeyna).map((c: any) => c.prix_zeyna))
                    : 0;
                  const maxCap = logement.chambres.length > 0
                    ? Math.max(...logement.chambres.map((c: any) => c.nombre_personnes))
                    : 0;
                  const available = logement.chambres.some((c: any) => c.est_disponible);

                  if (viewMode === "list") {
                    return (
                      <Link to={`/logements/${logement.id}`} key={logement.id}>
                        <Card className="group overflow-hidden border-0 shadow-premium hover:shadow-gold transition-all">
                          <div className="flex flex-col sm:flex-row">
                            <div className="w-full sm:w-48 h-48 sm:h-36 relative overflow-hidden flex-shrink-0">
                              <img src={logement.images[0]} alt={logement.nom} className="w-full h-full object-cover" />
                            </div>
                            <CardContent className="flex-1 p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                              <div>
                                <h3 className="font-serif font-bold text-foreground">{logement.nom}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> {logement.adresse}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <Users className="h-3.5 w-3.5 flex-shrink-0" /> {maxCap} pers. max
                                </div>
                                <Badge variant="secondary" className="mt-1 text-xs">{logement.type}</Badge>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:text-right">
                                <Badge variant={available ? "default" : "secondary"}>
                                  {available ? "Disponible" : "Complet"}
                                </Badge>
                                <div>
                                  <p className="text-lg font-bold text-accent mt-1">
                                    {minPrice > 0 ? `${minPrice.toLocaleString()} F` : "Sur demande"}
                                  </p>
                                  <span className="text-xs text-muted-foreground">/mois</span>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    );
                  }

                  return (
                    <Link to={`/logements/${logement.id}`} key={logement.id}>
                      <Card className="group overflow-hidden border-0 shadow-premium hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                        <div className="h-48 relative overflow-hidden bg-muted">
                          <img src={logement.images[0]} alt={logement.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <Badge className={`absolute top-3 right-3 border-0 ${available ? "bg-accent text-accent-foreground" : "bg-muted-foreground text-card"}`}>
                            {available ? "Disponible" : "Complet"}
                          </Badge>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors">{logement.nom}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                            <MapPin className="h-3.5 w-3.5" /> {logement.adresse}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">{logement.type}</Badge>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3.5 w-3.5" /> {maxCap} pers.
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-accent">{minPrice > 0 ? `${minPrice.toLocaleString()} F` : "Sur demande"}</span>
                              <span className="text-xs text-muted-foreground block">/mois</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Logements;
