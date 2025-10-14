import { useEffect, useMemo, useRef, useState } from "react";
import { User, Upload, Phone, Briefcase, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchCurrentUserProfile,
  updateUserProfile,
  type UserProfile,
  type UserAddress,
} from "@/lib/users-api";
import { format } from "date-fns";

const panelSurface =
  "rounded-3xl border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_20px_60px_-25px_rgba(15,23,42,0.9)]";

const tileSurface =
  "rounded-xl border border-slate-200/70 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/55";

const infoLabel =
  "text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400";

const inputSurface =
  "border-slate-200/70 bg-white/95 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#7C6CFF] focus-visible:ring-offset-0 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return format(parsed, "dd/MM/yyyy");
};

const createEmptyAddress = (): UserAddress => ({
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsDataURL(file);
  });

const Profile = () => {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    position: "",
    department: "",
  });
  const [address, setAddress] = useState<UserAddress>(createEmptyAddress());
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCurrentUserProfile();
        setProfile(data);
        setContactInfo({
          phone: data.phone ?? "",
          position: data.position ?? "",
          department: data.department ?? "",
        });
        setAddress({
          ...createEmptyAddress(),
          ...(data.address ?? {}),
        });
      } catch (error) {
        console.error("Failed to load profile", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Tente novamente em instantes.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  const avatarUrl = useMemo(() => {
    if (profile?.photo) return profile.photo;
    return null;
  }, [profile]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!profile) return;
      const file = event.target.files?.[0];
      if (!file) return;

      const dataUrl = await readFileAsDataUrl(file);
      const updated = await updateUserProfile(profile.id, { photo: dataUrl });
      setProfile(updated);
      await refreshUser();
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Failed to upload photo", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar foto",
        description: "Verifique o arquivo e tente novamente.",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleContactSave = async () => {
    if (!profile) return;
    try {
      setIsSavingContact(true);
      const updated = await updateUserProfile(profile.id, {
        phone: contactInfo.phone || null,
        position: contactInfo.position || null,
        department: contactInfo.department || null,
      });
      setProfile(updated);
      await refreshUser();
      toast({
        title: "Informacoes atualizadas",
        description: "Dados de contato salvos com sucesso.",
      });
    } catch (error) {
      console.error("Failed to update contact info", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar contatos",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleAddressSave = async () => {
    if (!profile) return;
    try {
      setIsSavingAddress(true);
      const updated = await updateUserProfile(profile.id, {
        address,
      });
      setProfile(updated);
      toast({
        title: "Endereço atualizado",
        description: "As informações de endereço foram salvas.",
      });
    } catch (error) {
      console.error("Failed to update address", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar endereço",
        description: "Verifique os campos e tente novamente.",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "A nova senha deve ter ao menos 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas diferentes",
        description: "As senhas informadas devem ser iguais.",
      });
      return;
    }

    try {
      setIsSavingPassword(true);
      await updateUserProfile(profile.id, { password: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      console.error("Failed to update password", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Carregando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Não foi possível carregar as informações do perfil.
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Meu Perfil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie suas informações pessoais e de acesso.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className={panelSurface}>
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-white/90 dark:border-white/10 dark:bg-slate-900/60">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                    <User className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {profile.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">{profile.email}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {profile.role === "ADMIN"
                    ? "Administrador"
                    : profile.role === "MANAGER"
                      ? "Gestor"
                      : "Colaborador"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Admissão: {formatDate(profile.hireDate)}</span>
                  <span>&bull;</span>
                  <span>Status: {profile.status === "ACTIVE" ? "Ativo" : "Inativo"}</span>
                </div>
              </div>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="profile-photo"
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-slate-200 bg-white/90 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Alterar foto
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`${tileSurface} flex items-center gap-3`}>
                <Phone className="h-5 w-5 text-accent" />
                <div>
                  <p className={infoLabel}>Telefone</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {profile.phone ?? "Não informado"}
                  </p>
                </div>
              </div>
              <div className={`${tileSurface} flex items-center gap-3`}>
                <Briefcase className="h-5 w-5 text-accent" />
                <div>
                  <p className={infoLabel}>Cargo</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {profile.position ?? "Não definido"}
                  </p>
                </div>
              </div>
              <div className={`${tileSurface} flex items-center gap-3`}>
                <Building2 className="h-5 w-5 text-accent" />
                <div>
                  <p className={infoLabel}>Departamento</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {profile.department ?? "Não definido"}
                  </p>
                </div>
              </div>
              <div className={`${tileSurface} text-sm text-slate-600 dark:text-slate-300`}>
                <p className={infoLabel}>Jornada padrão</p>
                <p>
                  {profile.workSchedule?.startTime && profile.workSchedule?.endTime
                    ? `${profile.workSchedule.startTime} - ${profile.workSchedule.endTime}`
                    : "Não configurado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={panelSurface}>
          <CardHeader>
            <CardTitle>Atualizar contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Telefone
              </Label>
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(event) => setContactInfo((prev) => ({ ...prev, phone: event.target.value }))}
                className={inputSurface}
              />
            </div>
            <div>
              <Label htmlFor="position" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Cargo
              </Label>
              <Input
                id="position"
                value={contactInfo.position}
                onChange={(event) =>
                  setContactInfo((prev) => ({ ...prev, position: event.target.value }))
                }
                className={inputSurface}
              />
            </div>
            <div>
              <Label htmlFor="department" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Departamento
              </Label>
              <Input
                id="department"
                value={contactInfo.department}
                onChange={(event) =>
                  setContactInfo((prev) => ({ ...prev, department: event.target.value }))
                }
                className={inputSurface}
              />
            </div>
            <Button type="button" onClick={handleContactSave} disabled={isSavingContact}>
              {isSavingContact ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className={panelSurface}>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="street" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Rua
                </Label>
                <Input
                  id="street"
                  value={address.street ?? ""}
                  onChange={(event) => setAddress((prev) => ({ ...prev, street: event.target.value }))}
                  className={inputSurface}
                />
              </div>
              <div>
                <Label htmlFor="number" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Número
                </Label>
                <Input
                  id="number"
                  value={address.number ?? ""}
                  onChange={(event) => setAddress((prev) => ({ ...prev, number: event.target.value }))}
                  className={inputSurface}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="complement"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Complemento
                </Label>
                <Input
                  id="complement"
                  value={address.complement ?? ""}
                  onChange={(event) =>
                    setAddress((prev) => ({ ...prev, complement: event.target.value }))
                  }
                  className={inputSurface}
                />
              </div>
              <div>
                <Label
                  htmlFor="neighborhood"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Bairro
                </Label>
                <Input
                  id="neighborhood"
                  value={address.neighborhood ?? ""}
                  onChange={(event) =>
                    setAddress((prev) => ({ ...prev, neighborhood: event.target.value }))
                  }
                  className={inputSurface}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Cidade
                </Label>
                <Input
                  id="city"
                  value={address.city ?? ""}
                  onChange={(event) => setAddress((prev) => ({ ...prev, city: event.target.value }))}
                  className={inputSurface}
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Estado
                </Label>
                <Input
                  id="state"
                  value={address.state ?? ""}
                  onChange={(event) => setAddress((prev) => ({ ...prev, state: event.target.value }))}
                  className={inputSurface}
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  CEP
                </Label>
                <Input
                  id="zipCode"
                  value={address.zipCode ?? ""}
                  onChange={(event) => setAddress((prev) => ({ ...prev, zipCode: event.target.value }))}
                  className={inputSurface}
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddressSave} disabled={isSavingAddress}>
              {isSavingAddress ? "Salvando..." : "Salvar endereço"}
            </Button>
          </CardContent>
        </Card>

        <Card className={panelSurface}>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Nova senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={6}
                  required
                  className={inputSurface}
                />
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Confirmar nova senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={6}
                  required
                  className={inputSurface}
                />
              </div>
              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? "Atualizando..." : "Atualizar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
