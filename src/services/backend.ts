/**
 * @file Backend API Service
 * @description Integrações com a API backend da barbearia
 * 
 * Endpoints disponíveis:
 * - Auth: login, register, refresh token, trocar senha, esqueci senha
 * - Barbearias: listar, detalhe por slug
 * - Agendamentos: criar, listar, cancelar, reagendar, atualizar status
 * - Availability: consultar horários disponíveis
 */

import type { Barber, Barbershop, Booking, Service, User } from '../types/models'
import coverClassic from '../assets/barbershops/cover-classic.webp'
import coverModern1 from '../assets/barbershops/cover-modern-1.webp'
import coverModern2 from '../assets/barbershops/cover-modern-2.webp'
import coverUrban from '../assets/barbershops/cover-urban.webp'
import {
  ApiError,
  apiRequest,
  getAuthToken,
  setAuthToken,
} from './api'

/** Resposta da API ao registrar usuário - POST /api/auth/register */
type ApiRegisterResponse = {
  id: string
  name: string
  email: string
  phone: string
}

/**
 * Resposta da API ao fazer login - POST /api/auth/login
 * @property {string} token - JWT token para autenticação
 * @property {string} refreshToken - Token para renovar autenticação
 * @property {Object} account - Dados da conta autenticada
 * @property {string} account.id - ID do usuário
 * @property {string} account.email - Email do usuário
 * @property {string} account.role - Papel do usuário (CLIENT, BARBER, ADMIN)
 */
type ApiLoginResponse = {
  token: string
  role?: string
  account?: {
    id: string
    email: string
    role: 'CLIENT' | 'BARBER' | 'BARBERSHOP_ADMIN' | 'SUPER_ADMIN'
  }
}

type ApiCurrentAccount = {
  id: string
  email: string
  role: 'CLIENT' | 'BARBER' | 'BARBERSHOP_ADMIN' | 'SUPER_ADMIN'
  type?: string
  data?: {
    id?: string
    name?: string
    phone?: string
  }
}

/** Referência de barbeiro dentro de um serviço */
type ApiBarberRef = {
  id?: string
  name?: string
  barber?: {
    id: string
    name: string
  }
}

/**
 * Serviço oferecido pela barbearia
 * GET /api/barbershops/:barbershopId/services
 */
type ApiService = {
  id: string
  name: string
  price: number
  duration: number // em minutos
  barbers: ApiBarberRef[]
}

/**
 * Barbearia - GET /api/barbershops e GET /api/barbershops/:slug
 */
type ApiBarbershop = {
  id: string
  name: string
  slug: string
  image?: string | null
  logoUrl?: string | null
  coverUrl?: string | null
  phoneOwner?: string | null
  address?: string | null
  workingHours?: Array<{ weekDay: number; startTime: string; endTime: string }>
  services: ApiService[]
}

const barbershopCovers = [coverModern1, coverClassic, coverUrban, coverModern2]

function getBarbershopCover(identifier: string) {
  const index = Array.from(identifier).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )

  return barbershopCovers[index % barbershopCovers.length]
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('/uploads/')) return url

  try {
    const parsed = new URL(url)
    if (['localhost', '127.0.0.1'].includes(parsed.hostname) && parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname
    }
  } catch {
    return url
  }

  return url
}

function mapAdminBarbershop(shop: AdminBarbershop): AdminBarbershop {
  return {
    ...shop,
    logoUrl: resolveMediaUrl(shop.logoUrl) || null,
    coverUrl: resolveMediaUrl(shop.coverUrl) || null,
  }
}

/**
 * Agendamento - GET /api/bookings/:bookingId e POST /api/bookings
 * Status possíveis: SCHEDULED | CANCELLED | COMPLETED
 */
export type ApiBooking = {
  id: string
  day: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  totalDuration?: number // em minutos
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
  clientId: string
  barberId: string
  barbershopId: string
  barber: { id: string; name: string }
  client?: { id?: string; name?: string; phone?: string }
  barbershop: { id: string; name: string }
  services: Array<{
    service: {
      id: string
      name: string
      price?: number
      duration?: number
    }
  }>
  cancellationReason?: string | null
  cancelledAt?: string | null
  completedAt?: string | null
  amountPaid?: number | null
}

