import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expertsService } from '../../services/expertsService';
import { Button, Card, Badge, Container } from '../../components/ui';
import SEO from '../../components/seo/SEO';

function getInitials(value) {
  return (value || 'Expert')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ExpertCardSkeleton() {
  return (
    <div
      style={{
        height: 280,
        borderRadius: 20,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
      }}
    />
  );
}

export default function Experts() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [region, setRegion] = useState('all');

  const loadExperts = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const data = await expertsService.getAll({
        role: role !== 'all' ? role : undefined,
        region: region !== 'all' ? region : undefined,
        search: q || undefined,
      });
      setExperts(data?.experts || []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to load experts.' });
    }
  }, [q, region, role]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadExperts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadExperts]);

  // Build JSON-LD for expert directory
  const expertsJsonLd = experts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CivilBridge Verified Construction Experts",
    "itemListElement": experts.slice(0, 10).map((e, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Person",
        "name": e.user?.fullName || "Expert",
        "jobTitle": e.user?.profession || e.providerType,
        "description": e.bio,
      }
    }))
  } : undefined;

  return (
    <Container>
      <SEO
        title="Verified Construction Experts"
        description="Connect with Rwanda's top architects, engineers, contractors, and suppliers. Book appointments with verified construction professionals."
        jsonLd={expertsJsonLd}
      />
      <div className="animate-fadeIn">
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Verified Construction Experts
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Explore real expert profiles, verified credentials, live availability, and completed reviews before you book.
          </p>
        </header>

        <Card padding="lg" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="Search by name, location, or specialty..."
                value={q}
                onChange={(event) => setQ(event.target.value)}
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
              onChange={(event) => setRole(event.target.value)}
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
              <option value="ENGINEER">Engineer</option>
              <option value="ARCHITECT">Architect</option>
              <option value="CONTRACTOR">Contractor</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="SURVEYOR">Surveyor</option>
            </select>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
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
              <option value="Kigali">Kigali</option>
              <option value="Eastern Province">Eastern Province</option>
              <option value="Southern Province">Southern Province</option>
              <option value="Northern Province">Northern Province</option>
              <option value="Western Province">Western Province</option>
            </select>
            <Button variant="secondary" onClick={() => { setRole('all'); setRegion('all'); setQ(''); }}>
              Clear
            </Button>
          </div>
        </Card>

        {state.loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, index) => <ExpertCardSkeleton key={index} />)}
          </div>
        ) : state.error ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h2 style={{ color: 'var(--color-error)', marginBottom: 8 }}>Error</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>{state.error}</p>
            <Button onClick={loadExperts}>Retry</Button>
          </div>
        ) : experts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              No experts found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Try adjusting your filters or search terms.</p>
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
                onClick={() => navigate(`/experts/${expert.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  {expert.user?.avatarUrl ? (
                    <img
                      src={expert.user.avatarUrl}
                      alt={expert.user?.fullName || 'Expert'}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--color-border)',
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        border: '3px solid var(--color-border)',
                        background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                      }}
                    >
                      {getInitials(expert.user?.fullName)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {expert.user?.fullName}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 8 }}>
                      {expert.headline || expert.user?.profession} | {expert.region?.name || 'Rwanda'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Badge variant="brand" size="sm">{expert.user?.profession || expert.providerType || 'Expert'}</Badge>
                      {expert.verifiedAt && <Badge variant="success" size="sm">Verified</Badge>}
                      <Badge variant="default" size="sm">{expert.reviewCount || 0} reviews</Badge>
                      <Badge variant="default" size="sm">{Number(expert.avgRating || 0).toFixed(1)} rating</Badge>
                    </div>
                  </div>
                </div>

                {expert.user?.bio ? (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 16, lineHeight: 1.5 }}>
                    {expert.user.bio.length > 150 ? `${expert.user.bio.substring(0, 150)}...` : expert.user.bio}
                  </p>
                ) : null}

                {expert.specialties?.length ? (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                      Expertise
                    </h4>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {expert.specialties.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                    View profile, reviews, and calendar
                  </div>
                  <Button
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/experts/${expert.id}`);
                    }}
                  >
                    Open Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
