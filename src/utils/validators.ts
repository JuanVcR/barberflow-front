export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function validatePhone(phone: string): boolean {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ''))
}

export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  return clean.length === 11
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0
}
