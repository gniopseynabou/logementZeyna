import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getDashboardPathByRole } from "@/lib/permissions";
import { signInWithRole } from "@/services/auth-service";

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error, role } = await signInWithRole(email, password);

      if (error) {
        toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
      } else if (role) {
        toast({ title: "Connexion réussie", description: "Bienvenue dans votre espace Zeyna !" });
        navigate(getDashboardPathByRole(role));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-premium w-full bg-card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-accent/50 to-accent" />
      <CardHeader className="pb-6">
        <motion.div initial="hidden" animate="visible" variants={itemVariants}>
          <CardTitle className="font-serif text-2xl">Se connecter</CardTitle>
          <CardDescription className="mt-1.5">Entrez vos identifiants pour accéder à votre espace</CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        <motion.form 
          onSubmit={handleLogin} 
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
          
          <motion.div variants={itemVariants} className="space-y-2 group">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="transition-colors group-focus-within:text-accent">Mot de passe</Label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-accent transition-colors">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
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

          <motion.div variants={itemVariants} className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm h-11 relative overflow-hidden transition-all" 
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </motion.div>
              ) : (
                "Se connecter"
              )}
            </Button>
          </motion.div>
        </motion.form>

        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8"
          initial="hidden" animate="visible" variants={itemVariants}
          transition={{ delay: 0.4 }}
        >
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-foreground font-medium hover:text-accent transition-colors">
            Créer un compte
          </Link>
        </motion.p>
      </CardContent>
    </Card>
  );
};

export default Login;
