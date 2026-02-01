# Plan: Profile Improvements

## Resumen
Mejorar la funcionalidad del perfil de usuario para que sea completo y funcional.

---

## Problemas Actuales
1. **El guardado no funciona** - `saveProfile()` tiene un TODO y solo hace un timeout falso
2. **Sin selector de prefijo** - El campo de teléfono debería tener selector de código de país como en login
3. **Sin validación de teléfono** - No hay verificación real del número
4. **Sin emoji de perfil** - Los usuarios no tienen avatar/emoji identificador

---

## Tareas

### Fase 1: Guardado Real en Supabase
- [ ] **1.1** Modificar `useProfile.ts` para tener función `updateProfile()`
- [ ] **1.2** Actualizar `perfil.vue` para usar la función real de guardado
- [ ] **1.3** Cargar datos existentes del perfil al montar

### Fase 2: Selector de Prefijo Telefónico
- [ ] **2.1** Extraer componente `PhoneInput.vue` del auth (o crear uno reutilizable)
- [ ] **2.2** Usar en `perfil.vue` para editar teléfono
- [ ] **2.3** Guardar teléfono con formato internacional (+57...)

### Fase 3: Emoji Aleatorio para Usuarios
- [ ] **3.1** Crear migración SQL:
  ```sql
  ALTER TABLE profiles ADD COLUMN emoji TEXT;
  
  CREATE OR REPLACE FUNCTION generate_random_emoji()
  RETURNS TEXT AS $$
  DECLARE
    emojis TEXT[] := ARRAY['🔥','⭐','🌟','💫','✨','🎯','🚀','💪','🎉','🎊',
                           '🍕','🍔','🌮','🥪','🍟','🍿','🥤','🍩','🧁','🎂'];
  BEGIN
    RETURN emojis[1 + floor(random() * array_length(emojis, 1))::int];
  END;
  $$ LANGUAGE plpgsql;
  
  CREATE OR REPLACE FUNCTION set_default_emoji()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.emoji IS NULL THEN
      NEW.emoji := generate_random_emoji();
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  CREATE TRIGGER profiles_default_emoji
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_default_emoji();
  ```
- [ ] **3.2** Mostrar emoji en el perfil como avatar
- [ ] **3.3** Permitir cambiar emoji (selector con emojis disponibles)

### Fase 4: Validación de Teléfono (Futuro)
- [ ] **4.1** Evaluar opciones:
  - Twilio SMS
  - Resend Email con código
  - Magic link al email con confirmación
- [ ] **4.2** Implementar verificación OTP de 6 dígitos
- [ ] **4.3** Marcar teléfono como verificado en DB

---

## Archivos a Modificar
- `app/features/user/composables/useProfile.ts` - Añadir updateProfile
- `app/pages/perfil.vue` - UI completa de perfil
- `app/components/PhoneInput.vue` - Componente reutilizable (nuevo)
- `supabase/migrations/XXX_profile_emoji.sql` - Migración emoji

---

## Prioridad de Implementación
1. **Alta**: Guardado real (Fase 1) - Sin esto no funciona nada
2. **Media**: Selector de prefijo (Fase 2) - UX consistency
3. **Baja**: Emoji (Fase 3) - Nice to have
4. **Futura**: Validación OTP (Fase 4) - Cuando haya presupuesto para SMS/email service

---

## Notas Técnicas
- El perfil ya tiene tabla `profiles` en Supabase con RLS
- `useProfile.ts` ya tiene `fetchProfile()`, solo falta `updateProfile()`
- El componente de auth ya tiene un selector de país que se puede reutilizar
