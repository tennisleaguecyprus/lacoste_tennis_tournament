/**
 * Secure write to Supabase. Set in Netlify:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SAVE_PASSWORD
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const expected = process.env.ADMIN_SAVE_PASSWORD;
  if (!expected || body.adminPassword !== expected) {
    return {
      statusCode: 401,
      headers: CORS,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Server misconfigured' }),
    };
  }

  const row = {
    id: 'singleton',
    players: body.players ?? {},
    group_matches: body.group_matches ?? {},
    third_tiebreak: body.third_tiebreak ?? {},
    updated_at: new Date().toISOString(),
  };

  // Upsert one row: ?on_conflict=id is required for merge-duplicates on many PostgREST versions
  const res = await fetch(
    `${supabaseUrl}/rest/v1/tournament_state?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=merge-duplicates',
      },
      body: JSON.stringify(row),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({
        error: 'Database error',
        detail,
        hint: 'Check Netlify env SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (secret/service_role, not anon). Run supabase/schema.sql in Supabase SQL Editor.',
      }),
    };
  }

  return { statusCode: 204, headers: CORS, body: '' };
};
