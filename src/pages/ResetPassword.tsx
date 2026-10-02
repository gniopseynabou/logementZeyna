import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isPasswordRecoveryLink, resetUserPassword } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecoveryLinkValid] = useState(() => isPasswordRecoveryLink(window.location.hash));
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isRecoveryLinkValid) {
      toast({ title: "Lien invalide", description: "Ce lien de réinitialisation n'est pas valide.", variant: "destructive" });
    }
  }, [isRecoveryLinkValid, toast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecoveryLinkValid) return;
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
        toast({ title: "Mot de passe mis à jour", description: "Vous pouvez maintenant vous connecter." });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Zeyna" className="h-16 w-auto" />
        </div>

        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Nouveau mot de passe</CardTitle>
            <CardDescription>Choisissez un nouveau mot de passe sécurisé</CardDescription>
          </CardHeader>
          <CardContent>
            {!isRecoveryLinkValid ? (
              <div className="space-y-3 text-center" role="alert">
                <p className="text-sm text-destructive">Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/forgot-password">Demander un nouveau lien</Link>
                </Button>
              </div>
            ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-accent-foreground" disabled={loading}>
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
