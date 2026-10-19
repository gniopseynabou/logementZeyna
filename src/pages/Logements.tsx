import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicLogements } from "@/services/logement-service";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Search, Grid3X3, List, SlidersHorizontal, ShieldCheck, Zap } from "lucide-react";
import logement1 from "@/assets/logement-1.jpg";
import logement2 from "@/assets/logement-2.jpg";
import logement3 from "@/assets/logement-3.jpg";
import logement4 from "@/assets/logement-4.jpg";
import logement5 from "@/assets/logement-5.jpg";
import logement6 from "@/assets/logement-6.jpg";

import SEOHead from "@/components/SEOHead";

const fallbackImages = [logement1, logement2, logement3, logement4, logement5, logement6];

const Logements = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialQuartier = searchParams.get("quartier") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [personnes, setPersonnes] = useState("all");
  const [quartier, setQuartier] = useState(initialQuartier);
  const [modeFilter, setModeFilter] = useState<"all" | "individuel" | "collectif">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [disponibilite, setDisponibilite] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 9;

  useEffect(() => {
    const q = searchParams.get("quartier");
    const s = searchParams.get("search");
    if (q) setQuartier(q);
    if (s) setSearch(s);
  }, [searchParams]);

  const { data: logements, isLoading } = useQuery({
    queryKey: ["logements-list"],
    queryFn: getPublicLogements,
  });

  const allLogements = (logements || []).map((l, i) => {
    const validChambres = (l.chambres || []).filter((c: any) => c.prix_zeyna || c.prix_bailleur);
    const minPrice = validChambres.length ? Math.min(...validChambres.map((c: any) => c.prix_zeyna || c.prix_bailleur)) : 0;
    const minCaution = validChambres.length ? Math.min(...validChambres.map((c: any) => c.caution || 0)) : 0;
    const maxCap = (l.chambres || []).length ? Math.max(...l.chambres.map((c: any) => c.nombre_personnes)) : 0;
    const available = (l.chambres || []).some((c: any) => c.est_disponible);
    const hasIndividuel = (l.chambres || []).some((c: any) => c.mode_reservation === "individuel" || !c.mode_reservation);
    const hasCollectif = (l.chambres || []).some((c: any) => c.mode_reservation === "collectif");

    return {
      id: l.id,
      nom: l.nom,
      ville: l.ville,
      adresse: l.adresse,
      type: l.type,
      description: l.description,
      conditions_electricite: l.conditions_electricite,
      images: l.images && l.images.length > 0 ? l.images : [fallbackImages[i % fallbackImages.length]],
      chambres: l.chambres || [],
      minPrice,
      minCaution,
      maxCap,
      available,
      hasIndividuel,
      hasCollectif,
    };
  });

  const filtered = allLogements.filter((l) => {
    if (search && !l.nom.toLowerCase().includes(search.toLowerCase()) && !l.adresse.toLowerCase().includes(search.toLowerCase())) return false;
    if (quartier !== "all" && !l.adresse.toLowerCase().includes(quartier.toLowerCase())) return false;
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (prixMin && l.minPrice < Number(prixMin)) return false;
    if (prixMax && l.minPrice > Number(prixMax)) return false;
    if (personnes !== "all") {
      const hasCapacity = l.chambres.some((c: any) => c.nombre_personnes === Number(personnes));
      if (!hasCapacity) return false;
    }
    if (disponibilite === "disponible" && !l.available) {
      return false;
    }
    if (modeFilter === "individuel" && !l.hasIndividuel) return false;
    if (modeFilter === "collectif" && !l.hasCollectif) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const resetAllFilters = () => {
    setSearch("");
    setPrixMin("");
    setPrixMax("");
    setPersonnes("all");
    setQuartier("all");
    setTypeFilter("all");
    setDisponibilite("all");
    setModeFilter("all");
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-sand-50/30 flex flex-col justify-between">
      <SEOHead 
        title="Catalogue des logements" 
        description="Consultez l'ensemble de nos logements étudiants à Saint-Louis et Sanar : chambres individuelles, collectifs, studios et résidences."
        canonical="/logements"
      />
      <div>
        <Navbar />

        {/* En-tête architectural */}
        <section className="pt-28 pb-12 bg-basalt text-white border-b border-border/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-xs font-ui font-semibold uppercase tracking-widest text-white/80">
                  Saint-Louis & Université Gaston Berger
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight">
                Le répertoire résidentiel
              </h1>
              <p className="text-white/70 mt-3 text-sm sm:text-base leading-relaxed">
                Logements audités, chambres individuelles et collectives à prix transparents. La caution est la seule somme exigée lors de votre réservation.
              </p>
            </div>
          </div>
        </section>

        {/* Barre d'action et filtres */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Ligne principale : Recherche, pills rapides et modes d'affichage */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6">
            
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par résidence ou quartier (ex: Sanar, Khor)..."
                className="pl-10 h-11 bg-card border-border rounded-sm text-sm focus-visible:ring-accent"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                className={`h-11 rounded-sm text-xs font-ui uppercase tracking-wider font-semibold gap-2 ${
                  showFilters ? "bg-accent text-white hover:bg-accent/90" : "border-border text-foreground hover:bg-muted"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtres {showFilters ? "actifs" : ""}
              </Button>

              <div className="flex items-center border border-border rounded-sm overflow-hidden bg-card">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={`h-11 w-11 rounded-none ${viewMode === "grid" ? "bg-basalt text-white hover:bg-basalt" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Vue Grille"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className={`h-11 w-11 rounded-none ${viewMode === "list" ? "bg-basalt text-white hover:bg-basalt" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="Vue Liste"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* Raccourcis / Filtres express */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs uppercase font-ui tracking-wider text-muted-foreground mr-1">
              Afficher :
            </span>
            <button
              onClick={() => { setDisponibilite("all"); setModeFilter("all"); setQuartier("all"); }}
              className={`px-3 py-1 text-xs rounded-sm border font-ui transition-all ${
                disponibilite === "all" && modeFilter === "all" && quartier === "all"
                  ? "bg-basalt text-white border-basalt"
                  : "bg-card text-muted-foreground border-border hover:border-accent"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setDisponibilite(disponibilite === "disponible" ? "all" : "disponible")}
              className={`px-3 py-1 text-xs rounded-sm border font-ui transition-all ${
                disponibilite === "disponible"
                  ? "bg-accent text-white border-accent"
                  : "bg-card text-muted-foreground border-border hover:border-accent"
              }`}
            >
              Disponibles maintenant
            </button>
            <button
              onClick={() => setQuartier(quartier === "Sanar" ? "all" : "Sanar")}
              className={`px-3 py-1 text-xs rounded-sm border font-ui transition-all ${
                quartier.toLowerCase().includes("sanar")
                  ? "bg-accent text-white border-accent"
                  : "bg-card text-muted-foreground border-border hover:border-accent"
              }`}
            >
              Campus UGB (Sanar)
            </button>
            <button
              onClick={() => setModeFilter(modeFilter === "individuel" ? "all" : "individuel")}
              className={`px-3 py-1 text-xs rounded-sm border font-ui transition-all ${
                modeFilter === "individuel"
                  ? "bg-basalt text-white border-basalt"
                  : "bg-card text-muted-foreground border-border hover:border-accent"
              }`}
            >
              Places individuelles
            </button>
            <button
              onClick={() => setModeFilter(modeFilter === "collectif" ? "all" : "collectif")}
              className={`px-3 py-1 text-xs rounded-sm border font-ui transition-all ${
                modeFilter === "collectif"
                  ? "bg-basalt text-white border-basalt"
                  : "bg-card text-muted-foreground border-border hover:border-accent"
              }`}
            >
              Chambres collectives
            </button>
          </div>

          {/* Panneau de filtres avancés */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 p-6 bg-card rounded-sm border border-border shadow-sm">
              <div>
                <label className="text-[11px] uppercase font-ui tracking-wider font-semibold text-muted-foreground mb-1.5 block">
                  Loyer Min (FCFA)
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 10 000"
                  value={prixMin}
                  onChange={(e) => { setPrixMin(e.target.value); setPage(1); }}
                  className="rounded-sm text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-ui tracking-wider font-semibold text-muted-foreground mb-1.5 block">
                  Loyer Max (FCFA)
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 50 000"
                  value={prixMax}
                  onChange={(e) => { setPrixMax(e.target.value); setPage(1); }}
                  className="rounded-sm text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-ui tracking-wider font-semibold text-muted-foreground mb-1.5 block">
                  Capacité (personnes)
                </label>
                <Select value={personnes} onValueChange={(v) => { setPersonnes(v); setPage(1); }}>
                  <SelectTrigger className="rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes capacités</SelectItem>
                    <SelectItem value="1">1 personne</SelectItem>
                    <SelectItem value="2">2 personnes</SelectItem>
                    <SelectItem value="3">3 personnes</SelectItem>
                    <SelectItem value="4">4+ personnes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] uppercase font-ui tracking-wider font-semibold text-muted-foreground mb-1.5 block">
                  Secteur / Quartier
                </label>
                <Select value={quartier} onValueChange={(v) => { setQuartier(v); setPage(1); }}>
                  <SelectTrigger className="rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les quartiers</SelectItem>
                    {Array.from(new Set(allLogements.map((l) => l.adresse))).filter(Boolean).map((addr) => (
                      <SelectItem key={addr} value={addr}>{addr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] uppercase font-ui tracking-wider font-semibold text-muted-foreground mb-1.5 block">
                  Type de bien
                </label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger className="rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="résidence">Résidence</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="chambre">Chambre</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="appartement">Appartement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Compteur de résultats */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground font-ui">{filtered.length}</strong> résidence(s) répertoriée(s)
            </span>
            {(search || prixMin || prixMax || personnes !== "all" || quartier !== "all" || typeFilter !== "all" || disponibilite !== "all" || modeFilter !== "all") && (
              <button
                onClick={resetAllFilters}
                className="text-accent hover:underline font-ui font-medium"
              >
                Réinitialiser tous les critères
              </button>
            )}
          </div>

          {/* Liste des résultats */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-card animate-pulse rounded-sm border border-border" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center max-w-lg mx-auto my-12">
              <h3 className="font-serif text-xl font-normal text-foreground mb-2">Aucun logement trouvé</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Aucune résidence ne correspond exactement à vos critères. Essayez d'élargir la zone géographique ou les limites de budget.
              </p>
              <Button onClick={resetAllFilters} variant="outline" className="rounded-sm font-ui text-xs uppercase tracking-wider">
                Afficher tous les logements
              </Button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginated.map((logement) => (
                    <Link
                      to={`/logements/${logement.id}`}
                      key={logement.id}
                      className="group flex flex-col bg-card border border-border hover:border-accent/80 transition-all duration-300 rounded-sm overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={logement.images[0]}
                          alt={logement.nom}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

                        {/* Badges d'état */}
                        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-semibold font-ui uppercase tracking-wider backdrop-blur-md ${
                              logement.available
                                ? "bg-white/95 text-basalt border border-black/10"
                                : "bg-basalt/85 text-white/90 border border-white/20"
                            }`}
                          >
                            {logement.available ? "Disponible" : "Complet"}
                          </span>
                          <span className="px-2 py-1 text-[11px] font-ui uppercase tracking-wider bg-black/50 text-white backdrop-blur-md">
                            {logement.type}
                          </span>
                        </div>

                        {/* Badges de mode de réservation */}
                        <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-wrap gap-1.5">
                          {logement.hasIndividuel && (
                            <span className="px-2 py-0.5 text-[10px] font-ui bg-basalt/80 text-white/95 backdrop-blur-sm">
                              Place individuelle
                            </span>
                          )}
                          {logement.hasCollectif && (
                            <span className="px-2 py-0.5 text-[10px] font-ui bg-accent/90 text-white backdrop-blur-sm">
                              Chambre collective
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Corps de la carte */}
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="font-serif text-xl font-normal text-foreground group-hover:text-accent transition-colors leading-snug">
                            {logement.nom}
                          </h3>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-2">
                            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                            <span className="truncate">{logement.adresse}, {logement.ville}</span>
                          </div>
                        </div>

                        {/* Bloc financier architectural */}
                        <div className="mt-5 pt-4 border-t border-border flex items-end justify-between">
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 font-ui font-medium text-foreground">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{logement.maxCap} pers. max</span>
                            </div>
                            {logement.minCaution > 0 && (
                              <div className="text-[11px] text-muted-foreground mt-1">
                                Caution : <span className="font-semibold text-foreground">{logement.minCaution.toLocaleString()} F</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-ui tracking-wider text-muted-foreground block">
                              Loyer mensuel
                            </span>
                            <span className="text-lg font-bold font-ui text-accent">
                              {logement.minPrice > 0 ? `${logement.minPrice.toLocaleString()} F` : "Sur demande"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginated.map((logement) => (
                    <Link
                      to={`/logements/${logement.id}`}
                      key={logement.id}
                      className="group flex flex-col sm:flex-row bg-card border border-border hover:border-accent/80 transition-all rounded-sm overflow-hidden"
                    >
                      <div className="w-full sm:w-64 h-52 relative overflow-hidden bg-muted shrink-0">
                        <img
                          src={logement.images[0]}
                          alt={logement.nom}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                        <span
                          className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold font-ui uppercase tracking-wider backdrop-blur-md ${
                            logement.available ? "bg-white/95 text-basalt" : "bg-basalt/85 text-white/90"
                          }`}
                        >
                          {logement.available ? "Disponible" : "Complet"}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-serif text-xl font-normal text-foreground group-hover:text-accent transition-colors">
                                {logement.nom}
                              </h3>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1.5">
                                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                                <span>{logement.adresse}, {logement.ville}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="rounded-sm font-ui text-[11px] uppercase">
                              {logement.type}
                            </Badge>
                          </div>

                          {logement.description && (
                            <p className="text-muted-foreground text-xs line-clamp-2 mt-3 leading-relaxed">
                              {logement.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 font-ui text-foreground font-medium">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              {logement.maxCap} pers. max
                            </span>
                            {logement.minCaution > 0 && (
                              <span className="text-muted-foreground text-[11px]">
                                Caution : <strong className="text-foreground">{logement.minCaution.toLocaleString()} F</strong>
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-ui tracking-wider text-muted-foreground block">
                              Loyer mensuel
                            </span>
                            <span className="text-lg font-bold font-ui text-accent">
                              {logement.minPrice > 0 ? `${logement.minPrice.toLocaleString()} F` : "Sur demande"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-12 pt-6 border-t border-border">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={`h-9 w-9 rounded-sm font-ui text-xs ${
                        page === i + 1 ? "bg-accent text-white hover:bg-accent/90" : "border-border text-foreground hover:bg-muted"
                      }`}
                      onClick={() => { setPage(i + 1); window.scrollTo({ top: 200, behavior: "smooth" }); }}
                    >
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

