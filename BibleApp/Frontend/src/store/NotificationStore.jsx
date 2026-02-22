import { create } from 'zustand';
import { sileo } from 'sileo';

export const useNotificationStore = create((set) => ({
  // Función para mostrar notificación de éxito
  showSuccess: (message, options = {}) => {
    sileo.success(message, {
      duration: 3000,
      position: 'top-right',
      ...options,
    });
  },

  // Función para mostrar notificación de error
  showError: (message, options = {}) => {
    sileo.error(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  // Función para mostrar notificación de información
  showInfo: (message, options = {}) => {
    sileo.info(message, {
      duration: 3000,
      position: 'top-right',
      ...options,
    });
  },

  // Función para mostrar notificación de advertencia
  showWarning: (message, options = {}) => {
    sileo.warning(message, {
      duration: 3500,
      position: 'top-right',
      ...options,
    });
  },

  // Función para mostrar notificación de carga (loading)
  showLoading: (message, options = {}) => {
    return sileo.loading(message, {
      position: 'top-right',
      ...options,
    });
  },

  // Función para actualizar una notificación existente (útil para loading)
  updatesileo: (sileoId, type, message, options = {}) => {
    sileo[type](message, {
      id: sileoId,
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
    sileo(message, {
      duration: 4000,
      position: 'top-right',
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
      duration: 6000,
      position: 'bottom-right',
      ...options,
    });
  },
}));
