import { describe, expect, it } from 'vitest'
import { mapApiBarbershop } from './backend'

describe('mapApiBarbershop', () => {
  it('prioritizes the uploaded cover image', () => {
    const result = mapApiBarbershop({
      id: 'shop-1',
      slug: 'shop',
      name: 'Shop',
      coverUrl: 'https://cdn.test/cover.webp',
      services: [],
    })

    expect(result.image).toBe('https://cdn.test/cover.webp')
  })
})
