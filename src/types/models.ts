/**
 * @file Type Definitions for Barbershop API Models
 * @description Tipos TypeScript para os modelos de dados da API
 */

/**
 * Usuário autenticado
 */
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'professional' | 'admin'
  accountRole?: 'CLIENT' | 'BARBER' | 'BARBERSHOP_ADMIN' | 'SUPER_ADMIN'
}

/**
 * Barbeiro (prestador de serviço)
 */
export interface Barber {
  id: string
  name: string
  photo?: string
}

/**
 * Serviço oferecido pela barbearia
 */
export interface Service {
  id: string
  name: string
  description: string
  price: number // em reais
  duration: number // em minutos
  image: string
  barberIds?: string[]
}

/**
 * Barbearia
 */
export interface Barbershop {
  id: string
  slug: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  image: string
  rating: number
  workingHours: {
    start: string
    end: string
  }
  services: Service[]
  professionals: Barber[]
  barbers: Barber[]
}

/**
 * Agendamento de cliente
 * Status possíveis: 'pending' | 'confirmed'
 */
export interface Booking {
  id: string
  barbershopId: string
  barbershopName: string
  serviceId: string
  serviceName: string
  services?: Array<{
    id: string
    name: string
    price: number
    duration: number
  }>
  barberId: string
  barberName: string
  clientName?: string
  amountPaid?: number | null
  endTime?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  userId: string
  status: 'pending' | 'confirmed' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
}

/**
 * Mensagem de notificação no frontend
 */
export interface ToastMessage {
  id: string
  tone: 'success' | 'error' | 'info'
  text: string
}

/**
 * Rotas disponíveis no frontend
 */
export type AppRoute =
  // Public Routes
  | { name: 'landing' }
  | { name: 'public-barbershops'; search?: string }
  | { name: 'public-barbershop-details'; slug: string }
  
  // Auth Routes
  | { name: 'auth-login' }
  | { name: 'auth-register' }
  | { name: 'auth-forgot-password' }
  | { name: 'auth-professional-login' }
  | { name: 'auth-professional-register' }
  | { name: 'auth-barber-invite'; token?: string }
  
  // Customer Routes
  | { name: 'customer-explore' }
  | { name: 'customer-appointments' }
  | { name: 'customer-booking'; barbershopId: string; serviceId?: string }
  | { name: 'customer-profile' }
  
  // Professional Routes
  | { name: 'professional-dashboard' }
  | { name: 'professional-schedule' }
  | { name: 'professional-current' }
  | { name: 'professional-services' }
  | { name: 'professional-availability' }
  | { name: 'professional-blocking' }
  | { name: 'professional-agenda' }
  | { name: 'professional-quick-booking' }
  | { name: 'professional-reports' }
  | { name: 'professional-history' }
  | { name: 'professional-availability-new' }
  | { name: 'professional-profile' }
  
  // Admin Routes
  | { name: 'admin-dashboard' }
  | { name: 'admin-barbershops' }
  | { name: 'admin-services'; barbershopId?: string }
  | { name: 'admin-working-hours'; barbershopId?: string }
  | { name: 'admin-team' }
  | { name: 'admin-reports' }
  | { name: 'admin-settings' }
  | { name: 'admin-super' }
  | { name: 'admin-super-section'; section: 'barbershops' | 'registrations' | 'plans' | 'financial-reports' | 'users' | 'settings' }
  | { name: 'admin-barbershop-dashboard' }
  | { name: 'admin-week-agenda' }
  | { name: 'admin-quick-booking' }
  | { name: 'admin-barber-management' }
  | { name: 'admin-barber-day'; barberId: string; barbershopId: string; barberName?: string }
  | { name: 'admin-barber-history'; barberId: string; barbershopId: string; barberName?: string }
  | { name: 'admin-barber-invites' }
  | { name: 'admin-service-management' }
  | { name: 'admin-barbershop-section'; section: 'appointments' | 'working-hours' | 'customers' | 'settings' | 'reports' }
  | { name: 'booking-detail'; bookingId: string }
  | { name: 'auth-reset-password'; token?: string }
  
  // Legacy Routes
  | { name: 'home' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'barbershops' }
  | { name: 'barbershop-details'; slug: string }
  | { name: 'booking'; barbershopId: string; serviceId?: string }
  | { name: 'account' }
  | { name: 'partner-login' }
  | { name: 'partner-create' }
