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
  const [errors, setErrors] = useState({
    email_or_phone: "",
    password: "",
    general: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to set cookies with expiration
  const setCookie = (name, value, days) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const cookieValue = encodeURIComponent(value) +
      (days ? `; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict` : "");
    document.cookie = `${name}=${cookieValue}`;
  };

  // Валидация формы перед отправкой
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email_or_phone: "",
      password: "",
      general: ""
    };

    // Проверка логина (email или телефон)
    if (!formData.email_or_phone.trim()) {
      newErrors.email_or_phone = "Email yoki telefon raqami kiritilishi shart";
      isValid = false;
    } else if (formData.email_or_phone.includes('@')) {
      // Проверка формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_or_phone)) {
        newErrors.email_or_phone = "Email formati noto'g'ri";
        isValid = false;
      }
    } else {
      // Проверка формата телефона
      const phoneRegex = /^\+?[0-9]{10,13}$/;
      if (!phoneRegex.test(formData.email_or_phone)) {
        newErrors.email_or_phone = "Telefon raqami formati noto'g'ri";
        isValid = false;
      }
    }

    // Проверка пароля
    if (!formData.password) {
      newErrors.password = "Parol kiritilishi shart";
      isValid = false;
    } else if (formData.password.length < 4) {
      newErrors.password = "Parol kamida 4 belgidan iborat bo'lishi kerak";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверяем форму перед отправкой
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://owntrainer.uz/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const { access, refresh } = data;

        // Store tokens in cookies with expirations
        // Access token - 1 hour expiration (or match your JWT expiration)
        setCookie("accessToken", access, 1);

        // Refresh token - 7 days expiration (adjust as needed)
        setCookie("refreshToken", refresh, 7);

        // You can still keep a copy in localStorage if needed
        localStorage.setItem("adminToken", access);

        toast({
          title: "Muvaffaqiyatli",
          description: "Tizimga muvaffaqiyatli kirdingiz",
          variant: "success",
        });

        navigate("/dashboard");
      } else {
        // Обрабатываем различные типы ошибок от сервера
        if (data.email_or_phone) {
          setErrors({...errors, email_or_phone: data.email_or_phone[0]});
        } else if (data.password) {
          setErrors({...errors, password: data.password[0]});
        } else if (data.detail) {
          setErrors({...errors, general: data.detail});
        } else if (data.non_field_errors) {
          setErrors({...errors, general: data.non_field_errors[0]});
        } else {
          setErrors({...errors, general: "Noto'g'ri login yoki parol"});
        }

        toast({
          title: "Xatolik",
          description: data.detail || data.non_field_errors?.[0] || "Noto'g'ri login yoki parol",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        ...errors,
        general: "Serverga ulanishda xatolik yuz berdi"
      });

      toast({
        title: "Xatolik",
        description: "Serverga ulanishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Очистка ошибки поля при изменении данных
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ""
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-admin-dark p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <h1 className="text-2xl font-semibold text-center mb-8">
            Tizimga kirish
          </h1>

          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Email yoki telefon raqami"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  errors.email_or_phone 
                    ? "border-red-500/50 focus:border-red-500/70" 
                    : "border-white/10 focus:border-white/20"
                } focus:outline-none transition-colors`}
                value={formData.email_or_phone}
                onChange={(e) => handleInputChange("email_or_phone", e.target.value)}
                required
              />
              {errors.email_or_phone && (
                <p className="text-red-400 text-sm mt-1 pl-1">{errors.email_or_phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Parol"
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                    errors.password 
                      ? "border-red-500/50 focus:border-red-500/70" 
                      : "border-white/10 focus:border-white/20"
                  } focus:outline-none transition-colors`}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 pl-1">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg bg-white text-admin-dark font-medium transition-all transform hover:bg-white/90 active:scale-[0.99] ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Yuklanmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;