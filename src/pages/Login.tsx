import { useEffect, useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { Mail, Lock, Loader2, Building2, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
};

type LoginFormState = {
  email: string;
  password: string;
};

const DEFAULT_REGISTER_STATE: RegisterFormState = {
  name: "",
  email: "",
  password: "",
};

const DEFAULT_LOGIN_STATE: LoginFormState = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register, isAuthenticated, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginState, setLoginState] = useState(DEFAULT_LOGIN_STATE);
  const [registerState, setRegisterState] = useState(DEFAULT_REGISTER_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, location.state, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get("message");
    if (message === "reset_requested") {
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
    }
  }, [location.search, toast]);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await login(loginState);
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });
      navigate("/");
    } catch (error) {
      console.error("Erro ao realizar login", error);
      const message =
        error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.";
      setErrorMessage(message);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await register(registerState);
      toast({
        title: "Conta criada com sucesso!",
        description: "Faça login com suas credenciais para acessar o painel.",
      });
      setRegisterState(DEFAULT_REGISTER_STATE);
      setActiveTab("login");
      setSuccessMessage("Conta criada com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar usuário", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o cadastro. Tente novamente.";
      const normalizedMessage =
        message?.toLowerCase().includes("conta já existe") ? "Conta já existe" : message;
      setErrorMessage(normalizedMessage);
      setSuccessMessage(null);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: normalizedMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onForgotPassword = () => {
    toast({
      title: "Recuperação de senha",
      description: "Entre em contato com o administrador para redefinir sua senha.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 text-slate-100">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-2xl">
        <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:p-16">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-indigo-200">
                <Building2 className="h-4 w-4" /> Timesheet Intelligence
              </span>
              <h1 className="mt-6 text-4xl font-semibold md:text-5xl">Acesse o painel</h1>
              <p className="mt-3 text-sm text-slate-300 md:text-base">
                Gerencie operações, acompanhe projetos e mantenha o controle de jornadas em um só
                lugar.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-indigo-900/20">
                <p className="text-sm font-medium text-indigo-200">Visão executiva</p>
                <p className="mt-2 text-sm text-slate-300">
                  Dashboards com indicadores em tempo real e alertas inteligentes.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-indigo-900/20">
                <p className="text-sm font-medium text-indigo-200">Fluxos automatizados</p>
                <p className="mt-2 text-sm text-slate-300">
                  Aprovações e notificações conectadas ao time de operações.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-indigo-900/30 md:p-8">
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as "login" | "register");
                if (value === "register") {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                } else {
                  setErrorMessage(null);
                }
              }}
            >
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-slate-800/60">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar conta</TabsTrigger>
              </TabsList>

              {successMessage && (
                <Alert className="mb-4 border-emerald-500/60 bg-emerald-500/10 text-emerald-200">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="loginEmail" className="text-sm font-medium text-slate-200">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="loginEmail"
                        type="email"
                        required
                        value={loginState.email}
                        onChange={(event) =>
                          setLoginState((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className="border-slate-700 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="loginPassword" className="text-sm font-medium text-slate-200">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="loginPassword"
                        type="password"
                        required
                        value={loginState.password}
                        onChange={(event) =>
                          setLoginState((prev) => ({ ...prev, password: event.target.value }))
                        }
                        className="border-slate-700 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500"
                        placeholder="********"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar"}
                  </Button>

                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="w-full text-center text-sm text-indigo-300 hover:text-indigo-200"
                  >
                    Esqueceu sua senha?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="registerName" className="text-sm font-medium text-slate-200">
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="registerName"
                        required
                        value={registerState.name}
                        onChange={(event) =>
                          setRegisterState((prev) => ({ ...prev, name: event.target.value }))
                        }
                        className="border-slate-700 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="registerEmail" className="text-sm font-medium text-slate-200">
                      E-mail corporativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="registerEmail"
                        type="email"
                        required
                        value={registerState.email}
                        onChange={(event) =>
                          setRegisterState((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className="border-slate-700 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="registerPassword" className="text-sm font-medium text-slate-200">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="registerPassword"
                        type="password"
                        required
                        minLength={6}
                        value={registerState.password}
                        onChange={(event) =>
                          setRegisterState((prev) => ({ ...prev, password: event.target.value }))
                        }
                        className="border-slate-700 bg-slate-900/60 pl-10 text-slate-100 placeholder:text-slate-500"
                        placeholder="********"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
