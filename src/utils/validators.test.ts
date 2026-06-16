import { describe, expect, it } from 'vitest'
import { validateEmail, validatePassword } from './validators'

describe('validators', () => {
  it('requires a valid email', () => {
    expect(validateEmail('cliente@barberflow.com')).toBe(true)
    expect(validateEmail('cliente')).toBe(false)
  })

  it('requires passwords with at least eight characters', () => {
    expect(validatePassword('12345678')).toBe(true)
    expect(validatePassword('1234567')).toBe(false)
  })
})
