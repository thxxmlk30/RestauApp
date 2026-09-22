import { apiConfig } from '../config/api';

const tokenKey = 'restauapp.apiToken.v1';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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
    if (response.status === 401) {
      clearApiToken();
      window.dispatchEvent(new Event('restauapp:auth-expired'));
    }

    const errorBody = await response.json().catch(() => null);
    const message =
      (Array.isArray(errorBody?.message) ? errorBody.message.join(', ') : errorBody?.message) ||
      `Erreur API ${response.status}`;
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/**
 * Comme apiRequest, mais expose aussi le total renvoye par le backend via
 * l'en-tete X-Total-Count (contrat de pagination non cassant : toujours
 * present, meme quand page/limit ne sont pas fournis).
 */
export async function apiRequestWithCount<T>(path: string, options: ApiOptions = {}): Promise<{ data: T; total: number }> {
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
    if (response.status === 401) {
      clearApiToken();
      window.dispatchEvent(new Event('restauapp:auth-expired'));
    }

    const errorBody = await response.json().catch(() => null);
    const message =
      (Array.isArray(errorBody?.message) ? errorBody.message.join(', ') : errorBody?.message) ||
      `Erreur API ${response.status}`;
    throw new ApiError(response.status, message);
  }

  const data = (response.status === 204 ? undefined : await response.json()) as T;
  const totalHeader = response.headers.get('X-Total-Count');
  const total = totalHeader ? Number(totalHeader) : Array.isArray(data) ? (data as unknown[]).length : 0;

  return { data, total };
}
