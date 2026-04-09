import { supabase } from "@/integrations/supabase/client";

/**
 * Invokes a Supabase Edge Function with a timeout.
 * Returns the response data, or null if the call times out or fails.
 */
export async function invokeWithTimeout<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
  timeoutMs: number
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    clearTimeout(timer);

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}
