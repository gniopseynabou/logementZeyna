import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { submitDemandePartenariat } from "@/services/partenariat-service";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Building2, Handshake, Phone, Shield, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const avantages = [
  { icon: TrendingUp, titre: "Visibilité maximale",    desc: "Vos logements présentés à des milliers d'étudiants en recherche active à Saint-Louis." },
  { icon: Phone,      titre: "Gestion simplifiée",     desc: "Réservations, paiements et contrats centralisés dans un seul tableau de bord." },
  { icon: Shield,     titre: "Paiements sécurisés",    desc: "Orange Money, MTN, Moov - vos loyers garantis et reversés directement." },
  { icon: Handshake,  titre: "Partenariat humain",     desc: "Notre équipe vous accompagne à chaque étape et reste disponible." },
];

const fade = {
  hidden:  { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const DevenirBailleur = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "Saint-Louis",
    nombre_logements: "1",
    message: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitDemandePartenariat({
        ...form,
        nombre_logements: parseInt(form.nombre_logements) || 1,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Erreur lors de l'envoi", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,169,97,0.12),transparent)]" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.div variants={fade} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 border border-accent/20">
                <Building2 className="h-4 w-4" />
                Devenir partenaire bailleur
              </motion.div>
              <motion.h1 variants={fade} className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Confiez vos logements à{" "}
                <span className="text-accent">Zeyna</span>
              </motion.h1>
              <motion.p variants={fade} className="text-muted-foreground text-lg max-w-xl mx-auto">
                Rejoignez les propriétaires de Saint-Louis qui nous font confiance pour louer leurs biens
                à des étudiants sérieux, avec zéro tracas administratif.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Avantages ── */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {avantages.map((a, i) => (
              <motion.div
                key={a.titre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-premium h-full">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center">
                      <a.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold">{a.titre}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ── Formulaire ── */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-premium overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-accent/50 to-accent" />
                <CardContent className="p-8">
                  {submitted ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="font-serif text-2xl font-bold">Demande envoyée !</h2>
                      <p className="text-muted-foreground">
                        Merci <strong>{form.prenom}</strong> ! Notre équipe vous contactera dans les{" "}
                        <strong>24h</strong> au <strong>{form.telephone}</strong> pour discuter de votre partenariat.
                      </p>
                      <Button asChild variant="outline" className="mt-4">
                        <Link to="/">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Retour à l'accueil
                        </Link>
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="mb-7">
                        <h2 className="font-serif text-2xl font-bold mb-1">Déposez votre demande</h2>
                        <p className="text-muted-foreground text-sm">
                          Remplissez ce formulaire, notre équipe vous rappelle sous 24h.
                        </p>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom *</Label>
                            <Input id="prenom" placeholder="Aminata" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nom">Nom *</Label>
                            <Input id="nom" placeholder="Diallo" value={form.nom} onChange={(e) => update("nom", e.target.value)} required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telephone">Téléphone * <span className="text-muted-foreground text-xs">(nous vous rappelons ici)</span></Label>
                          <Input id="telephone" placeholder="+221 77 000 00 00" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(pour recevoir le lien d'activation)</span></Label>
                          <Input id="email" type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ville</Label>
                            <Select value={form.ville} onValueChange={(v) => update("ville", v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                                <SelectItem value="Dakar">Dakar</SelectItem>
                                <SelectItem value="Thiès">Thiès</SelectItem>
                                <SelectItem value="Autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Nombre de logements</Label>
                            <Select value={form.nombre_logements} onValueChange={(v) => update("nombre_logements", v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 logement</SelectItem>
                                <SelectItem value="2">2 logements</SelectItem>
                                <SelectItem value="3">3–5 logements</SelectItem>
                                <SelectItem value="6">6+ logements</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message (optionnel)</Label>
                          <Textarea
                            id="message"
                            placeholder="Décrivez brièvement vos logements, leur emplacement, vos attentes..."
                            rows={4}
                            value={form.message}
                            onChange={(e) => update("message", e.target.value)}
                          />
                        </div>

                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base" disabled={loading}>
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...
                            </span>
                          ) : "Envoyer ma demande"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Aucun engagement. Notre équipe vous contacte d'abord pour discuter.
                        </p>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DevenirBailleur;
