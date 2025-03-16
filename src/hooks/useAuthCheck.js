import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie, isTokenExpired } from '../lib/auth';

// Хук для проверки авторизации в защищенных компонентах
export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getCookie("accessToken") || localStorage.getItem("adminToken");

      if (!accessToken || isTokenExpired(accessToken)) {
        // Токен отсутствует или истек, перенаправляем на страницу входа
        navigate('/login', { replace: true });
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    };

    checkAuth();

    // Проверяем состояние токена каждые 5 минут
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, [navigate]);

  return { isAuthenticated, isLoading };
};