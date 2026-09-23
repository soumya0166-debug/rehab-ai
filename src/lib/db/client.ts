// REHAB-AI: Supabase & Database Client Stub
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key',
};

export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
}

export async function queryHealthCheck(): Promise<boolean> {
  return true;
}