export type AdminBarbershop = {
  id: string
  name: string
  slug: string
  cnpj?: string | null
  address?: string | null
  phoneOwner?: string | null
  latitude?: number | null
  longitude?: number | null
  plan?: string
  setupCompleted?: boolean
  createdAt?: string
  logoUrl?: string | null
  coverUrl?: string | null
}

export type WorkingHour = {
  id?: string
  weekDay: number
  startTime: string
  endTime: string
}

export type AdminService = {
  id: string
  name: string
  price: number
  duration: number
}

export type AdminBarber = {
  id: string
  name: string
  email: string
  phone: string
  services: Array<{
    id: string
    name: string
    duration: number
  }>
}

export type BarberInvite = {
  id: string
  name: string
  email: string
  phone: string
  serviceIds: string[]
  inviteUrl: string
  createdAt: string
  expiresAt: string
}

export type CreateBarberInviteResponse = {
  id: string
  token: string
  inviteUrl: string
  emailSent: boolean
  message: string
}

export type BarberInviteDetails = {
  token: string
  email: string
  name: string
  phone: string
  expiresAt: string
  barbershop: {
    id: string
    name: string
    address?: string | null
  }
}

export type AdminDashboardSummary = {
  totalBarbershops: number
  activeBarbershops: number
  totalBookings: number
  totalRevenue: number
  totalUsers: number
  monthlyRevenue: Array<{ month: number; revenue: number }>
  recentBarbershops: AdminBarbershop[]
}

export type AdminBarbershopDashboard = {
  barbershop: AdminBarbershop
  totalBookings: number
  todayBookings: number
  totalRevenue: number
  todayRevenue: number
  weeklyBookings: Array<{ day: string; count: number }>
  barbers: Array<{ id: string; name: string; phone?: string; email?: string }>
  services: AdminService[]
  appointmentsToday: Array<ApiBooking & {
    client?: {
      name?: string
      phone?: string
    }
  }>
  upcomingWeekAppointments: ApiBooking[]
  activeClients: Array<{
    id: string
    name: string
    phone: string
    visits: number
    lastVisit: string | null
  }>
}

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'BARBERSHOP_ADMIN' | 'BARBER' | 'CLIENT'
  barbershop?: string | null
  status?: string
  createdAt?: string
}

export type BarberProfile = {
  id: string
  name: string
  phone: string
  barbershopId: string
  barbershop: { id: string; name: string; slug: string }
  services: Array<{ id: string; name: string; price: number; duration: number }>
  availability: Array<{ weekDay: number; startTime: string; endTime: string }>
}

