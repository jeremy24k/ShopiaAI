import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import getGreeting from '../../utils/GetGreeting'

describe('GetGreeting', () => {
  const originalDate = Date
  
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debe retornar "good_morning" entre 6am y 12pm', () => {
    const mockDate = new Date('2024-01-01T09:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_morning')
  })

  it('debe retornar "good_afternoon" entre 12pm y 6pm', () => {
    const mockDate = new Date('2024-01-01T14:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_afternoon')
  })

  it('debe retornar "good_evening" entre 6pm y 6am', () => {
    const mockDate = new Date('2024-01-01T20:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_evening')
  })

  it('debe retornar "good_evening" a medianoche', () => {
    const mockDate = new Date('2024-01-01T00:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_evening')
  })

  it('debe retornar "good_evening" a las 5am', () => {
    const mockDate = new Date('2024-01-01T05:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_evening')
  })

  it('debe retornar "good_morning" exactamente a las 6am', () => {
    const mockDate = new Date('2024-01-01T06:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_morning')
  })

  it('debe retornar "good_afternoon" exactamente a las 12pm', () => {
    const mockDate = new Date('2024-01-01T12:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_afternoon')
  })

  it('debe retornar "good_evening" exactamente a las 6pm', () => {
    const mockDate = new Date('2024-01-01T18:00:00')
    vi.setSystemTime(mockDate)
    
    expect(getGreeting()).toBe('good_evening')
  })
})
