import { getCookie, isTokenExpired, redirectToLogin } from './auth';

// Создаем функцию для API запросов с проверкой токена
export const apiRequest = async (url, method = 'GET', data = null) => {
  const accessToken = getCookie("accessToken") || localStorage.getItem("adminToken");

  // Проверяем истек ли токен перед запросом
  if (accessToken && isTokenExpired(accessToken)) {
    redirectToLogin();
    return Promise.reject("Token expired");
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
  };

  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(url, options);

    // Проверяем статус ответа
    if (response.status === 401) {
      redirectToLogin();
      return Promise.reject("Unauthorized");
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};