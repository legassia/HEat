/**
 * Script para cambiar el rol de un usuario
 * 
 * Uso:
 *   npx tsx scripts/set-role.ts <role> <email>
 * 
 * Ejemplos:
 *   npx tsx scripts/set-role.ts admin user@email.com
 *   npx tsx scripts/set-role.ts dev admin@heat.com
 *   npx tsx scripts/set-role.ts customer test@test.com
 * 
 * Roles disponibles:
 *   - customer (default)
 *   - admin
 *   - dev
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://azdfajulqibhejjefjih.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY no está configurada')
  console.log('')
  console.log('Para usar este script, necesitas:')
  console.log('1. Ir a Supabase Dashboard > Settings > API')
  console.log('2. Copiar el "service_role" key (no el anon key)')
  console.log('3. Ejecutar:')
  console.log('   SUPABASE_SERVICE_KEY="tu-key" npx tsx scripts/set-role.ts admin user@email.com')
  console.log('')
  console.log('⚠️  Alternativa: Usar SQL directamente en Supabase Dashboard:')
  console.log('   UPDATE profiles SET role = \'admin\' WHERE id = \'USER-UUID\';')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('SUPABASE_URL', SUPABASE_URL)
console.log('SUPABASE_SERVICE_KEY', SUPABASE_SERVICE_KEY)
console.log('Supabase is ready')

const validRoles = ['customer', 'admin', 'dev']

async function setUserRole(role: string, email: string) {
  // Validate role
  if (!validRoles.includes(role)) {
    console.error(`❌ Rol inválido: ${role}`)
    console.log(`   Roles válidos: ${validRoles.join(', ')}`)
    process.exit(1)
  }

  console.log(`🔍 Buscando usuario: ${email}...`)

  // Get user by email
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.error('❌ Error al obtener usuarios:', userError.message)
    process.exit(1)
  }

  const user = userData.users.find(u => u.email === email)
  
  if (!user) {
    console.error(`❌ Usuario no encontrado: ${email}`)
    process.exit(1)
  }

  console.log(`✅ Usuario encontrado: ${user.id}`)
  console.log(`📝 Actualizando rol a: ${role}...`)

  // Update profile role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', user.id)

  if (updateError) {
    console.error('❌ Error al actualizar rol:', updateError.message)
    
    // Try to insert if profile doesn't exist
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, role })
    
    if (insertError) {
      console.error('❌ Error al crear perfil:', insertError.message)
      process.exit(1)
    }
  }

  console.log(`✅ Rol actualizado exitosamente!`)
  console.log('')
  console.log(`   Usuario: ${email}`)
  console.log(`   Rol: ${role}`)
}

// Parse arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('Uso: npx tsx scripts/set-role.ts <role> <email>')
  console.log('')
  console.log('Roles disponibles:')
  console.log('  - customer (usuario normal)')
  console.log('  - admin (administrador)')
  console.log('  - dev (desarrollador)')
  console.log('')
  console.log('Ejemplo:')
  console.log('  npx tsx scripts/set-role.ts admin user@email.com')
  process.exit(1)
}

const [role, email] = args

setUserRole(role, email).catch(console.error)

