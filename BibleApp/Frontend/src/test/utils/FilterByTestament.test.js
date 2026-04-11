import { describe, it, expect } from 'vitest'
import { filterByTestament, addTestamentToBooks } from '../../utils/filters'

const mockBooks = [
  { id: 'GEN', commonName: 'Génesis' },
  { id: 'PSA', commonName: 'Salmos' },
  { id: 'MAT', commonName: 'Mateo' },
  { id: 'ROM', commonName: 'Romanos' },
  { id: 'REV', commonName: 'Apocalipsis' },
  { id: 'UNKNOWN', commonName: 'Unknown' }
]

describe('FilterByTestament', () => {
  describe('addTestamentToBooks', () => {
    it('debe agregar testament a cada libro del antiguo testamento', () => {
      const result = addTestamentToBooks([{ id: 'GEN' }])
      expect(result[0].testament).toBe('old')
    })

    it('debe agregar testament a cada libro del nuevo testamento', () => {
      const result = addTestamentToBooks([{ id: 'MAT' }])
      expect(result[0].testament).toBe('new')
    })

    it('debe asignar "others" a libros no reconocidos', () => {
      const result = addTestamentToBooks([{ id: 'UNKNOWN' }])
      expect(result[0].testament).toBe('others')
    })

    it('debe procesar multiples libros', () => {
      const result = addTestamentToBooks(mockBooks)
      
      expect(result.find(b => b.id === 'GEN')?.testament).toBe('old')
      expect(result.find(b => b.id === 'PSA')?.testament).toBe('old')
      expect(result.find(b => b.id === 'MAT')?.testament).toBe('new')
      expect(result.find(b => b.id === 'ROM')?.testament).toBe('new')
      expect(result.find(b => b.id === 'REV')?.testament).toBe('new')
      expect(result.find(b => b.id === 'UNKNOWN')?.testament).toBe('others')
    })

    it('debe manejar arrays vacios', () => {
      const result = addTestamentToBooks([])
      expect(result).toEqual([])
    })

    it('debe manejar valores no array', () => {
      const result = addTestamentToBooks(null)
      expect(result).toEqual([])
    })
  })

  describe('filterByTestament', () => {
    it('debe retornar todos los libros cuando testament es "all"', () => {
      const booksWithTestament = addTestamentToBooks(mockBooks)
      const result = filterByTestament('all', booksWithTestament)
      
      expect(result).toHaveLength(6)
    })

    it('debe retornar todos los libros cuando testament es null', () => {
      const booksWithTestament = addTestamentToBooks(mockBooks)
      const result = filterByTestament(null, booksWithTestament)
      
      expect(result).toHaveLength(6)
    })

    it('debe filtrar por antiguo testamento', () => {
      const booksWithTestament = addTestamentToBooks(mockBooks)
      const result = filterByTestament('old', booksWithTestament)
      
      expect(result).toHaveLength(2)
      expect(result.every(b => b.testament === 'old')).toBe(true)
    })

    it('debe filtrar por nuevo testamento', () => {
      const booksWithTestament = addTestamentToBooks(mockBooks)
      const result = filterByTestament('new', booksWithTestament)
      
      expect(result).toHaveLength(3)
      expect(result.every(b => b.testament === 'new')).toBe(true)
    })

    it('debe manejar arrays vacios', () => {
      const result = filterByTestament('old', [])
      expect(result).toEqual([])
    })
  })
})
