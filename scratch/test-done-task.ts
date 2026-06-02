import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Trying to insert task with status='done'...");
  
  // Since we don't have session in node, let's create a test user first or see what error we get.
  // Wait, let's look at the active projects in DB first
  const { data: projects } = await supabase.from('projects').select('id').limit(1);
  if (!projects || projects.length === 0) {
    console.error("No projects in DB to test with!");
    return;
  }
  const projectId = projects[0].id;
  console.log("Using project ID:", projectId);

  // We need to sign in to test RLS. Is there any user in the DB?
  // Let's see if we can get profiles
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  console.log("Profiles:", profiles);
}

test();
