import * as LucideIcons from 'lucide-react';

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  'user': LucideIcons.User,
  'book-open': LucideIcons.BookOpen,
  'zap': LucideIcons.Zap
};

export default function LucideIcon({ name, size, ...props }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icono de Lucide no encontrado: ${name}`);
    return null;
  }
  
  const iconStyle = {};
  if (size && typeof size === 'string' && size.startsWith('var(')) {
    iconStyle.width = size;
    iconStyle.height = size;
    return <IconComponent style={iconStyle} {...props} />;
  }
  
  return <IconComponent size={size} {...props} />;
}
