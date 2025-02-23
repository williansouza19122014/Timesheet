
import { useState } from "react";
import { User, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  workHours: string;
  email: string;
  client: string;
  project: string;
  role: string;
  photo: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    workHours: "",
    email: "",
    client: "",
    project: "",
    role: "",
    photo: null
  });

  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          photo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso"
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Perfil</h1>
      
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="Foto do perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full cursor-pointer hover:bg-accent/90 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Horário de Trabalho</label>
              <input
                type="text"
                value={profile.workHours}
                onChange={e => setProfile(prev => ({ ...prev, workHours: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Ex: 09:00 - 18:00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-mail Institucional</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <select
                value={profile.client}
                onChange={e => setProfile(prev => ({ ...prev, client: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Selecione um cliente</option>
                <option value="cliente1">Cliente 1</option>
                <option value="cliente2">Cliente 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Projeto</label>
              <select
                value={profile.project}
                onChange={e => setProfile(prev => ({ ...prev, project: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Selecione um projeto</option>
                <option value="projeto1">Projeto 1</option>
                <option value="projeto2">Projeto 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cargo/Perfil</label>
              <input
                type="text"
                value={profile.role}
                onChange={e => setProfile(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
