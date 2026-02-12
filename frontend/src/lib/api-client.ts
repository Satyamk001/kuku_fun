import axios, { type AxiosRequestConfig, type AxiosError, type AxiosInstance } from 'axios';

export function createBrowserApiClient(getToken: () => Promise<string | null>): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
    withCredentials: false
  });

  client.interceptors.request.use(async config => {
    const token = await getToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  return client;
}

export async function apiGet<T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.get<{ data: T }>(url, config);

  return response.data.data;
}

// For endpoints that return the full response object (e.g., with pagination metadata)
export async function apiGetRaw<T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.get<T>(url, config);

  return response.data;
}

export async function apiPatch<TBody, TResponse>(
  client: AxiosInstance,
  url: string,
  body: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const res = await client.patch<{ data: TResponse }>(url, body, config);

  return res.data.data;
}

export async function apiPost<T>(
  client: AxiosInstance,
  url: string,
  body: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.post<{ data: T }>(url, body, config);
  return res.data.data;
}
