# 🏦 Plan de Integración PSE - HEat

## 📋 Resumen Ejecutivo

**Objetivo:** Integrar PSE (Pagos Seguros en Línea) como método de pago en el checkout de HEat para permitir pagos bancarios directos en Colombia.

**Estado actual:** El checkout actual (`checkout.vue`) solo soporta pago contra-entrega.

---

## 🔍 ¿Qué es PSE?

**PSE (Pagos Seguros en Línea)** es el sistema de pagos en línea más utilizado en Colombia, administrado por ACH Colombia. Permite a los usuarios pagar directamente desde sus cuentas bancarias (ahorro o corriente) sin necesidad de tarjeta de crédito.

### Flujo típico del usuario:
1. Usuario selecciona PSE como método de pago
2. Selecciona su banco de una lista
3. Indica tipo de persona (Natural/Jurídica)
4. Es redirigido al portal del banco
5. Se autentica y autoriza el pago
6. Retorna a la aplicación con confirmación

---

## 🎯 Opciones de Integración

### Opción 1: Mercado Pago ⭐ **RECOMENDADA**

**Pros:**
- Documentación excelente en español
- SDK JavaScript disponible
- Soporta PSE + Tarjetas + Otros métodos
- Sin costo de setup
- Comisión: ~3.49% + IVA por transacción PSE

**Contras:**
- Los fondos se retienen 14 días (puede variar)
- Requiere cuenta verificada

**Documentación:**
- https://www.mercadopago.com.co/developers/es/docs/checkout-api/integration-configuration/pse
- https://www.mercadopago.com.co/developers/es/docs/checkout-bricks

---

### Opción 2: Wompi (Bancolombia)

**Pros:**
- Respaldo de Bancolombia
- Comisiones competitivas (~2.69% + IVA para PSE)
- Widget de checkout muy fácil de integrar
- Soporte local excelente

**Contras:**
- Menos documentación que Mercado Pago
- Requiere aprobación comercial

**Documentación:**
- https://docs.wompi.co/

---

### Opción 3: PayU Latam

**Pros:**
- Muy establecido en Colombia
- Múltiples métodos de pago
- API robusta

**Contras:**
- Proceso de aprobación más largo
- Documentación menos clara
- Comisiones ligeramente más altas

---

### Opción 4: ePayco

**Pros:**
- Empresa 100% colombiana
- Comisiones competitivas
- Buen soporte

**Contras:**
- SDK menos moderno
- Interfaz de dashboard antigua

---

## 📊 Comparativa de Comisiones PSE

| Pasarela      | Comisión PSE      | Setup   | Tiempo aprobación |
|---------------|-------------------|---------|-------------------|
| Mercado Pago  | 3.49% + IVA       | Gratis  | 1-3 días          |
| Wompi         | 2.69% + IVA       | Gratis  | 3-7 días          |
| PayU          | 3.5% + IVA        | Gratis  | 5-10 días         |
| ePayco        | 2.99% + IVA       | Gratis  | 3-5 días          |

---

## 🏗️ Arquitectura Propuesta

### Estructura de archivos a crear:

```
app/
├── features/
│   └── payments/
│       ├── components/
│       │   ├── PaymentMethodSelector.vue   # Selector: PSE vs Contraentrega
│       │   ├── PSEPaymentForm.vue          # Formulario PSE (banco, tipo persona)
│       │   └── PaymentStatus.vue           # Estado del pago
│       ├── composables/
│       │   ├── usePSEPayment.ts            # Lógica de pago PSE
│       │   └── usePaymentStatus.ts         # Polling/webhook de estado
│       ├── types/
│       │   └── payment.types.ts            # Tipos TypeScript
│       └── services/
│           └── mercadopago.service.ts      # Cliente API Mercado Pago
├── server/
│   └── api/
│       ├── payments/
│       │   ├── create-preference.post.ts   # Crear intención de pago
│       │   ├── banks.get.ts                # Obtener lista de bancos
│       │   └── status/[id].get.ts          # Consultar estado de pago
│       └── webhooks/
│           └── mercadopago.post.ts         # Recibir notificaciones
supabase/
└── migrations/
    └── 00X_add_payments_table.sql          # Nueva tabla para pagos
```

---

## 🔧 Implementación Técnica

### Paso 1: Setup de Mercado Pago

```bash
# Instalar SDK
npm install mercadopago
```

### Paso 2: Configuración de variables de entorno

```env
# .env
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_PUBLIC_KEY=your_public_key
NUXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_public_key
```