function toTitleSlug(input: string) {
  return input
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function uniqueBarbers(services: ApiService[]): Barber[] {
  const seen = new Map<string, Barber>()

  services.forEach((service) => {
    service.barbers.forEach((item) => {
      const barber = item.barber ?? (item.id && item.name ? { id: item.id, name: item.name } : null)

      if (barber && !seen.has(barber.id)) {
        seen.set(barber.id, { id: barber.id, name: barber.name })
      }
    })
  })

  return Array.from(seen.values())
}

function mapService(service: ApiService): Service {
  return {
    id: service.id,
    name: service.name,
    description: '',
    price: service.price,
    duration: service.duration,
    image: '',
    barberIds: service.barbers
      .map((item) => item.barber?.id ?? item.id)
      .filter((id): id is string => Boolean(id)),
  }
}

export function mapAccountRole(role?: string): User['role'] {
  if (role === 'BARBER') return 'professional'
  if (role === 'BARBERSHOP_ADMIN' || role === 'SUPER_ADMIN') return 'admin'
  return 'customer'
}

/**
 * Mapeia dados da API para modelo frontend
 * Transforma ApiBarbershop para Barbershop com dados locais
 * 
 * @param {ApiBarbershop} apiBarbershop - Dados brutos da API
 * @returns {Barbershop} Barbershop formatado para uso no frontend
 */
export function mapApiBarbershop(apiBarbershop: ApiBarbershop): Barbershop {
  const services = apiBarbershop.services.map(mapService)
  const professionals = uniqueBarbers(apiBarbershop.services)
  const starts = apiBarbershop.workingHours?.map((item) => item.startTime) ?? []
  const ends = apiBarbershop.workingHours?.map((item) => item.endTime) ?? []

  return {
    id: apiBarbershop.id,
    slug: apiBarbershop.slug,
    name: apiBarbershop.name,
    description: '',
    address: apiBarbershop.address ?? '',
    phone: apiBarbershop.phoneOwner ?? '',
    email: '',
    image: resolveMediaUrl(apiBarbershop.coverUrl) || resolveMediaUrl(apiBarbershop.logoUrl) || resolveMediaUrl(apiBarbershop.image) || getBarbershopCover(apiBarbershop.id),
    rating: 0,
    workingHours: {
      start: starts.sort()[0] ?? '',
      end: ends.sort().at(-1) ?? '',
    },
    services,
    professionals,
    barbers: professionals,
  }
}

/**
 * Mapeia agendamento da API para modelo frontend
 * 
 * @param {ApiBooking} apiBooking - Dados brutos do agendamento
 * @returns {Booking} Agendamento formatado para uso no frontend
 */
export function mapApiBooking(apiBooking: ApiBooking): Booking {
  const firstService = apiBooking.services[0]?.service

  return {
    id: apiBooking.id,
    barbershopId: apiBooking.barbershopId,
    barbershopName: apiBooking.barbershop.name,
    serviceId: firstService?.id ?? '',
    serviceName: apiBooking.services.map((item) => item.service.name).join(', ') || 'Servico',
    services: apiBooking.services.map(({ service }) => ({
      id: service.id,
      name: service.name,
      price: service.price ?? 0,
      duration: service.duration ?? 0,
    })),
    barberId: apiBooking.barberId,
    barberName: apiBooking.barber.name,
    clientName: apiBooking.client?.name,
    amountPaid: apiBooking.amountPaid,
    endTime: apiBooking.endTime,
    date: apiBooking.day,
    time: apiBooking.startTime,
    userId: apiBooking.clientId,
    status: apiBooking.status,
  }
}

/**
 * Registra novo usuário (cliente)
 * POST /api/auth/register
 * 
 * @param {Object} payload - Dados do novo usuário
 * @param {string} payload.name - Nome completo
 * @param {string} payload.email - Email único
 * @param {string} payload.phone - Telefone com DDD
 * @param {string} payload.password - Senha
 * @returns {Promise<ApiRegisterResponse>} Dados do usuário criado
 * 
 * @example
 * const user = await registerUser({
 *   name: 'João Silva',
 *   email: 'joao@email.com',
 *   phone: '11999999999',
 *   password: '123456'
 * })
 */
export async function registerUser(payload: {
  name: string
  email: string
  phone: string
  password: string
}) {
  return apiRequest<ApiRegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Faz login do usuário
 * POST /api/auth/login
 * 
 * @param {Object} payload - Credenciais
 * @param {string} payload.email - Email do usuário
 * @param {string} payload.password - Senha
 * @returns {Promise<ApiLoginResponse>} Token JWT e dados da conta
 * @throws {ApiError} Se email/password inválidos
 * 
 * @example
 * const response = await loginUser({
 *   email: 'joao@email.com',
 *   password: '123456'
 * })
 * // response.token é automaticamente salvo no localStorage
 */
export async function loginUser(payload: { email: string; password: string }) {
  const result = await apiRequest<ApiLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setAuthToken(result.token)
  
  // Guardar refresh token se retornado pela API
  return result
}

export async function logoutUser() {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'DELETE',
  })
}

export async function fetchCurrentAccount() {
  return apiRequest<ApiCurrentAccount>('/auth/me')
}

/**
 * Lista todas as barbearias
 * GET /api/barbershops
 * 
 * @returns {Promise<Barbershop[]>} Array de barbearias
 * @example
 * const shops = await fetchBarbershops()
 */
export async function fetchBarbershops() {
  const data = await apiRequest<ApiBarbershop[]>('/barbershops')
  return data.map(mapApiBarbershop)
}

/**
 * Busca barbearia por slug
 * GET /api/barbershops/:slug
 * 
 * @param {string} slug - Slug único da barbearia (ex: 'barbearia-central')
 * @returns {Promise<Barbershop>} Dados completos da barbearia com serviços
 * @example
 * const shop = await fetchBarbershopBySlug('barbearia-central')
 */
export async function fetchBarbershopBySlug(slug: string) {
  const data = await apiRequest<ApiBarbershop>('/barbershops/' + slug)
  return mapApiBarbershop(data)
}

export async function fetchBarbershopById(id: string) {
  const shops = await fetchBarbershops()
  return shops.find((shop) => shop.id === id) ?? null
}

