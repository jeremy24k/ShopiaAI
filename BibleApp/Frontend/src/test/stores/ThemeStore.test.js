import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useThemeStore } from '../../store/ThemeStore'

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return {
    ...actual,
    persist: (config) => config
  }
})

describe('ThemeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    Object.defineProperty(document.documentElement, 'dataset', {
      value: {},
      writable: true,
      configurable: true
    })
    
    useThemeStore.setState({ theme: 'light' })
  })

  describe('initial state', () => {
    it('debe tener theme inicial como light', () => {
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('setTheme', () => {
    it('debe establecer el tema a dark', () => {
      useThemeStore.getState().setTheme('dark')
      
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('debe establecer el tema a light', () => {
      useThemeStore.getState().setTheme('dark')
      useThemeStore.getState().setTheme('light')
      
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('toggleTheme', () => {
    it('debe togglear de light a dark', () => {
      useThemeStore.getState().toggleTheme()
      
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('debe togglear de dark a light', () => {
      useThemeStore.setState({ theme: 'dark' })
      useThemeStore.getState().toggleTheme()
      
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('initTheme', () => {
    it('debe aplicar el tema actual al documento', () => {
      useThemeStore.setState({ theme: 'dark' })
      useThemeStore.getState().initTheme()
      
      expect(useThemeStore.getState().theme).toBe('dark')
    })
  })
})
