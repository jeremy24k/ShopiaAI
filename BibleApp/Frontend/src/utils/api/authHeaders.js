import supabase from '../../supabase/supabase';

/**
 * Returns the Authorization header with the current user's JWT token.
 * Returns an empty object if no session is active.
 * Usage: fetch(url, { headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() } })
 */
export async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
}
