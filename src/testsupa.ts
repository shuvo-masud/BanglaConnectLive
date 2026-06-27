import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey?.slice(0, 10));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function testConnection() {
  const { data, error } = await supabase
    .from("your_table_name") // change this
    .select("*")
    .limit(1);

  console.log("DATA:", data);
  console.log("ERROR:", error);
}