import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { navLinks, useFilteredNavLinks } from '@/components/layout/header/NavLinks'

describe('NavLinks', () => {
  it('should contain all expected navigation links', () => {
    expect(navLinks).toHaveLength(11)
    
    const linkPaths = navLinks.map(link => link.path)
    expect(linkPaths).toContain('/')
    expect(linkPaths).toContain('/calculadora-simples')
    expect(linkPaths).toContain('/templates')
    expect(linkPaths).toContain('/ia')
    expect(linkPaths).toContain('/analytics')
  })

  it('should have proper link structure', () => {
    navLinks.forEach(link => {
      expect(link).toHaveProperty('to')
      expect(link).toHaveProperty('label')
      expect(link).toHaveProperty('path')
      expect(link).toHaveProperty('icon')
      expect(typeof link.to).toBe('string')
      expect(typeof link.label).toBe('string')
      expect(typeof link.path).toBe('string')
    })
  })

  it('should include onboarding data attributes for key features', () => {
    const linksWithOnboarding = navLinks.filter(link => link.dataOnboarding)
    expect(linksWithOnboarding.length).toBeGreaterThan(0)
    
    const homeLink = navLinks.find(link => link.path === '/')
    expect(homeLink?.dataOnboarding).toBe('home-button')
    
    const calculatorLink = navLinks.find(link => link.path === '/calculadora-simples')
    expect(calculatorLink?.dataOnboarding).toBe('calculator-button')
  })

  it('should mark premium features with badges', () => {
    const iaLink = navLinks.find(link => link.path === '/ia')
    expect(iaLink?.badge).toBe('Pro')
    
    const newFeatures = navLinks.filter(link => link.badge === 'Novo')
    expect(newFeatures.length).toBeGreaterThan(0)
  })
})

describe('useFilteredNavLinks', () => {
  it('should return all links for authenticated users', () => {
    const { result } = renderHook(() => useFilteredNavLinks(true, false))
    expect(result.current).toHaveLength(navLinks.length)
  })

  it('should return all links for unauthenticated users', () => {
    const { result } = renderHook(() => useFilteredNavLinks(false, false))
    expect(result.current).toHaveLength(navLinks.length)
  })

  it('should return all links for pro users', () => {
    const { result } = renderHook(() => useFilteredNavLinks(true, true))
    expect(result.current).toHaveLength(navLinks.length)
  })

  it('should maintain link structure after filtering', () => {
    const { result } = renderHook(() => useFilteredNavLinks(true, false))
    
    result.current.forEach(link => {
      expect(link).toHaveProperty('to')
      expect(link).toHaveProperty('label')
      expect(link).toHaveProperty('path')
      expect(link).toHaveProperty('icon')
    })
  })
})