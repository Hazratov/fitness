// Функция для проверки истечения срока JWT токена
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Получаем центральную часть токена JWT (payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    // Проверяем срок действия (exp - время истечения в секундах)
    const currentTime = Math.floor(Date.now() / 1000); // Текущее время в секундах
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true; // Считаем токен истекшим при ошибке парсинга
  }
};

// Функция для получения токена из cookie
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return undefined;
};

// Функция для очистки токенов при выходе из системы
export const clearAuthTokens = () => {
  // Удаляем токены из cookie
  document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Удаляем из localStorage для обратной совместимости
  localStorage.removeItem("adminToken");
};

// Функция перенаправления на страницу входа
export const redirectToLogin = () => {
  clearAuthTokens();
  window.location.href = "/login";
};