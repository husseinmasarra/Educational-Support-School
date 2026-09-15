/**
 * Supabase Database Integration & Real-Time Sync Service
 * Project URL: https://wzcadnxazjjynakpyvve.supabase.co
 */

export const SUPABASE_URL = 'https://wzcadnxazjjynakpyvve.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_XJlIzPauhfCf8hq8ec8OxQ_mEwOCMku';

export const SUPABASE_SCHEMA_SQL = `-- ============================================================
-- SUPABASE PRODUCTION SCHEMA FOR SCHOOL PORTAL
-- Copy & Run this SQL script in your Supabase SQL Editor:
-- ============================================================

CREATE TABLE IF NOT EXISTS school_sync (
  key TEXT PRIMARY KEY,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE school_sync ENABLE ROW LEVEL SECURITY;

-- Allow read and write policies for public app access
DROP POLICY IF EXISTS "Allow public read" ON school_sync;
CREATE POLICY "Allow public read" ON school_sync FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON school_sync;
CREATE POLICY "Allow public insert" ON school_sync FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON school_sync;
CREATE POLICY "Allow public update" ON school_sync FOR UPDATE USING (true);
`;

/**
 * Load entire database payload from Supabase Cloud DB
 */
export async function loadFromSupabaseCloud() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/school_sync?key=eq.main_payload&select=payload`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data) && data.length > 0 && data[0].payload) {
      return data[0].payload;
    }
    return null;
  } catch (err) {
    console.error('[Supabase Load Error]:', err);
    return null;
  }
}

/**
 * Save entire database payload to Supabase Cloud DB
 */
export async function saveToSupabaseCloud(dbPayload) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/school_sync`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        key: 'main_payload',
        payload: dbPayload,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Supabase Save Response]:', res.status, errText);
      return null;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Save Error]:', err);
    return null;
  }
}
