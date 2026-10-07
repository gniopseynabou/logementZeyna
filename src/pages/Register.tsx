import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerUser, type RegistrationRole } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const Register = () => {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "", password: "", confirmPassword: "", role: "etudiant" as RegistrationRole });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await registerUser({
        email: form.email,
        password: form.password,
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        role: "etudiant", // Seuls les locataires s'inscrivent ici
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast({ title: "Erreur d'inscription", description: error.message, variant: "destructive" });
      } else {
        toast({ 
          title: "Inscription réussie !", 
          description: "Vérifiez votre email pour confirmer votre compte." 
        });
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Card className="border-0 shadow-premium w-full bg-card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-accent/50 to-accent" />
      <CardHeader className="pb-4">
        <motion.div initial="hidden" animate="visible" variants={itemVariants}>
          <CardTitle className="font-serif text-2xl">Inscription</CardTitle>
          <CardDescription className="mt-1.5">Rejoignez la communauté Zeyna</CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        <motion.form 
          onSubmit={handleRegister} 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
        >

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-2 group">
              <Label htmlFor="nom" className="transition-colors group-focus-within:text-accent">Nom</Label>
              <Input id="nom" placeholder="Diallo" value={form.nom} onChange={(e) => update("nom", e.target.value)} required className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="prenom" className="transition-colors group-focus-within:text-accent">Prénom</Label>
              <Input id="prenom" placeholder="Aminata" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} required className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 group">
            <Label htmlFor="email" className="transition-colors group-focus-within:text-accent">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent" />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 group">
            <Label htmlFor="telephone" className="transition-colors group-focus-within:text-accent">Téléphone</Label>
            <Input id="telephone" placeholder="+221 78 432 64 86" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent" />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="space-y-2 group">
              <Label htmlFor="password" className="transition-colors group-focus-within:text-accent">Mot de passe</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 caractères" value={form.password} onChange={(e) => update("password", e.target.value)} required className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent pr-10" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="confirm" className="transition-colors group-focus-within:text-accent truncate">Confirmer mot de passe</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm h-11 relative overflow-hidden transition-all" 
              disabled={loading}
            >
              {loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Inscription en cours...</span>
                </motion.div>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </motion.div>
        </motion.form>

        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8"
          initial="hidden" animate="visible" variants={itemVariants}
          transition={{ delay: 0.5 }}
        >
          Déjà un compte ?{" "}
          <Link to="/login" className="text-foreground font-medium hover:text-accent transition-colors">
            Se connecter
          </Link>
        </motion.p>
      </CardContent>
    </Card>
  );
};

export default Register;
