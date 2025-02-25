
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Building2, FileNumber, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Criar cliente
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            company_name: formData.companyName,
            cnpj: formData.cnpj,
            subscription_status: 'active', // Começa ativo para testes
          }
        ])
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 3. Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          customer_id: customer.id,
        })
        .eq('id', authData.user!.id);

      if (profileError) throw profileError;

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login no sistema.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm">
        <div className="space-y-8">
          <div className="text-center space-y-2">
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
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                <FileNumber className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Criar Conta"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/login")}
              >
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
