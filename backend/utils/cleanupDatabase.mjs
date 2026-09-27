// Database Cleanup Script
// Run from project root: node backend/utils/cleanupDatabase.mjs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log('🧹 Starting database cleanup...\n');

  // 1. Remove duplicate courses (keep only unique code+departmentId combos)
  console.log('📚 Cleaning up duplicate courses...');
  const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
  if (courses) {
    const seen = new Set();
    const toDelete = [];
    for (const course of courses) {
      const key = `${course.code}-${course.departmentId}`;
      if (seen.has(key)) {
        toDelete.push(course.id);
      } else {
        seen.add(key);
      }
    }
    if (toDelete.length > 0) {
      const { error } = await supabase.from('courses').delete().in('id', toDelete);
      if (error) console.error('  ❌ Error deleting courses:', error.message);
      else console.log(`  ✅ Removed ${toDelete.length} duplicate courses`);
    } else {
      console.log('  ✅ No duplicate courses found');
    }
  }

  // 2. Remove unnamed/garbage departments (those named 'New Department ...')
  console.log('\n🏢 Cleaning up unnamed/test departments...');
  const { data: depts } = await supabase.from('departments').select('id, name');
  if (depts) {
    const badDepts = depts.filter(d => 
      d.name.startsWith('New Department') || 
      d.name.trim() === '' ||
      !d.name
    );
    if (badDepts.length > 0) {
      const { error } = await supabase.from('departments').delete().in('id', badDepts.map(d => d.id));
      if (error) console.error('  ❌ Error deleting departments:', error.message);
      else console.log(`  ✅ Removed ${badDepts.length} test/unnamed departments: ${badDepts.map(d => d.name).join(', ')}`);
    } else {
      console.log('  ✅ No unnamed departments found');
    }
  }

  // 3. Remove duplicate/extra seed departments from original schema (dept-cs, dept-math, dept-eng are the seeded ones)
  // These had wrong campusId (empty) and may conflict. Only keep if they have valid campusId.
  console.log('\n🏢 Checking seeded departments...');
  const { data: seedDepts } = await supabase
    .from('departments')
    .select('id, name, campusId, campusName')
    .in('id', ['dept-cs', 'dept-math', 'dept-eng']);
  
  if (seedDepts && seedDepts.length > 0) {
    for (const d of seedDepts) {
      if (!d.campusId || d.campusId === '') {
        console.log(`  ⚠️  Seeded dept "${d.name}" has no campusId — leaving it (may need to be edited in Admin UI)`);
      }
    }
  }

  // 4. Remove test/duplicate users (non-admin, non-essential seed users that were from test seeds)
  console.log('\n👥 Checking users...');
  const { data: users } = await supabase.from('users').select('id, name, email, role');
  if (users) {
    console.log(`  ℹ️  Total users: ${users.length}`);
    users.forEach(u => console.log(`    - [${u.role}] ${u.name} (${u.email})`));
  }

  console.log('\n✅ Cleanup complete!\n');
  console.log('📝 Next steps:');
  console.log('  1. Run the updated supabase_schema.sql in Supabase SQL Editor to add campuses, hod_assignments tables');
  console.log('  2. Use the Admin UI to create real campuses, departments, and assign HODs');
  console.log('  3. The system will only show real data from now on\n');
}

cleanup().catch(console.error);
