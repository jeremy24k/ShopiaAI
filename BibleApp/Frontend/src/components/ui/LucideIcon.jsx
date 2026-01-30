import * as LucideIcons from 'lucide-react';

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  'user': LucideIcons.User,
  'book-open': LucideIcons.BookOpen,
  'zap': LucideIcons.Zap
};

export default function LucideIcon({ name, ...props }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icono de Lucide no encontrado: ${name}`);
    return null;
  }
  
  return <IconComponent {...props} />;
}
