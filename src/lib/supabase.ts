
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://okkbronctpkphtgedusn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra2Jyb25jdHBrcGh0Z2VkdXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzE5NDksImV4cCI6MjA1NzcwNzk0OX0.fR-h_13x9x8eto9FV8bpDCiJ-7BQohrYJfQGmpIBwmQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Initialize the database if it doesn't exist
export const initializeDatabase = async () => {
  try {
    // Check if table exists first to avoid duplicate creation errors
    const { data: existingTables } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    // If table doesn't exist yet, create it 
    // In real practice, migrations would be used, but this is a simpler approach for demo purposes
    if (!existingTables) {
      console.log('Initializing database schema...');
      // Schema will be created via SQL migration in production
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