/**
 * Consulta horários disponíveis para agendamento
 * GET /api/availability?barberId=UUID&serviceId=UUID&day=YYYY-MM-DD
 * 
 * @param {Object} payload - Filtros de disponibilidade
 * @param {string} payload.barberId - ID do barbeiro
 * @param {string} payload.serviceId - ID do serviço
 * @param {string} payload.day - Data no formato YYYY-MM-DD
 * @returns {Promise<string[]>} Array de horários disponíveis (ex: ['09:00', '09:30', '10:00'])
 * @example
 * const times = await fetchAvailableTimes({
 *   barberId: 'uuid-123',
 *   serviceId: 'uuid-456',
 *   day: '2026-05-15'
 * })
 */
export async function fetchAvailableTimes(payload: {
  barberId: string
  serviceId: string
  day: string
}) {
  const query = new URLSearchParams(payload)
  return apiRequest<string[]>('/availability?' + query.toString())
}

/**
 * Cria novo agendamento (usuário autenticado)
 * POST /api/bookings
 * 
 * Requer token de autenticação no header Authorization
 * 
 * @param {Object} payload - Dados do agendamento
 * @param {string} payload.barberId - ID do barbeiro
 * @param {string} payload.serviceId - ID do serviço
 * @param {string} payload.barbershopId - ID da barbearia
 * @param {string} payload.day - Data no formato YYYY-MM-DD
 * @param {string} payload.time - Horário no formato HH:mm
 * @returns {Promise<Booking>} Agendamento criado
 * @throws {ApiError} Se não autenticado ou dados inválidos
 * 
 * @example
 * const booking = await createBooking({
 *   barberId: 'uuid-123',
 *   serviceId: 'uuid-456',
 *   barbershopId: 'uuid-789',
 *   day: '2026-05-15',
 *   time: '09:00'
 * })
 */
export async function createBooking(payload: {
  barberId: string
  serviceId: string
  barbershopId: string
  day: string
  time: string
}) {
  const data = await apiRequest<ApiBooking>('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      barberId: payload.barberId,
      serviceIds: [payload.serviceId],
      barbershopId: payload.barbershopId,
      day: payload.day,
      startTime: payload.time,
    }),
  })

  return mapApiBooking(data)
}

/**
 * Lista agendamentos do cliente autenticado
 * GET /api/bookings
 * 
 * @returns {Promise<Booking[]>} Array de agendamentos do cliente
 */
export async function getAppointments() {
  const data = await apiRequest<ApiBooking[]>('/bookings/me')
  return data.map(mapApiBooking)
}

/**
 * Cancela um agendamento existente
 * DELETE /api/bookings/:id
 * 
 * @param {string} bookingId - ID do agendamento a cancelar
 * @param {string} reason - Razão do cancelamento
 * @returns {Promise<Booking>} Agendamento cancelado
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  await apiRequest<void>('/bookings/' + bookingId, {
    method: 'DELETE',
    body: JSON.stringify({ cancellationReason: reason }),
  })
}

export async function fetchWeeklyBookings(startDay: string, barbershopId?: string) {
  const query = new URLSearchParams({ startDay })
  if (barbershopId) query.set('barbershopId', barbershopId)

  const data = await apiRequest<{
    startDay: string
    endDay: string
    bookings: ApiBooking[]
  }>('/bookings/week?' + query.toString())

  return {
    ...data,
    bookings: data.bookings.map(mapApiBooking),
  }
}

export async function createQuickBooking(payload: {
  client: { name: string; phone: string; email?: string }
  barberId: string
  serviceId: string
  barbershopId: string
  day: string
  time: string
}) {
  const data = await apiRequest<ApiBooking>('/bookings/quick', {
    method: 'POST',
    body: JSON.stringify({
      client: payload.client,
      barberId: payload.barberId,
      serviceIds: [payload.serviceId],
      barbershopId: payload.barbershopId,
      day: payload.day,
      startTime: payload.time,
    }),
  })

  return mapApiBooking(data)
}

/**
 * Obter estatísticas do profissional para hoje
 * GET /api/professionals/:id/stats/today
 * 
 * @param {string} professionalId - ID do profissional
 * @returns {Promise<{appointments: number, revenue: number, avgRating: number}>} Stats do dia
 */
