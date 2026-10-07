import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isPasswordRecoveryLink, resetUserPassword, getInviteLinkType } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecoveryLinkValid] = useState(() => isPasswordRecoveryLink(window.location.hash));
  const linkType = getInviteLinkType(window.location.hash);
  const isInvite = linkType === "invite";
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Optionnel: vérifier si on a une session active. 
    // Si l'utilisateur clique sur le lien, Supabase le connecte automatiquement.
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { error } = await resetUserPassword(password);

      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: isInvite ? "Compte activé ✅" : "Mot de passe mis à jour ✅",
          description: isInvite
            ? "Votre compte a été créé. Vous pouvez maintenant vous connecter."
            : "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-premium w-full bg-card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-accent/50 to-accent" />
      <CardHeader className="pb-6">
        <motion.div initial="hidden" animate="visible" variants={itemVariants}>
          <CardTitle className="font-serif text-2xl">
            {isInvite ? "Créer votre mot de passe" : "Nouveau mot de passe"}
          </CardTitle>
          <CardDescription className="mt-1.5">
            {isInvite
              ? "Bienvenue ! Choisissez un mot de passe pour activer votre compte."
              : "Choisissez un nouveau mot de passe sécurisé"}
          </CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent>
          <motion.form 
            onSubmit={handleReset} 
            className="space-y-5"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          >
            <motion.div variants={itemVariants} className="space-y-2 group">
              <Label className="transition-colors group-focus-within:text-accent">Nouveau mot de passe</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 6 caractères" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent pr-10"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 group">
              <Label className="transition-colors group-focus-within:text-accent">Confirmer</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                required 
                className="transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm h-11 relative overflow-hidden transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </motion.div>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </motion.div>
          </motion.form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
