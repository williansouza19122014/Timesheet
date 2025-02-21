
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
