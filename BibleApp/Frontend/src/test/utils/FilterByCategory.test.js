import { describe, it, expect } from 'vitest'
import { filterByCategory, addCategoryToBooks } from '../../utils/filters'

const mockBooks = [
  { id: 'GEN', commonName: 'Génesis', name: 'Genesis' },
  { id: 'MAT', commonName: 'Mateo', name: 'Matthew' },
  { id: 'REV', commonName: 'Apocalipsis', name: 'Revelation' },
  { id: 'JUD', commonName: 'Judas', name: 'Jude' },
  { id: 'UNKNOWN', commonName: 'Unknown', name: 'Unknown Book' }
]

describe('FilterByCategory', () => {
  describe('addCategoryToBooks', () => {
    it('debe agregar categoria a cada libro', () => {
      const result = addCategoryToBooks(mockBooks)
      
      expect(result[0]).toMatchObject({ id: 'GEN', category: 'pentateuco' })
      expect(result[1]).toMatchObject({ id: 'MAT', category: 'evangelios' })
      expect(result[2]).toMatchObject({ id: 'REV', category: 'profeticos' })
      expect(result[3]).toMatchObject({ id: 'JUD', category: 'cartas_universales' })
    })

    it('debe asignar libros_desconocidos a libros no encontrados', () => {
      const result = addCategoryToBooks(mockBooks)
      
      expect(result[4]).toMatchObject({ id: 'UNKNOWN', category: 'libros_apocrifos' })
    })

    it('debe manejar arrays vacios', () => {
      const result = addCategoryToBooks([])
      expect(result).toEqual([])
    })

    it('debe manejar valores no array', () => {
      const result = addCategoryToBooks(null)
      expect(result).toEqual([])
    })
  })

  describe('filterByCategory', () => {
    it('debe retornar todos los libros cuando categoria es "all"', () => {
      const booksWithCategory = addCategoryToBooks(mockBooks)
      const result = filterByCategory({ value: 'all' }, booksWithCategory)
      
      expect(result).toHaveLength(5)
    })

    it('debe retornar todos los libros cuando categoria es null', () => {
      const booksWithCategory = addCategoryToBooks(mockBooks)
      const result = filterByCategory(null, booksWithCategory)
      
      expect(result).toHaveLength(5)
    })

    it('debe filtrar por pentateuco', () => {
      const booksWithCategory = addCategoryToBooks(mockBooks)
      const result = filterByCategory({ value: 'pentateuco' }, booksWithCategory)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('GEN')
    })

    it('debe filtrar por evangelios', () => {
      const booksWithCategory = addCategoryToBooks(mockBooks)
      const result = filterByCategory({ value: 'evangelios' }, booksWithCategory)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('MAT')
    })

    it('debe retornar array vacio para libros_apocrifos sin resultados', () => {
      const booksWithCategory = addCategoryToBooks([
        { id: 'GEN', commonName: 'Génesis' },
        { id: 'MAT', commonName: 'Mateo' }
      ])
      const result = filterByCategory({ value: 'libros_apocrifos' }, booksWithCategory)
      
      expect(result).toHaveLength(0)
    })

    it('debe manejar arrays vacios', () => {
      const result = filterByCategory({ value: 'pentateuco' }, [])
      expect(result).toEqual([])
    })
  })
})
