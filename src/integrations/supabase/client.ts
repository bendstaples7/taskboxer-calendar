// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://okkbronctpkphtgedusn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra2Jyb25jdHBrcGh0Z2VkdXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzE5NDksImV4cCI6MjA1NzcwNzk0OX0.fR-h_13x9x8eto9FV8bpDCiJ-7BQohrYJfQGmpIBwmQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);