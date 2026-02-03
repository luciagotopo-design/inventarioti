# 🎨 Guía de Personalización de Clerk

## 📋 Resumen

Se ha implementado una personalización completa de los componentes de Clerk para que coincidan con el diseño de la aplicación.

---

## 📁 Archivos Creados/Modificados

### 1. **`lib/clerk-theme.ts`** - Configuración Centralizada
Contiene toda la configuración de apariencia para reutilizar en toda la app.

**Características principales:**
- ✅ Colores personalizados usando Tailwind
- ✅ Bordes redondeados (2xl)
- ✅ Tipografía consistente
- ✅ Branding de Clerk oculto
- ✅ Soporte para dark mode

### 2. **Páginas actualizadas:**
- `app/login/[[...login]]/page.tsx` - Login personalizado
- `app/registro/[[...registro]]/page.tsx` - Registro personalizado

### 3. **Componente reutilizable:**
- `components/CustomUserButton.tsx` - UserButton con tema aplicado

---

## 🎨 Secciones de Personalización

### **Variables de Tema**
```typescript
variables: {
  colorPrimary: '#3b82f6',        // Color principal
  colorBackground: '#ffffff',     // Fondo
  borderRadius: '1rem',           // Bordes 2xl
  fontFamily: 'Inter, sans-serif' // Tipografía
}
```

### **Elements Personalizados**
- **card**: Contenedor principal con sombra y bordes redondeados
- **formFieldInput**: Inputs con estados focus y hover
- **formButtonPrimary**: Botón principal con animaciones
- **socialButtons**: Botones sociales estilizados
- **footer**: Oculto para eliminar branding

---

## 🔧 Uso en Componentes

### SignIn Personalizado
```tsx
import { clerkAppearance } from '@/lib/clerk-theme';

<SignIn appearance={clerkAppearance} />
```

### SignUp Personalizado
```tsx
import { clerkAppearance } from '@/lib/clerk-theme';

<SignUp appearance={clerkAppearance} />
```

### UserButton Personalizado
```tsx
import CustomUserButton from '@/components/CustomUserButton';

<CustomUserButton />
```

---

## 🌓 Dark Mode (Opcional)

Para activar dark mode, importa `clerkDarkAppearance`:

```tsx
import { clerkDarkAppearance } from '@/lib/clerk-theme';

<SignIn appearance={clerkDarkAppearance} />
```

---

## ✨ Características Implementadas

✅ Diseño moderno y limpio  
✅ Bordes redondeados 2xl  
✅ Colores consistentes con Tailwind  
✅ Tipografía Inter  
✅ Sin branding de Clerk  
✅ Animaciones y transiciones suaves  
✅ Estados hover/focus mejorados  
✅ Compatible con dark mode  
✅ Código reutilizable  

---

## 🎯 Próximos Pasos (Opcional)

1. **Ajustar colores**: Modifica `variables.colorPrimary` en `clerk-theme.ts`
2. **Cambiar tipografía**: Actualiza `variables.fontFamily`
3. **Activar dark mode**: Implementar detección de tema del sistema
4. **Agregar logo**: Insertar logo en header personalizado
5. **Traducción**: Agregar `localization` para español completo

---

## 📚 Documentación Útil

- [Clerk Appearance API](https://clerk.com/docs/components/customization/appearance)
- [Clerk Elements Reference](https://clerk.com/docs/components/customization/elements)
- [Tailwind CSS](https://tailwindcss.com/docs)
