# Modal Component

Componente modal reutilizable basado en la estructura y estilos de `ContextModal`. Proporciona una interfaz consistente para todos los modales de la aplicación.

## Características

- ✅ Overlay con blur
- ✅ Animaciones suaves (fadeIn, slideUp)
- ✅ 4 tamaños predefinidos (small, medium, large, xlarge)
- ✅ Header personalizable con acciones
- ✅ Contenido flexible con children
- ✅ Responsive (mobile-first)
- ✅ Cierre con overlay (configurable)
- ✅ Botón de cerrar (configurable)

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | **Requerido**. Controla si el modal está visible |
| `onClose` | `function` | - | **Requerido**. Callback cuando se cierra el modal |
| `title` | `string` | - | **Requerido**. Título del modal |
| `children` | `ReactNode` | - | **Requerido**. Contenido del modal |
| `headerActions` | `ReactNode` | - | Acciones adicionales en el header (botones, etc) |
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'` | Tamaño del modal |
| `showCloseButton` | `boolean` | `true` | Mostrar botón de cerrar |
| `closeOnOverlayClick` | `boolean` | `true` | Cerrar al hacer click en el overlay |
| `className` | `string` | `''` | Clase CSS adicional para el modal |
| `contentClassName` | `string` | `''` | Clase CSS adicional para el contenido |

## Tamaños

- **small**: 400px - 500px
- **medium**: 600px - 800px (default)
- **large**: 800px - 900px, min-height 70vh
- **xlarge**: 900px - 1200px, min-height 70vh

## Uso Básico

```jsx
import Modal from '../../components/ui/Modal';

function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Mi Modal"
        >
            <p>Contenido del modal</p>
        </Modal>
    );
}
```

## Ejemplo con Header Actions

```jsx
import Modal from '../../components/ui/Modal';
import { Trash2 } from 'lucide-react';
import Icon from './Icon';

function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);

    const headerActions = (
        <button onClick={handleDelete}>
            <Icon icon={<Trash2 />} size="small" />
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Modal con Acciones"
            headerActions={headerActions}
            size="large"
        >
            <p>Contenido del modal</p>
        </Modal>
    );
}
```

## Ejemplo con Contenido Personalizado

```jsx
import Modal from '../../components/ui/Modal';
import styles from './MyModal.module.css';

function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Modal Personalizado"
            contentClassName={styles.customContent}
            closeOnOverlayClick={false}
        >
            <div className={styles.section}>
                <h3>Sección 1</h3>
                <p>Contenido...</p>
            </div>
            <div className={styles.footer}>
                <button onClick={handleSave}>Guardar</button>
                <button onClick={() => setIsOpen(false)}>Cancelar</button>
            </div>
        </Modal>
    );
}
```

## Ejemplo Real: NoteModal

```jsx
import Modal from '../../components/ui/Modal';

function NoteModal({ note, isOpen, onClose, mode }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={note.note_title}
            size="large"
            closeOnOverlayClick={mode !== 'edit'}
        >
            <p className={styles.subtitle}>
                {mode === 'view' ? 'Visualizando nota' : 'Editando nota'}
            </p>
            
            <div className={styles.content}>
                {mode === 'view' ? (
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                ) : (
                    <div ref={editorRef} />
                )}
            </div>
            
            {mode === 'edit' && (
                <div className={styles.footer}>
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleSave}>Guardar</button>
                </div>
            )}
        </Modal>
    );
}
```

## Estilos Personalizados

Si necesitas personalizar el contenido del modal, puedes usar `contentClassName`:

```css
/* MyModal.module.css */
.customContent {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.section {
  padding: var(--spacing-600);
  border-bottom: 1px solid var(--color-grey-200);
}

.footer {
  padding: var(--spacing-500);
  display: flex;
  gap: var(--spacing-300);
  justify-content: flex-end;
  border-top: 1px solid var(--color-grey-200);
}
```

## Accesibilidad

- El botón de cerrar tiene `aria-label` automático
- El overlay es clickeable por defecto (configurable)
- Animaciones suaves para mejor UX
- Responsive en todos los dispositivos

## Responsive

- **Desktop**: Tamaños definidos según prop `size`
- **Tablet (< 1024px)**: Large y XLarge se ajustan a 85-90vw
- **Mobile (< 768px)**: Todos los tamaños se ajustan a 95vw
- **Small Mobile (< 480px)**: Fullscreen (100vw x 100vh)

## Migración desde ContextModal

Si estás usando `ContextModal` y quieres migrar al nuevo `Modal`:

**Antes:**
```jsx
<div className={styles.overlay} onClick={onClose} />
<div className={styles.modal}>
    <div className={styles.header}>
        <h2>{title}</h2>
        <button onClick={onClose}>X</button>
    </div>
    <div className={styles.content}>
        {children}
    </div>
</div>
```

**Después:**
```jsx
<Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="xlarge"
>
    {children}
</Modal>
```

## Notas

- El componente usa `position: fixed` para el overlay y el modal
- Z-index: 1000 (overlay), 1001 (modal)
- Las animaciones son automáticas (fadeIn, slideUp)
- El modal se centra automáticamente en la pantalla
