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
  const email = `test-${Date.now()}@gmail.com`;
  const password = "password123";

  console.log("Signing up temporary user...");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Test User",
      }
    }
  });

  if (signUpError) {
    console.error("Signup failed:", signUpError);
    return;
  }

  const user = signUpData.user;
  if (!user) {
    console.error("No user returned from signup!");
    return;
  }
  console.log("User signed up successfully with ID:", user.id);

  console.log("Creating a project...");
  const { data: project, error: pError } = await supabase
    .from('projects')
    .insert({
      name: "Test Project",
      created_by: user.id,
      status: 'active',
      progress: 0,
    })
    .select()
    .single();

  if (pError) {
    console.error("Failed to create project:", pError);
    return;
  }
  console.log("Project created successfully with ID:", project.id);

  console.log("Trying to insert a task...");
  const { data: task, error: tError } = await supabase
    .from('tasks')
    .insert({
      title: "Test Task",
      project_id: project.id,
      priority: 'medium',
      status: 'todo',
      assignee_id: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (tError) {
    console.error("Failed to create task:", tError);
  } else {
    console.log("Task created successfully:", task);
  }
}

test();
