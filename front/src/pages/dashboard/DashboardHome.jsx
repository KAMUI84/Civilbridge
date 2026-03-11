// DashboardHome.jsx - Connect to real data
import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '' });
  const [widgets, setWidgets] = useState({
    projectsCount: 0,
    listingsCount: 0,
    plansCount: 0,
    estimatesCount: 0,
    expertRequestsCount: 0,
    recentProjects: [],
    recentListings: [],
    recentPlans: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, listingsRes, plansRes, estimatesRes] = await Promise.allSettled([
        api.get('/api/projects/user'),
        api.get('/api/listings/user'),
        api.get('/api/plans/me'),
        api.get('/api/estimator/estimates'),
      ]);

      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value || [] : [];
      const listings = listingsRes.status === 'fulfilled' ? listingsRes.value || [] : [];
      const plans = plansRes.status === 'fulfilled' ? plansRes.value || [] : [];
      const estimates = estimatesRes.status === 'fulfilled' ? estimatesRes.value || [] : [];

      setWidgets({
        projectsCount: projects.length,
        listingsCount: listings.length,
        plansCount: plans.length,
        estimatesCount: estimates.length,
        expertRequestsCount: 0, // TODO: implement expert requests endpoint
        recentProjects: projects.slice(0, 3),
        recentListings: listings.slice(0, 3),
        recentPlans: plans.slice(0, 3),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setState({ loading: false, error: 'Failed to load dashboard' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  if (state.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#b91c1c' }}>
        <div>{state.error}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, color: "#0c1220" }}>
        Project Management Dashboard
      </h1>
      <p style={{ color: "#64708a", fontWeight: 650 }}>
        Track progress, budget health, permits, and documents.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 14,
        }}
      >
        <StatCard title="Active Projects" value={widgets.projectsCount} sub="Your ongoing projects" />
        <StatCard title="Listings" value={widgets.listingsCount} sub="Your marketplace listings" />
        <StatCard title="Plans" value={widgets.plansCount} sub="Your submitted plans" />
        <StatCard title="Estimates" value={widgets.estimatesCount} sub="BOQ & cost estimates" />
        <StatCard title="Expert Requests" value={widgets.expertRequestsCount} sub="Pending requests" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginTop: 14 }}>
        <DashboardSection title="Recent Projects">
          {widgets.recentProjects.length > 0 ? (
            widgets.recentProjects.map(project => (
              <div key={project.id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #eef0f4'
              }}>
                <div style={{ fontWeight: '600', color: '#0c1220' }}>{project.title}</div>
                <div style={{ color: '#64708a', fontSize: '14px' }}>
                  {project.description} • {project.region}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', background: '#f0f9ff', color: '#0369a1', borderRadius: 4 }}>
                    {project.status}
                  </span>
                  {project.progressPercent && (
                    <span style={{ fontSize: 12, padding: '2px 8px', background: '#f0fdf4', color: '#15803d', borderRadius: 4 }}>
                      {project.progressPercent}%
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64708a' }}>No projects yet</p>
          )}
        </DashboardSection>

        <DashboardSection title="Recent Listings">
          {widgets.recentListings.length > 0 ? (
            widgets.recentListings.map(listing => (
              <div key={listing.id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #eef0f4'
              }}>
                <div style={{ fontWeight: '600', color: '#0c1220' }}>{listing.title}</div>
                <div style={{ color: '#64708a', fontSize: '14px' }}>
                  {listing.location} • {listing.category}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 4 }}>
                    {listing.status}
                  </span>
                  {listing.price && (
                    <span style={{ fontSize: 12, padding: '2px 8px', background: '#f0fdf4', color: '#15803d', borderRadius: 4 }}>
                      {listing.currency} {listing.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64708a' }}>No listings yet</p>
          )}
        </DashboardSection>

        <DashboardSection title="Recent Plans">
          {widgets.recentPlans.length > 0 ? (
            widgets.recentPlans.map(plan => (
              <div key={plan.id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #eef0f4'
              }}>
                <div style={{ fontWeight: '600', color: '#0c1220' }}>{plan.title}</div>
                <div style={{ color: '#64708a', fontSize: '14px' }}>
                  {plan.category} • {plan.style}
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 4 }}>
                    {plan.status}
                  </span>
                  {plan.builtAreaM2 && (
                    <span style={{ fontSize: 12, padding: '2px 8px', background: '#f0f9ff', color: '#0369a1', borderRadius: 4 }}>
                      {plan.builtAreaM2} m²
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64708a' }}>No plans yet</p>
          )}
        </DashboardSection>
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #eef0f4",
          borderRadius: 16,
          padding: 14,
          background: "#f7f8fb",
        }}
      >
        <h3 style={{ margin: 0, color: "#0c1220" }}>Quick Actions</h3>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          <QuickAction label="Create Project" href="/dashboard/projects" />
          <QuickAction label="New Listing" href="/dashboard/listings/new" />
          <QuickAction label="Submit Plan" href="/dashboard/plans/new" />
          <QuickAction label="Create Estimate" href="/dashboard/estimates" />
          <QuickAction label="Find Experts" href="/experts" />
          <QuickAction label="Browse Plans" href="/plans" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, href }) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '10px',
        background: 'white',
        border: '1px solid #eef0f4',
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: 600,
        color: '#0c1220',
        textDecoration: 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f8fafc';
        e.target.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#eef0f4';
      }}
    >
      {label}
    </a>
  );
}

function DashboardSection({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #eef0f4",
        borderRadius: 16,
        padding: 14,
        background: "#f7f8fb",
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', color: "#0c1220" }}>{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div
      style={{
        border: "1px solid #eef0f4",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 10px 24px rgba(12,18,32,.05)",
      }}
    >
      <div style={{ fontWeight: 850, color: "#3a4357" }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 950, marginTop: 8, color: "#0c1220" }}>
        {value}
      </div>
      <div style={{ color: "#64708a", fontWeight: 650, marginTop: 6 }}>{sub}</div>
    </div>
  );
}