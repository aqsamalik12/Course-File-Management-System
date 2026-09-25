import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sfjvhqpozgavcvqspxyo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmanZocXBvemdhdmN2cXNweHlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI5NzY0OSwiZXhwIjoyMTA1ODczNjQ5fQ.7qc1rkmdy_5QusFkCVzH11dmKEu7-3gBo3NytFU4Kw8';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

let isSupabaseAvailable = false;
let areTablesCreated = false;

export const connectSupabase = async (): Promise<{ connected: boolean; tablesCreated: boolean }> => {
  try {
    logger.info(`[Supabase] Connecting to Supabase project at ${SUPABASE_URL}...`);
    
    // Quick ping to check connection
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
        // Connected to Supabase, but schema tables haven't been run yet
        isSupabaseAvailable = true;
        areTablesCreated = false;
        logger.info('[Supabase] Successfully connected to Supabase!');
        logger.warn('[Supabase] Note: Database tables are not yet created in Supabase public schema.');
        logger.warn('[Supabase] Run the "supabase_schema.sql" file in the Supabase SQL Editor to initialize all tables.');
        return { connected: true, tablesCreated: false };
      }
      logger.warn(`[Supabase] Query warning (${error.message}). Will use resilient fallback.`);
      return { connected: true, tablesCreated: false };
    }

    isSupabaseAvailable = true;
    areTablesCreated = true;
    logger.info('[Supabase] Connected to Supabase and tables are verified ready!');
    return { connected: true, tablesCreated: true };
  } catch (err: any) {
    logger.error(`[Supabase] Failed to reach Supabase: ${err.message}`);
    return { connected: false, tablesCreated: false };
  }
};

export const isSupabaseReady = (): boolean => isSupabaseAvailable && areTablesCreated;
export const isSupabaseOnline = (): boolean => isSupabaseAvailable;

export const disconnectSupabase = async (): Promise<void> => {
  logger.info('[Supabase] Disconnected.');
};
