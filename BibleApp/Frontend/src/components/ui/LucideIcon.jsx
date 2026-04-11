import * as LucideIcons from 'lucide-react';

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  'user': LucideIcons.User,
  'book-open': LucideIcons.BookOpen,
  'zap': LucideIcons.Zap
};

export default function LucideIcon({ name, size, color, ...props }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icono de Lucide no encontrado: ${name}`);
    return null;
  }
  
  const iconStyle = {};
  
  // Manejar CSS variables para size
  if (size && typeof size === 'string' && size.startsWith('var(')) {
    iconStyle.width = size;
    iconStyle.height = size;
  }
  
  // Manejar CSS variables para color
  if (color && typeof color === 'string' && color.startsWith('var(')) {
    iconStyle.color = color;
  }
  
  // Si hay CSS variables, usar style, sino usar props normales
  if (Object.keys(iconStyle).length > 0) {
    return <IconComponent style={iconStyle} {...props} />;
  }
  
  return <IconComponent size={size} color={color} {...props} />;
}
