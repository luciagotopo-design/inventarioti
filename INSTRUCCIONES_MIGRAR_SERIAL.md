# 🔧 Eliminar Restricción UNIQUE del Serial

## 📋 Instrucciones para Ejecutar la Migración en Supabase

### Opción 1: Usando el SQL Editor de Supabase (Recomendado)

1. **Abre Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

3. **Copia y Pega el SQL**
   - Abre el archivo: `supabase/migrations/remove_serial_unique_constraint.sql`
   - Copia todo el contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta la Migración**
   - Click en "Run" (o presiona Ctrl+Enter)
   - Deberías ver el mensaje: ✅ "Restricción UNIQUE eliminada correctamente del campo serial"

5. **¡Listo!**
   - Ahora puedes agregar equipos con el mismo serial sin problemas

---

### Opción 2: Usando Supabase CLI (Avanzado)

Si tienes Supabase CLI instalado:

```bash
# 1. Navega a tu proyecto
cd /home/luis/Downloads/inventarioti

# 2. Aplica la migración
supabase db push

# O ejecuta el archivo directamente
supabase db execute --file supabase/migrations/remove_serial_unique_constraint.sql
```

---

## ✅ Verificación

Después de ejecutar la migración, verifica que funcionó:

### En Supabase Dashboard:

1. Ve a "Table Editor"
2. Selecciona la tabla `inventario_general`
3. Ve a la pestaña "Definitions" o "Schema"
4. Busca el campo `serial`
5. **NO debería tener** un ícono de llave o la palabra "UNIQUE"

### Prueba práctica:

1. Intenta agregar un equipo con IA con un serial que ya exista
2. Debería crearse sin errores
3. Verifica en la tabla que ahora hay 2 equipos con el mismo serial

---

## 🔄 Alternativa Manual (Si prefieres)

Si prefieres hacerlo manualmente en el SQL Editor de Supabase, solo copia y pega esto:

```sql
-- Eliminar restricción UNIQUE del serial
ALTER TABLE inventario_general DROP CONSTRAINT IF EXISTS inventario_general_serial_key;
DROP INDEX IF EXISTS inventario_general_serial_key;

-- Verificar
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'inventario_general' 
            AND indexname = 'inventario_general_serial_key'
        ) 
        THEN '✅ Restricción eliminada'
        ELSE '❌ Aún existe'
    END as resultado;
```

---

## ⚠️ Importante

Esta migración:
- ✅ **NO elimina datos** existentes
- ✅ Es **reversible** (puedes volver a agregar UNIQUE si lo necesitas)
- ✅ Es **segura** de ejecutar
- ✅ Permite tener **múltiples equipos** con el mismo serial

---

## 🔙 ¿Cómo Revertir? (Si lo necesitas después)

Si en el futuro quieres volver a tener seriales únicos:

```sql
-- Solo si NO hay duplicados en la tabla
ALTER TABLE inventario_general ADD CONSTRAINT inventario_general_serial_unique UNIQUE (serial);
```

⚠️ **Nota:** Esto solo funcionará si no hay seriales duplicados en la tabla.

---

## 📞 ¿Problemas?

Si ves algún error al ejecutar la migración:

1. **Error: "permission denied"**
   - Asegúrate de tener permisos de administrador en Supabase
   - Usa la cuenta del owner del proyecto

2. **Error: "constraint does not exist"**
   - Está bien, significa que ya no existía la restricción
   - La migración es idempotente (se puede ejecutar múltiples veces)

3. **Error: "cannot drop constraint ... because other objects depend on it"**
   - Contacta al support, puede haber dependencias complejas

---

**¡Ejecuta la migración y listo!** Después podrás agregar equipos con seriales duplicados sin problemas. 🎉
