import React, { useEffect, useRef, useState } from 'react';
import SEO from '../../components/seo/SEO';
import { profilesService } from '../../services/profilesService';
import { useAuthStore } from '../../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// ─── Avatar ───────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ url, name, size = 80 }) {
  const [failed, setFailed] = useState(false);
  const src = !url ? null : url.startsWith('http') ? url : `${BASE_URL}${url}`;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#00f2ff22,#0c1220)',
      border: '2px solid #00f2ff44',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#00f2ff', fontSize: size * 0.35, fontWeight: 700, userSelect: 'none',
    }}>
      {getInitials(name)}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, radius = 4 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)',
      backgroundSize: '200% 100%', animation: 'cb-shimmer 1.4s infinite',
    }} />
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, disabled, type = 'text', placeholder = '', required = false, note }) {
  return (
    <div style={s.formGroup}>
      <label style={s.label}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        disabled={disabled} placeholder={placeholder} required={required}
        style={{ ...s.input, ...(disabled ? s.inputDisabled : {}) }}
      />
      {note && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{note}</span>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { setUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [profile,          setProfile]          = useState(null);
  const [loading,          setLoading]           = useState(true);
  const [fetchErr,         setFetchErr]          = useState(null);
  const [activeTab,        setActiveTab]         = useState('overview');
  const [editMode,         setEditMode]          = useState(false);
  const [form,             setForm]              = useState({});
  const [saving,           setSaving]            = useState(false);
  const [saveMsg,          setSaveMsg]           = useState(null);
  const [avatarUploading,  setAvatarUploading]   = useState(false);
  const [avatarPreview,    setAvatarPreview]     = useState(null);
  const [pwForm,           setPwForm]            = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving,         setPwSaving]          = useState(false);
  const [pwMsg,            setPwMsg]             = useState(null);

  // Fetch on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setFetchErr(null);
        const data = await profilesService.getMe();
        setProfile(data.profile);
        setForm({
          fullName:    data.profile.fullName    || '',
          phone:       data.profile.phone       || '',
          profession:  data.profile.profession  || '',
          addressText: data.profile.addressText || '',
          bio:         data.profile.bio         || '',
        });
      } catch (err) {
        setFetchErr(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save text fields
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const data = await profilesService.updateMe({
        full_name:   form.fullName,
        phone:       form.phone,
        profession:  form.profession,
        addressText: form.addressText,
        bio:         form.bio,
      });
      setProfile(data.profile);
      setUser({ fullName: data.profile.fullName, email: data.profile.email });
      setEditMode(false);
      setSaveMsg({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setSaveMsg(null), 4000);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName:    profile?.fullName    || '',
      phone:       profile?.phone       || '',
      profession:  profile?.profession  || '',
      addressText: profile?.addressText || '',
      bio:         profile?.bio         || '',
    });
    setEditMode(false);
    setSaveMsg(null);
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setAvatarUploading(true);
    try {
      const data = await profilesService.uploadAvatar(file);
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setAvatarPreview(null);
      setSaveMsg({ type: 'success', text: 'Avatar updated.' });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setAvatarPreview(null);
      setSaveMsg({ type: 'error', text: err.message || 'Avatar upload failed.' });
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    // TODO: wire to POST /api/auth/change-password when endpoint is ready
    setTimeout(() => {
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setPwSaving(false);
    }, 800);
  };

  const set   = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));
  const setpw = (f) => (e) => setPwForm(prev => ({ ...prev, [f]: e.target.value }));

  const TABS = [
    { key: 'overview',      label: '👤 Overview' },
    { key: 'security',      label: '🔒 Security' },
    { key: 'notifications', label: '🔔 Notifications' },
  ];

  // Loading
  if (loading) {
    return (
      <div style={s.container}>
        <SEO title="Profile" noindex />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton w="200px" h={28} />
          <Skeleton w="340px" h={16} />
          <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <Skeleton w={80} h={80} radius={40} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton w="50%" h={20} />
              <Skeleton w="30%" h={14} />
            </div>
          </div>
          <Skeleton w="100%" h={200} radius={12} />
        </div>
      </div>
    );
  }

  // Error
  if (fetchErr) {
    return (
      <div style={s.container}>
        <SEO title="Profile" noindex />
        <div style={s.errorBox}>
          <p>{fetchErr}</p>
          <button onClick={() => window.location.reload()} style={s.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || profile?.avatarUrl;
  const roleLabel = (profile?.role || 'Member').replace(/_/g, ' ');

  return (
    <div style={s.container}>
      <SEO title="Profile" noindex />

      <div style={{ marginBottom: 24 }}>
        <h1 style={s.title}>Profile Settings</h1>
        <p style={s.subtitle}>Manage your account information and preferences</p>
      </div>

      {saveMsg && (
        <div style={{
          ...s.alert,
          background:  saveMsg.type === 'success' ? 'rgba(34,197,94,.1)'  : 'rgba(239,68,68,.1)',
          borderColor: saveMsg.type === 'success' ? '#22c55e'             : '#ef4444',
          color:       saveMsg.type === 'success' ? '#22c55e'             : '#ef4444',
          marginBottom: 16,
        }}>
          {saveMsg.text}
        </div>
      )}

      {/* Identity card */}
      <div style={s.identityCard}>
        <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
          <Avatar url={displayAvatar} name={profile?.fullName} size={80} />
          {avatarUploading && (
            <div style={s.avatarOverlay}>
              <span style={{ color: '#00f2ff', fontSize: 11 }}>Uploading…</span>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            title="Change avatar"
            style={s.avatarEditBtn}
          >
            ✏️
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        <div style={{ marginLeft: 20 }}>
          <h2 style={s.profileName}>{profile?.fullName}</h2>
          <p style={s.profileRole}>{roleLabel}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {profile?.verificationStatus === 'VERIFIED' && (
              <span style={s.verifiedBadge}>✓ Verified</span>
            )}
            {profile?.email && (
              <span style={s.metaBadge}>{profile.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{ ...s.tabBtn, ...(activeTab === t.key ? s.tabBtnActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>Personal Information</h3>
            {!editMode
              ? <button onClick={() => setEditMode(true)} style={s.editBtn}>Edit Profile</button>
              : <button onClick={handleCancel} style={s.cancelBtn}>Cancel</button>
            }
          </div>

          <div style={s.formGrid}>
            <Field label="Full Name"  value={form.fullName}    onChange={set('fullName')}    disabled={!editMode} />
            <Field label="Email"      value={profile?.email || ''} disabled type="email"     note="Cannot be changed here." />
            <Field label="Phone"      value={form.phone}       onChange={set('phone')}       disabled={!editMode} type="tel" />
            <Field label="Location"   value={form.addressText} onChange={set('addressText')} disabled={!editMode} placeholder="e.g. Kigali, Rwanda" />
            <Field label="Profession" value={form.profession}  onChange={set('profession')}  disabled={!editMode} placeholder="e.g. Civil Engineer" />
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              disabled={!editMode}
              rows={4}
              placeholder="Tell others about yourself and your expertise…"
              style={{ ...s.input, resize: 'vertical', minHeight: 90 }}
            />
          </div>

          {editMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: 20 }}>Change Password</h3>
          {pwMsg && (
            <div style={{
              ...s.alert,
              background:  pwMsg.type === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
              borderColor: pwMsg.type === 'success' ? '#22c55e'            : '#ef4444',
              color:       pwMsg.type === 'success' ? '#22c55e'            : '#ef4444',
              marginBottom: 16,
            }}>
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Current Password"         value={pwForm.currentPassword}  onChange={setpw('currentPassword')}  type="password" required />
            <Field label="New Password (min. 8 chars)" value={pwForm.newPassword}   onChange={setpw('newPassword')}      type="password" required />
            <Field label="Confirm New Password"     value={pwForm.confirmPassword}  onChange={setpw('confirmPassword')}  type="password" required />
            <div style={{ textAlign: 'right' }}>
              <button type="submit" disabled={pwSaving} style={s.saveBtn}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: 16 }}>Notification Preferences</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            Notification preferences are managed per-device. Email and push settings will be available in an upcoming update.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  container: { maxWidth: '100%', margin: '0 auto', padding: '24px' },
  title:     { margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: 'var(--text-color)' },
  subtitle:  { margin: 0, fontSize: 16, color: 'var(--text-muted)' },

  errorBox: {
    background: 'rgba(239,68,68,.1)', border: '1px solid #ef4444', color: '#ef4444',
    borderRadius: 12, padding: 24, textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12, background: 'transparent', border: '1px solid #ef4444',
    color: '#ef4444', padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
  },
  alert: { border: '1px solid', borderRadius: 8, padding: '10px 14px', fontSize: 14 },

  identityCard: {
    display: 'flex', alignItems: 'center', padding: '20px 24px',
    background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 14, marginBottom: 24,
  },
  avatarOverlay: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'rgba(0,0,0,.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: '50%',
    background: '#1a1a1a', border: '1px solid #333',
    cursor: 'pointer', fontSize: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  profileName: { margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: 'var(--text-color)' },
  profileRole: { margin: 0, fontSize: 14, color: 'var(--text-muted)', textTransform: 'capitalize' },
  verifiedBadge: {
    fontSize: 12, color: '#22c55e',
    background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)',
    borderRadius: 6, padding: '2px 8px',
  },
  metaBadge: {
    fontSize: 12, color: 'var(--text-muted)',
    background: '#1a1a1a', borderRadius: 6, padding: '2px 8px',
  },

  tabBar: {
    display: 'flex', gap: 4, background: '#0d0d0d', border: '1px solid #1a1a1a',
    borderRadius: 12, padding: 6, marginBottom: 20, flexWrap: 'wrap',
  },
  tabBtn: {
    background: 'transparent', border: 'none', color: 'var(--text-muted)',
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
  },
  tabBtnActive: { background: '#1a1a1a', color: '#00f2ff' },

  card: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 14, padding: 24 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-color)' },
  editBtn: {
    background: 'transparent', border: '1px solid #333', color: 'var(--text-muted)',
    padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
  },
  cancelBtn: {
    background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
    padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
  },
  saveBtn: {
    background: '#00f2ff', color: '#000', border: 'none',
    padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
  },

  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 16 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' },
  input: {
    background: '#111', border: '1px solid #222', color: 'var(--text-color)',
    padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  },
  inputDisabled: { opacity: 0.6, cursor: 'not-allowed' },
};
