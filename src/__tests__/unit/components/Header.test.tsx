import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '@/components/layout/Header'

// Mock dos componentes filhos
vi.mock('@/components/layout/header/DesktopNavigation', () => ({
  default: ({ isAuthenticated, isPro }: { isAuthenticated: boolean; isPro: boolean }) => (
    <span>
      Desktop Nav - Auth: {isAuthenticated.toString()} - Pro: {isPro.toString()}
    </span>
  )
}))

vi.mock('@/components/layout/header/MobileNavigation', () => ({
  default: ({ isAuthenticated, isPro }: { isAuthenticated: boolean; isPro: boolean }) => (
    <span>
      Mobile Nav - Auth: {isAuthenticated.toString()} - Pro: {isPro.toString()}
    </span>
  )
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Header', () => {
  it('should render the header correctly', () => {
    renderWithRouter(<Header />)
    
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument()
  })

  it('should pass authentication state to navigation components', () => {
    renderWithRouter(<Header />)
    
    const desktopNav = screen.getByTestId('desktop-navigation')
    const mobileNav = screen.getByTestId('mobile-navigation')
    
    expect(desktopNav).toHaveTextContent('Auth: false')
    expect(mobileNav).toHaveTextContent('Auth: false')
  })

  it('should pass pro state to navigation components', () => {
    renderWithRouter(<Header />)
    
    const desktopNav = screen.getByTestId('desktop-navigation')
    const mobileNav = screen.getByTestId('mobile-navigation')
    
    expect(desktopNav).toHaveTextContent('Pro: false')
    expect(mobileNav).toHaveTextContent('Pro: false')
  })
})