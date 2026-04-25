/**
 * Seed script — creates test users in Supabase Auth
 * Run: node scripts/seed-users.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rdggfsfnwpioujxxyblf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_9JS6Dp7KX1Zu5k2HnDIXaQ_RMXSFu8-'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const TEST_USERS = [
  {
    email: 'testuser@sheroam.in',
    password: 'SheRoam@2026',
    metadata: { name: 'Priya Sharma', city: 'Delhi', initials: 'PS' }
  },
  {
    email: 'admin@sheroam.in',
    password: 'SheRoamAdmin@2026',
    metadata: { name: 'Admin Verifier', city: 'Mumbai', initials: 'AV' }
  }
]

async function seedUsers() {
  console.log('🌱 Seeding test users...\n')

  for (const user of TEST_USERS) {
    console.log(`→ Creating: ${user.email}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: user.metadata
      }
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        console.log(`  ⚠ Already exists — skipping`)
      } else {
        console.log(`  ✗ Error: ${error.message}`)
      }
    } else {
      console.log(`  ✓ Created successfully (ID: ${data.user?.id})`)
      
      // Also insert into the users table
      if (data.user) {
        const { error: dbError } = await supabase
          .from('users')
          .upsert([{
            id: data.user.id,
            name: user.metadata.name,
            initials: user.metadata.initials,
            city: user.metadata.city,
            is_verified: user.email === 'admin@sheroam.in' // Admin is pre-verified
          }])
        
        if (dbError) {
          console.log(`  ⚠ DB insert note: ${dbError.message}`)
        } else {
          console.log(`  ✓ DB profile created`)
        }
      }
    }
    console.log()
  }

  console.log('═══════════════════════════════════════════')
  console.log('  TEST CREDENTIALS')
  console.log('═══════════════════════════════════════════')
  console.log()
  console.log('  👩 Regular User:')
  console.log('     Email:    testuser@sheroam.in')
  console.log('     Password: SheRoam@2026')
  console.log()
  console.log('  🔑 Admin User:')
  console.log('     Email:    admin@sheroam.in')
  console.log('     Password: SheRoamAdmin@2026')
  console.log('     Admin Panel Password: sheroam-admin-2026')
  console.log()
  console.log('═══════════════════════════════════════════')
}

seedUsers()
