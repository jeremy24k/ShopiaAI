import { create } from 'zustand';
import { sileo } from 'sileo';

export const useNotificationStore = create((set) => ({
  // Función para mostrar notificación de éxito
  showSuccess: (message, options = {}) => {
    sileo.success({
      title: message,
      duration: 3000,
      position: 'bottom-right',
      ...options,
    });
  },

  // Función para mostrar notificación de error
  showError: (message, options = {}) => {
    sileo.error({
      title: message,
      duration: 4000,
      position: 'bottom-right',
      ...options,
    });
  },

  // Función para mostrar notificación de información
  showInfo: (message, options = {}) => {
    sileo.info({
      title: message,
      duration: 3000,
      position: 'bottom-right',
      ...options,
    });
  },

  // Función para mostrar notificación de advertencia
  showWarning: (message, options = {}) => {
    sileo.warning({
      title: message,
      duration: 3500,
      position: 'bottom-right',
      ...options,
    });
  },

  // Función para mostrar notificación de carga (loading)
  showLoading: (message, options = {}) => {
    return sileo.loading({
      title: message,
      position: 'bottom-right',
      ...options,
    });
  },

  // Función para actualizar una notificación existente (útil para loading)
  updatesileo: (sileoId, type, message, options = {}) => {
    sileo[type]({
      id: sileoId,
      title: message,
      duration: 3000,
      ...options,
    });
  },

  // Función para cerrar una notificación específica
  dismisssileo: (sileoId) => {
    sileo.dismiss(sileoId);
  },

  // Función para cerrar todas las notificaciones
  dismissAll: () => {
    sileo.dismiss();
  },

  // Función personalizada para notificaciones con acciones
  showCustom: (message, options = {}) => {
    sileo.show({
      title: message,
      duration: 4000,
      position: 'bottom-right',
      ...options,
    });
  },

  // Función para notificación con botón de acción
  showWithAction: (message, actionLabel, onAction, options = {}) => {
    return sileo.action({
      title: message,
      button: {
        title: actionLabel,
        onClick: onAction,
      },
      duration: 90000,
      position: 'bottom-right',
      ...options,
    });
  },
}));
