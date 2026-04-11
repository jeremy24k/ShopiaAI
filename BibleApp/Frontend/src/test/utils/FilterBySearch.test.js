import { describe, it, expect } from 'vitest'
import { filterBySearch } from '../../utils/filters'

const mockBooks = [
  { id: 'GEN', commonName: 'Génesis', name: 'Genesis', title: 'First Book' },
  { id: 'MAT', commonName: 'Mateo', name: 'Matthew', title: 'Gospel of Matthew' },
  { id: 'PSA', commonName: 'Salmos', name: 'Psalms', title: 'Book of Psalms' },
  { id: 'EXO', commonName: 'Éxodo', name: 'Exodus', title: 'Second Book' }
]

describe('FilterBySearch', () => {
  it('debe retornar todos los libros cuando searchQuery esta vacio', () => {
    const result = filterBySearch('', mockBooks)
    expect(result).toHaveLength(4)
  })

  it('debe retornar todos los libros cuando searchQuery es null', () => {
    const result = filterBySearch(null, mockBooks)
    expect(result).toHaveLength(4)
  })

  it('debe filtrar por commonName', () => {
    const result = filterBySearch('Mateo', mockBooks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('MAT')
  })

  it('debe filtrar por name', () => {
    const result = filterBySearch('Genesis', mockBooks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('GEN')
  })

  it('debe filtrar por title', () => {
    const result = filterBySearch('Psalms', mockBooks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('PSA')
  })

  it('debe ser case insensitive', () => {
    const result = filterBySearch('mateo', mockBooks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('MAT')
  })

  it('debe manejar acentos correctamente', () => {
    const result = filterBySearch('exodo', mockBooks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('EXO')
  })

  it('debe encontrar libros parciales', () => {
    const result = filterBySearch('Mate', mockBooks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('MAT')
  })

  it('debe retornar array vacio si no hay coincidencias', () => {
    const result = filterBySearch('xyz123', mockBooks)
    expect(result).toHaveLength(0)
  })

  it('debe funcionar con caracteres especiales', () => {
    const result = filterBySearch('Salmos', mockBooks)
    expect(result).toHaveLength(1)
  })
})
