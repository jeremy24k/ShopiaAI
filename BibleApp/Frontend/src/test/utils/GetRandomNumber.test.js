import { describe, it, expect } from 'vitest'
import getRandomNumber from '../../utils/GetRandomNumber'

describe('GetRandomNumber', () => {
  it('debe retornar un numero entre min y max (inclusivo)', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomNumber(1, 10)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    }
  })

  it('debe retornar el mismo numero cuando min y max son iguales', () => {
    for (let i = 0; i < 100; i++) {
      expect(getRandomNumber(5, 5)).toBe(5)
    }
  })

  it('debe retornar un numero entero', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomNumber(0, 100)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  it('debe funcionar con numeros negativos', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomNumber(-10, -1)
      expect(result).toBeGreaterThanOrEqual(-10)
      expect(result).toBeLessThanOrEqual(-1)
    }
  })

  it('debe funcionar con min mayor que max (intercambiados)', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomNumber(10, 1)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    }
  })

  it('debe cubrir todo el rango', () => {
    const results = new Set()
    for (let i = 0; i < 1000; i++) {
      results.add(getRandomNumber(1, 3))
    }
    expect(results.has(1)).toBe(true)
    expect(results.has(2)).toBe(true)
    expect(results.has(3)).toBe(true)
  })
})
