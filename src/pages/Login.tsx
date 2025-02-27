
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando para o dashboard...",
      });

      // Aguardar um momento antes de redirecionar
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error: any) {
      console.error('Erro no login:', error);
      setErrorMessage(error.message || "Erro ao fazer login. Verifique suas credenciais.");
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // Usuário já existe? Prosseguir com login
      if (authData.user && !authData.session) {
        toast({
          title: "Usuário já existe",
          description: "Faça login com suas credenciais.",
        });
        setIsLoading(false);
        return;
      }

      // 2. Verificar se a tabela customers existe, senão, pular esta etapa
      try {
        // 2. Criar cliente
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert([
            {
              company_name: formData.companyName,
              cnpj: formData.cnpj,
              subscription_status: 'active',
            }
          ])
          .select()
          .single();

        if (customerError) {
          console.warn('Erro ao criar cliente, continuando sem criar cliente:', customerError);
        }

        // 3. Atualizar perfil do usuário como admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            customer_id: customer?.id,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.warn('Erro ao atualizar perfil, tentando método alternativo:', profileError);
          
          // Método alternativo: update direto via SQL RPC
          const { error: rpcError } = await supabase.rpc('set_user_as_admin', {
            user_id: authData.user.id
          });
          
          if (rpcError) {
            console.error('Erro no método alternativo:', rpcError);
          }
        }
      } catch (err) {
        console.warn('Erro ao configurar cliente/perfil, mas continuando com autenticação:', err);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });

      // Redirecionar para o dashboard, já que o usuário está logado
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error('Erro detalhado no registro:', error);
      setErrorMessage(
        error.message || 
        "Ocorreu um erro ao criar sua conta. Verifique seus dados e tente novamente."
      );
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm">
        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar Admin</TabsTrigger>
          </TabsList>

          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
                <h2 className="text-xl font-medium text-muted-foreground">
                  Faça login na sua conta
                </h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
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
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                    />
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
                    "Entrar"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Criar Conta Admin</h1>
                <h2 className="text-xl font-medium text-muted-foreground">
                  Cadastro inicial do administrador
                </h2>
              </div>

              <form onSubmit={handleRegisterAdmin} className="space-y-4">
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
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="registerEmail" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="registerEmail"
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
                  <label htmlFor="registerPassword" className="text-sm font-medium">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="registerPassword"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                    />
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
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
