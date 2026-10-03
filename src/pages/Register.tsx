import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerUser, type RegistrationRole } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Building } from "lucide-react";
import logo from "@/assets/logo-zeyna.png";

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
        role: form.role,
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast({ title: "Erreur d'inscription", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Inscription réussie !", description: "Vérifiez votre email pour confirmer votre compte." });
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-accent transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Zeyna" className="h-16 w-auto" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary-foreground">Créer un compte</h1>
        </div>

        <Card className="border-0 shadow-premium">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-xl">Inscription</CardTitle>
            <CardDescription>Rejoignez la communauté Zeyna</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role selection */}
              <div className="space-y-3">
                <Label>Je suis</Label>
                <RadioGroup value={form.role} onValueChange={(v) => update("role", v)} className="grid grid-cols-2 gap-3">
                  <Label htmlFor="r-etudiant" className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === "etudiant" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}>
                    <RadioGroupItem value="etudiant" id="r-etudiant" />
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-accent" />
                      <span className="font-medium">Étudiant</span>
                    </div>
                  </Label>
                  <Label htmlFor="r-bailleur" className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === "bailleur" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}>
                    <RadioGroupItem value="bailleur" id="r-bailleur" />
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-accent" />
                      <span className="font-medium">Bailleur</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" placeholder="Diallo" value={form.nom} onChange={(e) => update("nom", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" placeholder="Aminata" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" placeholder="+221 77 000 00 00" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 caractères" value={form.password} onChange={(e) => update("password", e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input id="confirm" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
              </div>

              <Button type="submit" className="w-full bg-gradient-gold text-accent-foreground shadow-gold" disabled={loading}>
                {loading ? "Inscription..." : "Créer mon compte"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-accent font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
