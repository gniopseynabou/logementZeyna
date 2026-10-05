import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await requestPasswordReset(email, `${window.location.origin}/reset-password`);

      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        setSent(true);
        toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail." });
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
          <CardTitle className="font-serif text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription className="mt-1.5">Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        {sent ? (
          <motion.div 
            initial="hidden" animate="visible" variants={itemVariants} 
            className="text-center py-8"
          >
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent">
              <Mail className="h-8 w-8" />
            </div>
            <p className="font-medium text-lg">Email envoyé !</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
              Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleReset} 
            className="space-y-5"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
          >
            <motion.div variants={itemVariants} className="space-y-2 group">
              <Label htmlFor="email" className="transition-colors group-focus-within:text-accent">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="votre@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
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
                    <span>Envoi en cours...</span>
                  </motion.div>
                ) : (
                  "Envoyer le lien"
                )}
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-center text-sm text-muted-foreground mt-6"
              variants={itemVariants}
            >
              <Link to="/login" className="text-foreground font-medium hover:text-accent transition-colors">
                Retour à la connexion
              </Link>
            </motion.p>
          </motion.form>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
