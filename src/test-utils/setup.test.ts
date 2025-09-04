import { describe, expect, it } from 'vitest'

describe('Test Setup', () => {
  it('should have proper test environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(typeof navigator).toBe('object')
  })

  it('should have mocked window methods', () => {
    expect(typeof window.matchMedia).toBe('function')
    expect(typeof window.scrollTo).toBe('function')
    expect(typeof window.location.assign).toBe('function')
    expect(typeof window.history.pushState).toBe('function')
  })

  it('should have mocked global objects', () => {
    expect(typeof IntersectionObserver).toBe('function')
    expect(typeof ResizeObserver).toBe('function')
  })
})
