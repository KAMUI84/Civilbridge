import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/apiClientService';

const LANGUAGE_KEY = 'cb_language';

const REGIONS = [
  '', 'Kigali', 'Northern', 'Southern', 'Eastern', 'Western',
];

const PROFESSIONS = [
  '', 'Architect', 'Civil Engineer', 'Structural Engineer', 'Contractor',
  'Project Manager', 'Interior Designer', 'Quantity Surveyor', 'Other',
];

// Fields that map directly to PUT /api/profiles/me body
const API_FIELDS = ['full_name', 'phone', 'region', 'profession', 'bio'];

function buildFormFromProfile(profile) {
  return {
    full_name:  profile.full_name  || '',
    phone:      profile.phone      || '',
    region:     profile.region     || '',
    profession: profile.profession || '',
    bio:        profile.bio        || '',
    language:   localStorage.getItem(LANGUAGE_KEY) || 'English',
  };
}

export default function Settings() {
  const [saved,     setSaved]     = useState(null);   // last saved snapshot
  const [form,      setForm]      = useState(null);   // current edits
  const [loadState, setLoadState] = useState({ loading: true, error: '' });
  const [saveState, setSaveState] = useState({ saving: false, error: '', success: '' });

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoadState({ loading: true, error: '' });
    try {
      const data = await api.get('/api/profiles/me');
      const profile = data?.profile ?? data;
      const initial = buildFormFromProfile(profile);
      setSaved(initial);
      setForm(initial);
      setLoadState({ loading: false, error: '' });
    } catch (e) {
      setLoadState({ loading: false, error: e.message || 'Failed to load settings' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setSaveState(s => ({ ...s, error: '', success: '' }));
  };

  const isDirty = form && saved && API_FIELDS.some(k => form[k] !== saved[k]) || (form?.language !== saved?.language);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    setSaveState({ saving: true, error: '', success: '' });
    try {
      // Language is localStorage-only — save it immediately
      localStorage.setItem(LANGUAGE_KEY, form.language);

      // Only send API fields to the backend
      const body = {};
      API_FIELDS.forEach(k => { body[k] = form[k] || null; });

      await api.put('/api/profiles/me', body);

      const next = { ...form };
      setSaved(next);
      setSaveState({ saving: false, error: '', success: 'Settings saved successfully.' });
    } catch (e) {
      setSaveState({ saving: false, error: e.message || 'Failed to save settings', success: '' });
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm({ ...saved });
    setSaveState({ saving: false, error: '', success: '' });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadState.loading) {
    return (
      <div style={{ ...styles.container, ...styles.center }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          style={{ animation: 'cb-settings-spin 0.9s linear infinite', marginRight: 10 }}>
          <style>{`@keyframes cb-settings-spin { to { transform:rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>Loading settings…</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (loadState.error) {
    return (
      <div style={{ ...styles.container, ...styles.center, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ color: '#ef4444', fontWeight: 600 }}>{loadState.error}</div>
        <button style={styles.saveButton} onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Account Settings</h1>
        <p style={styles.subtitle}>Update your profile information and preferences</p>
      </div>

      <form onSubmit={handleSave}>
        <div style={styles.settingsGrid}>

          {/* ── Personal Info ──────────────────────────────────────────── */}
          <div style={styles.settingsCard}>
            <h3 style={styles.cardTitle}>Personal Information</h3>

            <div style={styles.settingItem}>
              <label style={styles.settingLabel}>Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="Your full name"
                style={styles.settingInput}
              />
            </div>

            <div style={styles.settingItem}>
              <label style={styles.settingLabel}>Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+250 788 000 000"
                style={styles.settingInput}
              />
            </div>

            <div style={styles.settingItem}>
              <label style={styles.settingLabel}>Region</label>
              <select
                value={form.region}
                onChange={e => set('region', e.target.value)}
                style={styles.settingSelect}
              >
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r || 'Select region…'}</option>
                ))}
              </select>
            </div>

            <div style={styles.settingItem}>
              <label style={styles.settingLabel}>Profession</label>
              <select
                value={form.profession}
                onChange={e => set('profession', e.target.value)}
                style={styles.settingSelect}
              >
                {PROFESSIONS.map(p => (
                  <option key={p} value={p}>{p || 'Select profession…'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Bio & Preferences ─────────────────────────────────────── */}
          <div style={styles.settingsCard}>
            <h3 style={styles.cardTitle}>Bio & Preferences</h3>

            <div style={styles.settingItem}>
              <label style={styles.settingLabel}>Bio</label>
              <textarea
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="A short description about yourself…"
                rows={5}
                style={{ ...styles.settingInput, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={styles.settingItem}>
              <label style={styles.settingLabel}>Display Language</label>
              <select
                value={form.language}
                onChange={e => set('language', e.target.value)}
                style={styles.settingSelect}
              >
                <option value="English">English</option>
                <option value="French">Français</option>
                <option value="Kinyarwanda">Kinyarwanda</option>
              </select>
              <span style={styles.hint}>Saved locally on this device.</span>
            </div>
          </div>

        </div>

        {/* ── Feedback ──────────────────────────────────────────────────── */}
        {saveState.error && (
          <div style={styles.alertError}>{saveState.error}</div>
        )}
        {saveState.success && (
          <div style={styles.alertSuccess}>{saveState.success}</div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div style={styles.actions}>
          <button
            type="submit"
            disabled={saveState.saving || !isDirty}
            style={{
              ...styles.saveButton,
              opacity: saveState.saving || !isDirty ? 0.55 : 1,
              cursor:  saveState.saving || !isDirty ? 'not-allowed' : 'pointer',
            }}
          >
            {saveState.saving ? 'Saving…' : 'Save Changes'}
          </button>

          <button
            type="button"
            disabled={!isDirty}
            onClick={handleReset}
            style={{
              ...styles.resetButton,
              opacity: !isDirty ? 0.45 : 1,
              cursor:  !isDirty ? 'not-allowed' : 'pointer',
            }}
          >
            Discard Changes
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '100%', margin: '0 auto', padding: '24px' },
  center:    { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' },
  header:    { marginBottom: 32 },
  title:     { margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: 'var(--text-color)' },
  subtitle:  { margin: 0, fontSize: 15, color: 'var(--text-muted)' },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
    marginBottom: 28,
  },
  settingsCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24,
  },
  cardTitle:   { margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: 'var(--text-color)' },
  settingItem: { marginBottom: 18 },
  settingLabel:{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' },
  settingInput:{
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'var(--border-color)', border: '1px solid #262626',
    borderRadius: 8, color: 'var(--text-color)', fontSize: 14,
  },
  settingSelect:{
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'var(--border-color)', border: '1px solid #262626',
    borderRadius: 8, color: 'var(--text-color)', fontSize: 14,
  },
  hint: { display: 'block', fontSize: 12, color: '#6b7280', marginTop: 5 },
  alertError:  { padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14, border: '1px solid rgba(239,68,68,0.2)' },
  alertSuccess:{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 14, border: '1px solid rgba(34,197,94,0.2)' },
  actions:     { display: 'flex', gap: 12 },
  saveButton:  { background: '#00f2ff', border: 'none', borderRadius: 8, padding: '12px 24px', color: '#050505', fontSize: 14, fontWeight: 600 },
  resetButton: { background: 'var(--border-color)', border: '1px solid #262626', borderRadius: 8, padding: '12px 24px', color: 'var(--text-muted)', fontSize: 14 },
};
