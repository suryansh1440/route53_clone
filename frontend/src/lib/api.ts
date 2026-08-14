const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  field?: string;
  code?: string;

  constructor(status: number, message: string, field?: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.field = field;
    this.code = code;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('aws_auth_token') : null;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Sends signed cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);

    if (res.status === 204) {
      return {} as T;
    }

    const data = await res.json().catch(() => ({ detail: 'An unexpected error occurred' }));

    if (!res.ok) {
      const errorMessage = data.detail || 'Request failed';
      const field = data.field;
      const code = data.code;

      throw new ApiError(res.status, errorMessage, field, code);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, err instanceof Error ? err.message : 'Network error');
  }
}
