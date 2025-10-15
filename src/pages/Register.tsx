import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Building2, FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const CUSTOMERS_STORAGE_KEY = "tempCustomers";

type RegisterFormState = {
  email: string;
  password: string;
  companyName: string;
  cnpj: string;
};

type StoredCustomer = {
  id: string;
  company_name: string;
  cnpj: string;
  subscription_status: string;
  created_at: string;
};

const readStoredCustomers = (): StoredCustomer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCustomer[]) : [];
  } catch (error) {
    console.error("Erro ao ler clientes armazenados:", error);
    return [];
  }
};

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormState>({
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.companyName || !formData.cnpj) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Informe o nome da empresa e o CNPJ para continuar.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const customers = readStoredCustomers();
      const cnpjExists = customers.some(
        (customer) => customer.cnpj.replace(/\D/g, "") === formData.cnpj.replace(/\D/g, "")
      );

      if (cnpjExists) {
        throw new Error("Já existe uma conta registrada com este CNPJ.");
      }

      const newCustomer: StoredCustomer = {
        id: crypto.randomUUID(),
        company_name: formData.companyName,
        cnpj: formData.cnpj,
        subscription_status: "active",
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(
        CUSTOMERS_STORAGE_KEY,
        JSON.stringify([...customers, newCustomer])
      );

      await register({
        name: formData.companyName,
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Seu tenant foi provisionado e voce ja esta autenticado.",
      });

      setFormData({
        email: "",
        password: "",
        companyName: "",
        cnpj: "",
      });

      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta.";
      console.error("Erro no registro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Criar Conta Admin</h1>
            <h2 className="text-xl font-medium text-muted-foreground">
              Cadastro inicial do administrador
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                  className="pl-10"
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cnpj" className="text-sm font-medium">
                CNPJ
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(event) => setFormData((prev) => ({ ...prev, cnpj: event.target.value }))}
                  className="pl-10"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="pl-10 pr-12"
                  placeholder="********"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Conta"}
            </Button>

            <div className="text-center">
              <Button type="button" variant="link" onClick={() => navigate("/login")}>
                Já tem uma conta? Faça login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
