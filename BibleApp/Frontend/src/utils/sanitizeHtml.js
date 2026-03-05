// Función simple para limpiar HTML - solo permite formato básico
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Crear un div temporal para procesar el HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Eliminar scripts y elementos peligrosos
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
  dangerousTags.forEach(tag => {
    const elements = tempDiv.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
  });
  
  // Eliminar atributos peligrosos
  const allElements = tempDiv.getElementsByTagName('*');
  for (let element of allElements) {
    // Mantener solo atributos seguros
    const safeAttributes = ['href', 'target', 'title', 'alt'];
    const attributes = Array.from(element.attributes);
    
    attributes.forEach(attr => {
      if (!safeAttributes.includes(attr.name.toLowerCase())) {
        element.removeAttribute(attr.name);
      }
    });
    
    // Limpiar eventos inline
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });
  }
  
  // Limpiar hrefs que no sean seguros
  const links = tempDiv.getElementsByTagName('a');
  for (let link of links) {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('javascript:') || href.startsWith('data:'))) {
      link.removeAttribute('href');
    }
  }
  
  return tempDiv.innerHTML;
};

// Función para truncar HTML a N líneas manteniendo formato
export const truncateHtml = (html, maxLines = 3) => {
  if (!html) return '';
  
  const cleanHtml = sanitizeHtml(html);
  
  // Crear un div temporal para medir
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  
  // Configurar estilos similares al preview
  tempDiv.style.cssText = `
    font-family: var(--primary-font);
    font-size: var(--font-size-300);
    line-height: 1.5;
    max-height: ${maxLines * 1.5}em;
    overflow: hidden;
    position: relative;
  `;
  
  // Si el contenido es corto, devolverlo completo
  if (tempDiv.scrollHeight <= tempDiv.clientHeight) {
    return cleanHtml;
  }
  
  // Truncar contenido largo
  const truncated = tempDiv.innerHTML;
  return truncated + '...';
};
