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
  // Let's get the active projects
  console.log("Fetching projects...");
  const { data: projects, error: pError } = await supabase.from('projects').select('*');
  console.log("Projects in DB:", projects, pError);

  const { data: members, error: mError } = await supabase.from('project_members').select('*');
  console.log("Project Members in DB:", members, mError);

  const { data: session, error: sError } = await supabase.auth.getSession();
  console.log("Session:", session, sError);
}

test();
