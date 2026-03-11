import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Modal, Spinner, Container } from '../../components/ui';

export default function Experts() {
  const { user, isAuthed } = useAuth();
  const [experts, setExperts] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [region, setRegion] = useState("all");
  const [selected, setSelected] = useState(null);
  const [req, setReq] = useState({ name: "", phone: "", message: "" });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const query = new URLSearchParams({ role: role !== "all" ? role : undefined, region: region !== "all" ? region : undefined, search: q || undefined }).toString();
        const data = await api.get(`/api/experts?${query}`);
        if (!alive) return;
        setExperts(data?.experts || []);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load experts" });
      }
    })();
    return () => { alive = false; };
  }, [role, region, q]);

  const submitRequest = async () => {
    if (!selected) return;
    if (!req.name || !req.phone || !req.message) {
      alert("Fill name, phone and message.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/experts/${selected.id}/request`, req);
      alert("Request sent!");
      setReq({ name: "", phone: "", message: "" });
      setSelected(null);
      setShowRequestModal(false);
    } catch (err) {
      alert(err.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 16, color: 'var(--color-text-tertiary)' }}>Loading experts...</p>
        </div>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: 'var(--color-error)', marginBottom: 8 }}>Error</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{state.error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="animate-fadeIn">
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Verified Construction Experts
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Connect with Rwanda's top architects, engineers, contractors, and suppliers
          </p>
        </header>

        {/* Filters */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="Search by name, location, or specialty..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  background: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                minWidth: 150,
              }}
            >
              <option value="all">All roles</option>
              <option>Structural Engineer</option>
              <option>Architect</option>
              <option>Contractor</option>
              <option>Supplier</option>
              <option>Surveyor</option>
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                minWidth: 120,
              }}
            >
              <option value="all">All regions</option>
              <option>Kigali</option>
              <option>Eastern Province</option>
              <option>Southern Province</option>
              <option>Northern Province</option>
              <option>Western Province</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => { setRole("all"); setRegion("all"); setQ(""); }}
            >
              Clear
            </Button>
          </div>
        </Card>

        {/* Experts Grid */}
        {experts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              No experts found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {experts.map((expert, idx) => (
              <Card
                key={expert.id}
                hover
                className="animate-slideUp"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => setSelected(expert)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <img
                    src={expert.user.avatarUrl || '/placeholder-avatar.jpg'}
                    alt={expert.user.fullName}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--color-border)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {expert.user.fullName}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 8 }}>
                      {expert.title || expert.user.profession} • {expert.region || expert.user.region}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Badge variant="brand" size="sm">{expert.user.profession}</Badge>
                      {expert.verifiedAt && (
                        <Badge variant="success" size="sm">✓ Verified</Badge>
                      )}
                      <Badge variant="default" size="sm">
                        {expert.ratingCount || 0} reviews
                      </Badge>
                      <Badge variant="default" size="sm">
                        ⭐ {expert.ratingAvg?.toFixed(1) || "—"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {expert.bio && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 16, lineHeight: 1.5 }}>
                    {expert.bio.length > 150 ? `${expert.bio.substring(0, 150)}...` : expert.bio}
                  </p>
                )}

                {expert.skills && expert.skills.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                      Expertise
                    </h4>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {expert.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="default" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {expert.skills.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{expert.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                    Available for projects
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(expert);
                      setShowRequestModal(true);
                    }}
                  >
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`Contact ${selected?.user.fullName}`}
        size="md"
      >
        <form onSubmit={submitRequest}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-primary)' }}>
              Your Name *
            </label>
            <input
              required
              value={req.name}
              onChange={(e) => setReq(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
              placeholder="John Doe"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-primary)' }}>
              Phone Number *
            </label>
            <input
              required
              value={req.phone}
              onChange={(e) => setReq(prev => ({ ...prev, phone: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
              placeholder="+250 788 123 456"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-primary)' }}>
              Message *
            </label>
            <textarea
              required
              value={req.message}
              onChange={(e) => setReq(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
              placeholder="Describe your project needs..."
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowRequestModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" color="white" /> : 'Send Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}