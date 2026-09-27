import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

// ==================================================================================
// SEED INITIAL DATA — Only seeds the essential admin account and system settings.
// NO fake campuses, departments, courses, or teacher accounts are seeded.
// Real data is created through the Admin UI and persisted in Supabase.
// ==================================================================================
export const seedInitialData = async () => {
  try {
    // Check if users table exists
    const { error: tableCheck } = await supabase.from('users').select('id').limit(1);

    if (tableCheck) {
      if (tableCheck.code === 'PGRST205' || tableCheck.message?.includes('schema cache')) {
        logger.warn('[DB Seed] Supabase tables not yet initialized.');
        logger.warn('[DB Seed] Run "supabase_schema.sql" in Supabase SQL Editor to create tables.');
        return;
      }
      logger.warn(`[DB Seed] Table check warning: ${tableCheck.message}`);
      return;
    }

    // Check if admin account already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('id', 'usr-admin')
      .maybeSingle();

    if (existingAdmin) {
      logger.info('[DB Seed] Admin account already exists. Skipping seed.');
      return;
    }

    logger.info('[DB Seed] Seeding initial admin account and system settings...');

    // 1. Seed essential admin account only
    const { error: adminError } = await supabase.from('users').upsert([
      {
        id: 'usr-admin',
        name: 'Administrator',
        email: 'admin@ue.edu.pk',
        // Default password: Admin@123
        passwordHash: '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K',
        role: 'ADMIN',
        departmentId: '',
        departmentName: '',
        campus: '',
        designation: 'System Administrator',
        phone: '',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
        employeeId: 'EMP-ADMIN-001'
      }
    ]);

    if (adminError) {
      logger.warn(`[DB Seed] Admin upsert warning: ${adminError.message}`);
    } else {
      logger.info('[DB Seed] Admin account seeded successfully.');
    }

    // 2. Seed system settings (only if not already present)
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('id')
      .eq('id', 'current-system-settings')
      .maybeSingle();

    if (!existingSettings) {
      const { error: settingsError } = await supabase.from('system_settings').upsert([
        {
          id: 'current-system-settings',
          systemName: 'University Course File Management System (CFMS)',
          universityName: 'University of Education',
          academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          currentSession: '',
          mfaRequired: false,
          maxFileSizeMB: 50,
          allowedExtensions: ['.pdf', '.docx', '.zip', '.xlsx', '.ppt'],
          smtpHost: '',
          smtpStatus: 'Not Configured',
          autoArchivingDays: 180,
          maintenanceMode: false
        }
      ]);

      if (settingsError) {
        logger.warn(`[DB Seed] Settings upsert warning: ${settingsError.message}`);
      } else {
        logger.info('[DB Seed] System settings seeded successfully.');
      }
    }

    // 3. Seed initial 3 campuses if campuses table exists and is empty
    const { data: existingCampuses, error: campusCheckError } = await supabase.from('campuses').select('id');
    if (!campusCheckError && (!existingCampuses || existingCampuses.length === 0)) {
      logger.info('[DB Seed] Seeding initial 3 campuses (Attock, Main, Multan)...');
      await supabase.from('campuses').upsert([
        {
          id: 'camp-attock',
          code: 'UE-ATK',
          name: 'Attock Campus',
          city: 'Attock',
          address: 'Attock City, Punjab',
          directorName: 'Prof. Dr. Muhammad Aslam',
          status: 'Active'
        },
        {
          id: 'camp-main',
          code: 'UE-MAIN',
          name: 'Main Campus',
          city: 'Lahore',
          address: 'College Road, Township, Lahore',
          directorName: 'Prof. Dr. Shahid Iqbal',
          status: 'Active'
        },
        {
          id: 'camp-multan',
          code: 'UE-MLT',
          name: 'Multan Campus',
          city: 'Multan',
          address: 'Bosan Road, Multan',
          directorName: 'Prof. Dr. Rashid Mehmood',
          status: 'Active'
        }
      ]);
    }

    logger.info('[DB Seed] Initial seed complete. All real data must be created via the Admin UI.');
  } catch (err: any) {
    logger.error(`[DB Seed] Unexpected error during seed: ${err.message}`);
  }
};