### Paso 3: Actualizar nuxt.config.ts

```typescript
// Agregar script de Mercado Pago
app: {
  head: {
    script: [
      { src: 'https://sdk.mercadopago.com/js/v2', async: true }
    ]
  }
}
```

### Paso 4: Crear endpoint para obtener bancos PSE

```typescript
// server/api/payments/banks.get.ts
import { MercadoPagoConfig, PaymentMethods } from 'mercadopago'

export default defineEventHandler(async () => {
  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
  })
  
  const paymentMethods = new PaymentMethods(client)
  const methods = await paymentMethods.get()
  
  // Filtrar solo bancos PSE
  const pse = methods.find(m => m.id === 'pse')
  return pse?.financial_institutions || []
})
```

### Paso 5: Crear endpoint para iniciar pago PSE

```typescript
// server/api/payments/create-pse.post.ts
import { MercadoPagoConfig, Payment } from 'mercadopago'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
  })
  
  const payment = new Payment(client)
  
  const result = await payment.create({
    body: {
      transaction_amount: body.amount,
      description: `Pedido HEat #${body.orderId}`,
      payment_method_id: 'pse',
      payer: {
        email: body.email,
        entity_type: body.entityType, // 'individual' o 'association'
        identification: {
          type: body.idType, // 'CC', 'NIT', etc.
          number: body.idNumber
        }
      },
      transaction_details: {
        financial_institution: body.bankId
      },
      callback_url: `${process.env.NUXT_PUBLIC_BASE_URL}/confirm?order=${body.orderId}`,
      notification_url: `${process.env.NUXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`
    }
  })
  
  return {
    id: result.id,
    status: result.status,
    redirectUrl: result.transaction_details?.external_resource_url
  }
})
```

### Paso 6: Composable para pagos

```typescript
// app/features/payments/composables/usePSEPayment.ts
export function usePSEPayment() {
  const banks = ref<Bank[]>([])
  const loading = ref(false)
  const error = ref('')
  
  const fetchBanks = async () => {
    loading.value = true
    try {
      banks.value = await $fetch('/api/payments/banks')
    } catch (e) {
      error.value = 'Error cargando bancos'
    } finally {
      loading.value = false
    }
  }
  
  const initiatePSEPayment = async (paymentData: PSEPaymentData) => {
    loading.value = true
    try {
      const result = await $fetch('/api/payments/create-pse', {
        method: 'POST',
        body: paymentData
      })
      
      // Redirigir al banco
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
      
      return result
    } catch (e) {
      error.value = 'Error iniciando pago'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  return {
    banks,
    loading,
    error,
    fetchBanks,
    initiatePSEPayment
  }
}
```

---

## 🗃️ Cambios en Base de Datos

### Nueva migración SQL:

```sql
-- 00X_add_payments_table.sql

-- Tabla para registrar intentos de pago
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Info del pago
  external_id TEXT, -- ID de Mercado Pago
  payment_method TEXT NOT NULL, -- 'pse', 'cash', 'card'
  amount NUMERIC(10,2) NOT NULL,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending', 
  -- pending, approved, rejected, in_process, cancelled
  
  -- Metadata
  bank_name TEXT,
  payer_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Políticas RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id)

CREATE POLICY "Users can create own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id)

-- Actualizar tabla orders para incluir payment_status
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash'
```

---

## 🖼️ Diseño del UI

### Selector de método de pago:

```
┌─────────────────────────────────────┐
│  Método de Pago                      │
│                                      │
│  ┌─────────────────────────────────┐│
│  │ 🏦 PSE - Débito bancario       ││
│  │    Paga directamente desde     ││
│  │    tu cuenta bancaria          ││
│  └─────────────────────────────────┘│
│                                      │
│  ┌─────────────────────────────────┐│
│  │ 💵 Pago contra entrega         ││
│  │    Paga cuando recibas tu      ││
│  │    pedido                       ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Formulario PSE:

```
┌─────────────────────────────────────┐
│  Pago con PSE                        │
│                                      │
│  Tipo de persona:                    │
│  ○ Natural    ○ Jurídica            │
│                                      │
│  Tipo documento:                     │
│  [ Cédula de Ciudadanía      ▾ ]    │
│                                      │
│  Número de documento:                │
│  [ 1234567890                   ]    │
│                                      │
│  Email:                              │
│  [ usuario@email.com            ]    │
│                                      │
│  Banco:                              │
│  [ Selecciona tu banco       ▾ ]    │
│    - Bancolombia                     │
│    - Davivienda                      │
│    - BBVA                            │
│    - Banco de Bogotá                 │
│    ...                               │
│                                      │
│  [    🏦 Pagar con PSE    ]         │
└─────────────────────────────────────┘
```

---

## 📝 Checklist de Implementación

### Fase 1: Preparación (1-2 días)
- [ ] Crear cuenta en Mercado Pago Developers
- [ ] Obtener credenciales de sandbox/testing
- [ ] Configurar variables de entorno
- [ ] Crear migración de base de datos

### Fase 2: Backend (2-3 días)
- [ ] Instalar SDK de Mercado Pago
- [ ] Crear endpoint `/api/payments/banks`
- [ ] Crear endpoint `/api/payments/create-pse`
- [ ] Crear endpoint `/api/payments/status/[id]`
- [ ] Configurar webhook para notificaciones

### Fase 3: Frontend (2-3 días)
- [ ] Crear `PaymentMethodSelector.vue`
- [ ] Crear `PSEPaymentForm.vue`
- [ ] Crear composable `usePSEPayment.ts`
- [ ] Modificar `checkout.vue` para integrar nuevos componentes
- [ ] Crear página de confirmación de pago

### Fase 4: Testing (1-2 días)
- [ ] Probar flujo completo en sandbox
- [ ] Probar diferentes bancos
- [ ] Probar escenarios de error
- [ ] Probar webhook de notificaciones

### Fase 5: Producción (1 día)
- [ ] Cambiar a credenciales de producción
- [ ] Configurar dominio en Mercado Pago
- [ ] Testing final en producción
- [ ] Monitorear primeras transacciones

---

## ⚠️ Consideraciones Importantes

### Seguridad:
- NUNCA exponer el `ACCESS_TOKEN` en el frontend
- Validar montos en el backend antes de crear pagos
- Verificar que el usuario es dueño de la orden

### UX:
- Mostrar loader mientras se redirige al banco
- Manejar caso de usuario que cierra la ventana del banco
- Guardar estado del pedido antes de redirigir

### Manejo de errores:
- PSE puede fallar por múltiples razones (fondos insuficientes, tiempo agotado, etc.)
- Implementar retry para estados "in_process"
- Notificar al usuario por email del estado del pago

---

## 🔗 Referencias

- [Mercado Pago - PSE Checkout API](https://www.mercadopago.com.co/developers/es/docs/checkout-api/integration-configuration/pse)
- [Mercado Pago - Webhooks](https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks)
- [PSE Colombia](https://www.pse.com.co)

---

## 📅 Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Preparación | 1-2 días | Cuenta Mercado Pago |
| Backend | 2-3 días | Preparación |
| Frontend | 2-3 días | Backend |
| Testing | 1-2 días | Frontend |
| Producción | 1 día | Testing |

**Total estimado: 7-11 días laborales**

---

*Última actualización: 1 Febrero 2026*

---

## ✅ Mejoras Pre-PSE Completadas (1 Feb 2026)

Antes de la integración PSE, se completaron las siguientes mejoras al perfil de usuario:

### Phase 1: Real Profile Saving ✅
- `useProfile.ts` ya tenía `updateProfile()` funcional con upsert a Supabase
- Se verificó y mantiene el guardado real de nombre, teléfono y dirección

### Phase 2: PhoneInput Component ✅
- **Nuevo archivo:** `app/components/PhoneInput.vue`
- Selector de prefijo país con banderas (🇨🇴 +57, 🇻🇪 +58, 🇲🇽 +52, etc.)
- Formato automático del número (314-368-6786)
- Parseo inteligente de números existentes
- v-model bidireccional
- Reutilizado de la lógica existente en `auth.vue`

### Phase 3: Emoji Avatar System ✅
- **Nueva migración:** `supabase/migrations/006_profile_emoji.sql`
- Columna `emoji` en tabla `profiles`
- Función `generate_random_emoji()` con 40 emojis variados
- Trigger `profiles_default_emoji` para asignar automáticamente en INSERT
- `UserProfile` interface actualizada con campo `emoji`
- Avatar en `perfil.vue` muestra: Google avatar > Emoji > Icono genérico

### Archivos Modificados:
- `app/components/PhoneInput.vue` (nuevo)
- `app/pages/perfil.vue` (refactorizado con guardado real)
- `app/features/user/composables/useProfile.ts` (+ campo emoji)
- `app/types/database.types.ts` (+ campo emoji)
- `supabase/apply_all.sql` (+ emoji column y trigger)
- `supabase/migrations/006_profile_emoji.sql` (nuevo)
