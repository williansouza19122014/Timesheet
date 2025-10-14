import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PASSWORD_RESET_STORAGE_KEY = "tempPasswordResets";

type StoredReset = {
  password: string;
  updatedAt: string;
};

const readStoredResets = (): Record<string, StoredReset> => {
  try {
    const raw = localStorage.getItem(PASSWORD_RESET_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredReset>) : {};
  } catch (error) {
    console.error("Erro ao acessar resets aguardados:", error);
    return {};
  }
};

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "Este link de redefinição de senha é inválido ou expirou.",
      });
      navigate("/login", { replace: true });
      return;
    }

    setResetToken(token);
  }, [location.search, navigate, toast]);

  const handleResetPassword = (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetToken) {
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "O link de redefinição não é mais válido.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas diferentes",
        description: "As senhas digitadas não são iguais",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    try {
      const resets = readStoredResets();
      resets[resetToken] = {
        password: newPassword,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify(resets));

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar sua senha",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Redefinir Senha</h1>
            <p className="text-muted-foreground">Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="pl-10 pr-12"
                  placeholder="********"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !resetToken}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Atualizar Senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
