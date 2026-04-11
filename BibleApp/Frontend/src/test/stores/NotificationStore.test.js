import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSileo = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  loading: vi.fn(() => ({ id: 'mock-id' })),
  dismiss: vi.fn(),
  show: vi.fn(),
  action: vi.fn(() => ({ id: 'mock-action-id' }))
}

vi.mock('sileo', () => ({
  sileo: mockSileo
}))

describe('NotificationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showSuccess', () => {
    it('debe llamar a sileo.success con el mensaje', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().showSuccess('Test success')
      
      expect(mockSileo.success).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test success',
          duration: 3000,
          position: 'bottom-right'
        })
      )
    })

    it('debe permitir opciones personalizadas', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().showSuccess('Test', { duration: 5000 })
      
      expect(mockSileo.success).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          duration: 5000
        })
      )
    })
  })

  describe('showError', () => {
    it('debe llamar a sileo.error con el mensaje', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().showError('Test error')
      
      expect(mockSileo.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test error',
          duration: 4000,
          position: 'bottom-right'
        })
      )
    })
  })

  describe('showInfo', () => {
    it('debe llamar a sileo.info con el mensaje', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().showInfo('Test info')
      
      expect(mockSileo.info).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test info',
          duration: 3000
        })
      )
    })
  })

  describe('showWarning', () => {
    it('debe llamar a sileo.warning con el mensaje', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().showWarning('Test warning')
      
      expect(mockSileo.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test warning',
          duration: 3500
        })
      )
    })
  })

  describe('showLoading', () => {
    it('debe llamar a sileo.loading y retornar el objeto', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      const result = useNotificationStore.getState().showLoading('Loading...')
      
      expect(mockSileo.loading).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Loading...',
          position: 'bottom-right'
        })
      )
      expect(result).toEqual({ id: 'mock-id' })
    })
  })

  describe('dismissAll', () => {
    it('debe llamar a sileo.dismiss sin argumentos', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().dismissAll()
      
      expect(mockSileo.dismiss).toHaveBeenCalledWith()
    })
  })

  describe('dismisssileo', () => {
    it('debe llamar a sileo.dismiss con el id', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().dismisssileo('test-id')
      
      expect(mockSileo.dismiss).toHaveBeenCalledWith('test-id')
    })
  })

  describe('updatesileo', () => {
    it('debe llamar a sileo con el tipo correcto', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().updatesileo('test-id', 'success', 'Updated!')
      
      expect(mockSileo.success).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          title: 'Updated!',
          duration: 3000
        })
      )
    })
  })

  describe('showCustom', () => {
    it('debe llamar a sileo.show', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      useNotificationStore.getState().showCustom('Custom message')
      
      expect(mockSileo.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Custom message',
          duration: 4000
        })
      )
    })
  })

  describe('showWithAction', () => {
    it('debe llamar a sileo.action con los parametros correctos', async () => {
      const { useNotificationStore } = await import('../../store/NotificationStore')
      const onAction = vi.fn()
      const result = useNotificationStore.getState().showWithAction('Action needed', 'Do it', onAction)
      
      expect(mockSileo.action).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Action needed',
          button: {
            title: 'Do it',
            onClick: onAction
          },
          duration: 90000
        })
      )
      expect(result).toEqual({ id: 'mock-action-id' })
    })
  })
})