export async function getProfessionalStats(professionalId: string) {
  void professionalId
  const data = await apiRequest<{
    totalBookings: number
    totalRevenue: number
  }>('/barbers/me/dashboard')

  return {
    appointments: data.totalBookings,
    revenue: data.totalRevenue,
    avgRating: 0,
  }
}

/**
 * Obter agendamentos do profissional para hoje
 * GET /api/professionals/:id/appointments?date=today
 * 
 * @param {string} professionalId - ID do profissional
 * @param {string} date - Data (default: today)
 * @returns {Promise<Booking[]>} Agendamentos do dia
 */
export async function getProfessionalAppointments(professionalId: string, date = 'today') {
  void professionalId
  const day = date === 'today' ? new Date().toISOString().split('T')[0] : date
  const data = await apiRequest<ApiBooking[]>('/bookings/me?day=' + day)
  return data.map(mapApiBooking)
}

export async function fetchBarberProfile() {
  return apiRequest<BarberProfile>('/barbers/me')
}

export async function updateBarberProfile(payload: { name?: string; phone?: string }) {
  return apiRequest<BarberProfile>('/barbers/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function fetchBarberHistory() {
  const data = await apiRequest<ApiBooking[]>('/barbers/me/history')
  return data.map(mapApiBooking)
}

export async function updateBarberAvailability(
  availability: Array<{ weekDay: number; startTime: string; endTime: string }>,
) {
  return apiRequest<BarberProfile['availability']>('/barbers/me/availability', {
    method: 'PATCH',
    body: JSON.stringify({ availability }),
  })
}

export type BarberBlock = {
  id: string
  day: string
  startTime?: string | null
  endTime?: string | null
  reason?: string | null
}

export async function fetchBarberBlocks() {
  return apiRequest<BarberBlock[]>('/barbers/me/blocks')
}

export async function createBarberBlock(payload: Omit<BarberBlock, 'id'>) {
  return apiRequest<BarberBlock>('/barbers/me/blocks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteBarberBlock(blockId: string) {
  return apiRequest<void>('/barbers/me/blocks/' + blockId, { method: 'DELETE' })
}

export type ClientProfile = {
  id: string
  name: string
  phone: string
  cpf?: string | null
  email?: string | null
  createdAt: string
}

export type FavoriteBarbershop = {
  id: string
  name: string
  slug: string
  address?: string | null
  phone?: string | null
  addedAt: string
}

export async function fetchClientProfile() {
  return apiRequest<ClientProfile>('/clients/me')
}

export async function updateClientProfile(payload: {
  name?: string
  phone?: string
  cpf?: string
}) {
  return apiRequest<ClientProfile>('/clients/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function fetchFavoriteBarbershops() {
  return apiRequest<FavoriteBarbershop[]>('/clients/me/barbershops')
}

/**
 * Login de profissional
 * POST /api/auth/professional-login
 * 
 * @param {Object} payload - Credenciais
 * @param {string} payload.email - Email do profissional
 * @param {string} payload.password - Senha
 * @returns {Promise<ApiLoginResponse>} Token e dados do profissional
 */
export async function loginProfessional(payload: { email: string; password: string }) {
  const result = await apiRequest<ApiLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setAuthToken(result.token)
  return result
}

export async function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  })
}

