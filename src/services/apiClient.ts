import { apiConfig } from '../config/api';

const tokenKey = 'restauapp.apiToken.v1';

export function getApiToken() {
  return localStorage.getItem(tokenKey);
}

export function setApiToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function clearApiToken() {
  localStorage.removeItem(tokenKey);
}

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth !== false) {
    const token = getApiToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) clearApiToken();

    const errorBody = await response.json().catch(() => null);
    const message =
      (Array.isArray(errorBody?.message) ? errorBody.message.join(', ') : errorBody?.message) ||
      `Erreur API ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
