import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Shield, Camera, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { user, profile, role, isValidated, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        nom: profile.nom || "",
        prenom: profile.prenom || "",
        telephone: profile.telephone || "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Vérification du type et de la taille
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 5 MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erreur upload", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newAvatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Erreur", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(newAvatarUrl);
      await refreshProfile();
      toast({ title: "Photo de profil mise à jour ✅" });
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
      })
      .eq("user_id", profile.user_id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profil mis à jour ✅" });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mot de passe mis à jour ✅" });
      setPasswordForm({ newPass: "", confirm: "" });
    }
    setChangingPassword(false);
  };

  const roleLabel =
    role === "admin" ? "Administrateur" : role === "bailleur" ? "Bailleur" : "Étudiant";

  const initials = `${form.prenom?.[0] || ""}${form.nom?.[0] || ""}`.toUpperCase() || "U";

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-serif text-2xl font-bold">Mon profil</h1>

        {/* Avatar + Info */}
        <Card className="border-0 shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${form.prenom} ${form.nom}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-7 w-7 bg-accent rounded-full flex items-center justify-center text-accent-foreground hover:bg-accent/90 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Changer la photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="font-serif text-lg font-bold">
                  {form.prenom} {form.nom}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{roleLabel}</Badge>
                  {role === "bailleur" && (
                    <Badge variant={isValidated ? "default" : "secondary"}>
                      {isValidated ? "Validé" : "En attente"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone" className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> Téléphone
                </Label>
                <Input
                  id="telephone"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="+221 77 000 00 00"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input value={user?.email || ""} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié ici.</p>
              </div>
              <Button
                className="w-full bg-gradient-gold text-accent-foreground"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enregistrement...</>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" /> Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPass">Nouveau mot de passe</Label>
              <Input
                id="newPass"
                type="password"
                placeholder="Min. 6 caractères"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPass">Confirmer le mot de passe</Label>
              <Input
                id="confirmPass"
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleChangePassword}
              disabled={changingPassword || !passwordForm.newPass}
            >
              {changingPassword ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mise à jour...</>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
