/**
 * @file API Configuration and HTTP Client
 * @description Configura axios com interceptors de autenticação
 * 
 * Base URL: http://localhost:3000 (local) ou definida em VITE_API_URL
 * 
 * Todas as rotas protegidas usam:
 * - Authorization: Bearer TOKEN
 * - Content-Type: application/json
 * 
 * O access token fica apenas em memória. A renovação usa cookie HttpOnly.
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
let authToken: string | null = null

/**
 * Erro customizado para requisições da API
 * @class ApiError
 * @extends Error
 * @property {number} status - Status HTTP da resposta
 */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Recupera o token JWT do localStorage
 * @returns {string | null} Token armazenado ou null
 */
export function getAuthToken() {
  return authToken
}

/**
 * Armazena o token JWT no localStorage
 * @param {string} token - Token JWT recebido no login
 */
export function setAuthToken(token: string) {
  authToken = token
}

/**
 * Remove o token JWT do localStorage (logout)
 */
export function clearAuthToken() {
  authToken = null
  localStorage.removeItem('auth-token')
  localStorage.removeItem('refresh-token')
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Interceptor para adicionar token na requisição
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
})

// Interceptor de resposta para tratar 401 (token expirado)
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

        // Retenta a requisição original com novo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAuthToken()
        window.location.href = '#/auth/login'
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

/**
 * Função auxiliar para armazenar refresh token
 */
export function setRefreshToken(token: string) {
  void token
  localStorage.removeItem('refresh-token')
}

/**
 * Função auxiliar para limpar refresh token
 */
export function clearRefreshToken() {
  localStorage.removeItem('refresh-token')
}

/**
 * Realiza requisição HTTP autenticada para a API
 * Adiciona token Bearer automaticamente se disponível
 * 
 * @template T - Tipo de dados esperado na resposta
 * @param {string} path - Caminho do endpoint (ex: '/barbershops', '/auth/login')
 * @param {RequestInit} options - Opções de requisição (method, body, headers)
 * @returns {Promise<T>} Dados da resposta convertidos para tipo T
 * @throws {ApiError} Se a requisição falhar
 * 
 * @example
 * const shops = await apiRequest<Barbershop[]>('/barbershops')
 * const result = await apiRequest('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password })
 * })
 */
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
