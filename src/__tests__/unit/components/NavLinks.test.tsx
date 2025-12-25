import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { navLinks, useFilteredNavLinks } from '@/components/layout/header/NavLinks'

describe('NavLinks', () => {
  it('should contain all expected navigation links', () => {
    expect(navLinks).toHaveLength(4)
    
    const linkPaths = navLinks.map(link => link.path)
    expect(linkPaths).toContain('/')
    expect(linkPaths).toContain('/recursos')
    expect(linkPaths).toContain('/planos')
    expect(linkPaths).toContain('/sobre')
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
    
    // Não há mais link direto de calculadora na navbar pública
  })

  // Teste removido: propriedade 'badge' não existe mais no tipo NavLink
  // As features premium são identificadas através de outras propriedades
})

describe('useFilteredNavLinks', () => {
  it('should return all links for authenticated users (dashboard only)', () => {
    const { result } = renderHook(() => useFilteredNavLinks(true, false))
    expect(result.current).toHaveLength(1)
    expect(result.current[0].path).toBe('/dashboard')
  })

  it('should return all links for unauthenticated users', () => {
    const { result } = renderHook(() => useFilteredNavLinks(false, false))
    expect(result.current).toEqual(navLinks)
  })

  it('should return all links for pro users (dashboard only)', () => {
    const { result } = renderHook(() => useFilteredNavLinks(true, true))
    expect(result.current).toHaveLength(1)
    expect(result.current[0].path).toBe('/dashboard')
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