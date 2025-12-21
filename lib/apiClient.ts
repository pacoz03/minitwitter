export class ApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// FIX: Use Omit to exclude the original 'body' type so we can override it
interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: object;
}

async function apiClient<T>(
  endpoint: string,
  { body, ...customConfig }: ApiClientOptions = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    // Default method to POST if body exists, otherwise GET
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch("http://localhost:4000" + endpoint, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `An unexpected error occurred`;
    throw new ApiError(errorMessage, response.status);
  }
  
  if (response.status === 204) {
    return Promise.resolve({} as T);
  }

  return await response.json();
}

export default apiClient;