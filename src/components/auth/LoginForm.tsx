
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Tentando fazer login...");
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Erro no login inicial:", signInError);
        throw signInError;
      }

      if (!signInData.user) {
        console.error("Nenhum usuário retornado após login");
        throw new Error("Erro ao fazer login: usuário não encontrado");
      }

      console.log("Login inicial bem sucedido, buscando perfil...");

      // Buscar perfil do usuário com informações do cliente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, customers(*)')
        .eq('id', signInData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw new Error("Erro ao verificar perfil do usuário");
      }

      if (!profile) {
        console.error('Perfil não encontrado para o usuário');
        throw new Error("Perfil não encontrado");
      }

      console.log("Perfil encontrado:", profile);

      if (!profile.active) {
        throw new Error("Sua conta está inativa. Entre em contato com o administrador.");
      }

      // Verificar se é admin para teste@gmail.com
      if (email === 'teste@gmail.com' && profile.role !== 'admin') {
        console.log("Atualizando permissões para admin...");
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', signInData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
          throw new Error("Erro ao atualizar permissões de administrador");
        }
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema",
      });

      navigate("/");
    } catch (error: any) {
      console.error('Erro detalhado no login:', error);
      
      let errorMessage = "Erro ao fazer login. ";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else {
        errorMessage += error.message || "Verifique suas credenciais e tente novamente";
      }

      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: errorMessage,
      });
      
      // Se for erro de autenticação, fazer logout para limpar qualquer estado
      if (error.message?.includes("Invalid login")) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email necessário",
        description: "Digite seu email para recuperar a senha",
      });
      return;
    }

    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">TimeSheet</h1>
        <h2 className="text-xl font-medium text-muted-foreground">
          Sistema de Gestão de Horas
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            "Entrar"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isResetting}
          onClick={handleResetPassword}
        >
          {isResetting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Esqueci minha senha"
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
