import { connectSupabase, disconnectSupabase } from './supabase';
import { logger } from './logger';

export const connectDB = async (): Promise<boolean> => {
  logger.info('[Database] Initializing Supabase cloud database connection...');
  const result = await connectSupabase();
  return result.connected;
};

export const disconnectDB = async (): Promise<void> => {
  await disconnectSupabase();
};