export async function acceptBarberInvite(payload: {
  token: string
  password: string
  name?: string
  phone?: string
}) {
  return apiRequest<{ id: string; name: string; email: string; message: string }>(
    '/auth/barber-invites/accept',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function fetchBarberInvite(token: string) {
  return apiRequest<BarberInviteDetails>(
    '/auth/barber-invites/' + encodeURIComponent(token),
  )
}

export async function fetchAdminBarbershops() {
  const data = await apiRequest<AdminBarbershop[]>('/admin/barbershops')
  return data.map(mapAdminBarbershop)
}

export async function fetchAdminDashboard() {
  return apiRequest<AdminDashboardSummary>('/admin/dashboard')
}

export async function fetchAdminBarbershopDashboard(barbershopId: string) {
  return apiRequest<AdminBarbershopDashboard>(
    '/admin/barbershops/' + barbershopId + '/dashboard',
  )
}

export async function fetchAdminUsers() {
  return apiRequest<AdminUserRow[]>('/admin/users')
}

export async function createAdminBarbershop(payload: {
  name: string
  slug: string
  cnpj?: string
  address?: string
  phoneOwner?: string
  plan?: 'FREE' | 'BASIC' | 'PRO'
  admin?: {
    email: string
    password: string
  }
}) {
  return apiRequest<AdminBarbershop>('/admin/barbershops', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAdminBarbershop(
  barbershopId: string,
  payload: {
    name?: string
    address?: string | null
    phoneOwner?: string | null
    plan?: 'FREE' | 'BASIC' | 'PRO'
    setupCompleted?: boolean
    logoUrl?: string | null
    coverUrl?: string | null
  },
) {
  const data = await apiRequest<AdminBarbershop>('/admin/barbershops/' + barbershopId, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return mapAdminBarbershop(data)
}

export async function uploadBarbershopImage(
  barbershopId: string,
  type: 'logo' | 'cover',
  file: File,
) {
  const formData = new FormData()
  formData.append('file', file)

  const data = await apiRequest<AdminBarbershop>(
    `/admin/barbershops/${barbershopId}/images/${type}`,
    { method: 'POST', body: formData },
  )
  return mapAdminBarbershop(data)
}

export async function updateBarbershopLocation(
  barbershopId: string,
  location: { latitude: number; longitude: number },
) {
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'
  const token = getAuthToken()
  const response = await fetch(
    `${apiBaseUrl}/barbershops/${encodeURIComponent(barbershopId)}/location`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...location,
        reverseGeocode: true,
      }),
    },
  )

  const data = (await response.json().catch(() => null)) as
    | (AdminBarbershop & { message?: string })
    | null

  if (!response.ok) {
    throw new ApiError(data?.message || 'Nao foi possivel salvar a localizacao', response.status)
  }

  if (!data) {
    throw new ApiError('Resposta invalida ao salvar a localizacao', 500)
  }

  return data
}

export async function fetchAdminServices(barbershopId: string) {
  return apiRequest<AdminService[]>('/barbershops/' + barbershopId + '/services')
}

export async function createAdminService(
  barbershopId: string,
  payload: { name: string; price: number; duration: number },
) {
  return apiRequest<AdminService>('/admin/barbershops/' + barbershopId + '/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAdminService(
  barbershopId: string,
  serviceId: string,
  payload: { name?: string; price?: number; duration?: number },
) {
  return apiRequest<AdminService>('/admin/barbershops/' + barbershopId + '/services/' + serviceId, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteAdminService(barbershopId: string, serviceId: string) {
  return apiRequest<void>('/admin/barbershops/' + barbershopId + '/services/' + serviceId, {
    method: 'DELETE',
  })
}

export async function fetchWorkingHours(barbershopId: string) {
  return apiRequest<WorkingHour[]>('/admin/barbershops/' + barbershopId + '/working-hours')
}

export async function updateWorkingHours(barbershopId: string, workingHours: WorkingHour[]) {
  return apiRequest<WorkingHour[]>('/admin/barbershops/' + barbershopId + '/working-hours', {
    method: 'PUT',
    body: JSON.stringify({
      workingHours: workingHours.map(({ weekDay, startTime, endTime }) => ({
        weekDay,
        startTime,
        endTime,
      })),
    }),
  })
}

export async function inviteBarber(
  barbershopId: string,
  payload: { name: string; email: string; phone: string; serviceIds?: string[] },
) {
  return apiRequest<CreateBarberInviteResponse>(
    '/admin/barbershops/' + barbershopId + '/barber-invites',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function fetchAdminBarbers(barbershopId: string) {
  return apiRequest<AdminBarber[]>(
    '/admin/barbershops/' + barbershopId + '/barbers',
  )
}

export async function createMeAsBarber(
  barbershopId: string,
  payload: { name?: string; phone: string; serviceIds?: string[] },
) {
  return apiRequest<AdminBarber>(
    `/admin/barbershops/${barbershopId}/me-as-barber`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function fetchAdminBarberDay(
  barbershopId: string,
  barberId: string,
  day: string,
) {
  return apiRequest<ApiBooking[]>(
    `/admin/barbershops/${barbershopId}/barbers/${barberId}/day?day=${day}`,
  )
}

export async function fetchAdminBarberHistory(
  barbershopId: string,
  barberId: string,
) {
  return apiRequest<ApiBooking[]>(
    `/admin/barbershops/${barbershopId}/barbers/${barberId}/history`,
  )
}

export async function fetchPendingBarberInvites(barbershopId: string) {
  return apiRequest<BarberInvite[]>(
    '/admin/barbershops/' + barbershopId + '/barber-invites',
  )
}

export async function cancelBarberInvite(
  barbershopId: string,
  inviteId: string,
) {
  return apiRequest<void>(
    '/admin/barbershops/' + barbershopId + '/barber-invites/' + inviteId,
    { method: 'DELETE' },
  )
}

export async function removeAdminBarber(
  barbershopId: string,
  barberId: string,
) {
  return apiRequest<void>(
    '/admin/barbershops/' + barbershopId + '/barbers/' + barberId,
    { method: 'DELETE' },
  )
}

export async function updateAdminBarberServices(
  barbershopId: string,
  barberId: string,
  serviceIds: string[],
) {
  return apiRequest<AdminBarber>(
    '/admin/barbershops/' + barbershopId + '/barbers/' + barberId + '/services',
    {
      method: 'PUT',
      body: JSON.stringify({ serviceIds }),
    },
  )
}

export async function fetchBookingDetails(bookingId: string) {
  const data = await apiRequest<ApiBooking>('/bookings/' + bookingId)
  return mapApiBooking(data)
}

export async function rescheduleBooking(bookingId: string, payload: { day: string; startTime: string }) {
  const data = await apiRequest<ApiBooking>('/bookings/' + bookingId + '/reschedule', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return mapApiBooking(data)
}

export async function completeBooking(bookingId: string) {
  const data = await apiRequest<ApiBooking>('/bookings/' + bookingId + '/status', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'COMPLETED' }),
  })

  return mapApiBooking(data)
}

export async function updateBookingServices(bookingId: string, serviceIds: string[]) {
  const data = await apiRequest<ApiBooking>('/bookings/' + bookingId + '/services', {
    method: 'PATCH',
    body: JSON.stringify({ serviceIds }),
  })

  return mapApiBooking(data)
}

export async function registerBookingPayment(
  bookingId: string,
  payload: { paymentMethod: 'DEBIT' | 'CREDIT' | 'PIX' | 'CASH'; amountPaid: number },
) {
  return apiRequest('/bookings/' + bookingId + '/payment', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Obter estatísticas do admin
 * GET /api/admin/stats
 * 
 * @returns {Promise<{professionals: number, appointments: number, revenue: number}>} Stats gerais
 */
export async function getAdminStats() {
  const stats = await fetchAdminDashboard()

  return {
    professionals: 0,
    appointments: stats.totalBookings,
    revenue: stats.totalRevenue,
  }
}

/**
 * Listar profissionais da unidade
 * GET /api/admin/team
 * 
 * @returns {Promise<Barber[]>} Lista de profissionais
 */
export async function getTeam() {
  const shops = await apiRequest<Array<{ id: string }>>('/admin/barbershops')
  const firstShop = shops[0]

  if (!firstShop) {
    return []
  }

  return apiRequest<Barber[]>('/admin/barbershops/' + firstShop.id + '/barbers')
}

/**
 * Listar relatórios
 * GET /api/admin/reports
 * 
 * @returns {Promise<{period: string, revenue: number, appointments: number}>} Relatórios
 */
export async function getAdminReports() {
  const stats = await getAdminStats()

  return {
    period: new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
    revenue: stats.revenue,
    appointments: stats.appointments,
  }
}

export function buildUserFromRegister(data: ApiRegisterResponse): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: 'customer',
    accountRole: 'CLIENT',
  }
}

export function buildUserFromLogin(
  email: string,
  fallbackName?: string,
  account?: ApiLoginResponse['account'],
): User {
  const derivedName = fallbackName || toTitleSlug(email.split('@')[0] || 'Cliente')

  return {
    id: account?.id ?? 'session-user',
    name: derivedName,
    email,
    phone: '',
    role: mapAccountRole(account?.role),
    accountRole: account?.role,
  }
}

export function buildUserFromCurrentAccount(account: ApiCurrentAccount, fallbackName?: string): User {
  const derivedName = fallbackName || account.data?.name || toTitleSlug(account.email.split('@')[0] || 'Usuario')

  return {
    id: account.id,
    name: derivedName,
    email: account.email,
    phone: account.data?.phone ?? '',
    role: mapAccountRole(account.role),
    accountRole: account.role,
  }
}
