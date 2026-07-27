import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
let authToken: string | null = null

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getAuthToken() {
  return authToken
}

export function setAuthToken(token: string) {
  authToken = token
}

export function clearAuthToken() {
  authToken = null
  localStorage.removeItem('auth-token')
  localStorage.removeItem('refresh-token')
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        )

        const newToken = response.data.token
        setAuthToken(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAuthToken()
        window.dispatchEvent(new Event('barberflow-auth-expired'))
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

function normalizeHeaders(headers?: HeadersInit) {
  if (!headers) {
    return undefined
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return headers
}

export function setRefreshToken(token: string) {
  void token
  localStorage.removeItem('refresh-token')
}

export function clearRefreshToken() {
  localStorage.removeItem('refresh-token')
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const headers = normalizeHeaders(options.headers) ?? {}
    const body =
      typeof options.body === 'string'
        ? JSON.parse(options.body)
        : options.body
    const isFormData = body instanceof FormData

    const response = await apiClient.request({
      url: path,
      method: options.method,
      data: body,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      withCredentials: true,
    })

    return response.data as T
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message

      throw new ApiError(message, error.response?.status ?? 500)
    }

    throw error
  }
}
