
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email_or_phone: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("https://owntrainer.uz/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.email_or_phone?.[0] || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong while trying to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-admin-dark p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <h1 className="text-2xl font-semibold text-center mb-8">
            Tizimga kirish
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Email yoki telefon raqami"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                value={formData.email_or_phone}
                onChange={(e) =>
                  setFormData({ ...formData, email_or_phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Parol"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg bg-white text-admin-dark font-medium transition-all transform hover:bg-white/90 active:scale-[0.99] ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Loading..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
