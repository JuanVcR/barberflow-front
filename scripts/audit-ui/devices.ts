import { devices } from 'playwright'

export const desktop = {
  name: 'Desktop',
  viewport: {
    width: 1920,
    height: 1080
  }
}

export const tablet = {
  name: 'Tablet',
  ...devices['iPad Pro 11']
}

export const mobile = {
  name: 'Mobile',
  ...devices['iPhone 15 Pro']
}

export const allDevices = [
  desktop,
  tablet,
  mobile
]