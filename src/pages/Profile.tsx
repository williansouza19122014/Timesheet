
import { useState, useEffect } from "react";
import { User, Upload, MapPin, Mail, Phone, Briefcase, Building2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemUser } from "@/types/users";

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<SystemUser | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState<Address | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = () => {
      // In a real app, this would use the logged-in user's ID
      const currentUserId = "current-user-id"; // This should come from auth context
      const employees = JSON.parse(localStorage.getItem('tempEmployees') || '[]');
      const employee = employees.find((emp: SystemUser) => emp.id === currentUserId);
      
      if (employee) {
        setProfile(employee);
        setEditedAddress(employee.address || {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: ""
        });
      }
    };

    loadProfile();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProfile = {
          ...profile,
          photo: reader.result as string
        };
        setProfile(updatedProfile);

        // Update in localStorage
        const employees = JSON.parse(localStorage.getItem('tempEmployees') || '[]');
        const updatedEmployees = employees.map((emp: SystemUser) => 
          emp.id === profile.id ? updatedProfile : emp
        );
        localStorage.setItem('tempEmployees', JSON.stringify(updatedEmployees));

        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    if (editedAddress) {
      setEditedAddress(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleSaveAddress = () => {
    if (profile && editedAddress) {
      const updatedProfile = {
        ...profile,
        address: editedAddress
      };
      setProfile(updatedProfile);

      // Update in localStorage
      const employees = JSON.parse(localStorage.getItem('tempEmployees') || '[]');
      const updatedEmployees = employees.map((emp: SystemUser) => 
        emp.id === profile.id ? updatedProfile : emp
      );
      localStorage.setItem('tempEmployees', JSON.stringify(updatedEmployees));
      setIsEditingAddress(false);

      toast({
        title: "Endereço atualizado",
        description: "Suas informações foram salvas com sucesso"
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-muted-foreground">Carregando informações...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Meu Perfil</h1>
      
      <div className="grid gap-6">
        {/* Profile Header with Photo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt="Foto do perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
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
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.position}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informações Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <span>{profile.position} - {profile.contract_type}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span>{profile.department}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>Data de Admissão: {formatDate(profile.hire_date)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Endereço</CardTitle>
            {!isEditingAddress && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(true)}>
                Editar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={editedAddress?.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={editedAddress?.number}
                      onChange={(e) => handleAddressChange('number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={editedAddress?.complement}
                      onChange={(e) => handleAddressChange('complement', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={editedAddress?.neighborhood}
                      onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={editedAddress?.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={editedAddress?.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={editedAddress?.zip_code}
                      onChange={(e) => handleAddressChange('zip_code', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditingAddress(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAddress}>
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  {profile.address ? (
                    <>
                      <p>{profile.address.street}, {profile.address.number}</p>
                      {profile.address.complement && <p>{profile.address.complement}</p>}
                      <p>{profile.address.neighborhood}</p>
                      <p>{profile.address.city} - {profile.address.state}</p>
                      <p>CEP: {profile.address.zip_code}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Nenhum endereço cadastrado</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
