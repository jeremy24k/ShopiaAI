import * as LucideIcons from 'lucide-react';

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  'user-round': LucideIcons.UserRound,
  'Scale': LucideIcons.Scale,
  'graduation-cap': LucideIcons.GraduationCap
};

/**
 * Componente que renderiza un icono de Lucide dinámicamente
 * @param {string} name - Nombre del icono
 * @param {object} props - Props para el componente del icono
 */
export default function LucideIcon({ name, ...props }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icono de Lucide no encontrado: ${name}`);
    return null;
  }
  
  return <IconComponent {...props} />;
}
