// DashboardHome.jsx - Connect to real data
import React, { useState, useEffect } from 'react';
import { projectsService } from '../../services/projectsService.js';
import { budgetAnalysisService } from '../../services/budgetAnalysisService.js';

export default function DashboardHome() {
  const [projects, setProjects] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      // Load user's projects
      const projectsData = await projectsService.getUserProjects();
      setProjects(projectsData.projects || []);
      
      // Load recent estimates
      const estimatesData = await budgetAnalysisService.getStandardPlans();
      setEstimates(estimatesData.plans || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading dashboard...</div>
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
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginTop: 14,
        }}
      >
        <StatCard 
          title="Active Projects" 
          value={projects.length} 
          sub={`${projects.length} project(s) in progress`} 
        />
        <StatCard 
          title="Available Plans" 
          value={estimates.length} 
          sub="Standard architectural plans" 
        />
        <StatCard 
          title="Budget Health" 
          value="—" 
          sub="Create a project to track costs" 
        />
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
        <h3 style={{ margin: 0, color: "#0c1220" }}>Recent Projects</h3>
        {projects.length > 0 ? (
          <div style={{ marginTop: 10 }}>
            {projects.slice(0, 3).map(project => (
              <div key={project.id} style={{
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: '600', color: '#0c1220' }}>{project.title}</div>
                <div style={{ color: '#64708a', fontSize: '14px' }}>
                  {project.description} • {project.region}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul style={{ marginTop: 10, color: "#3a4357", lineHeight: 1.7 }}>
            <li>No projects yet - create your first project to get started</li>
          </ul>
        )}
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
        <h3 style={{ margin: 0, color: "#0c1220" }}>Next Actions</h3>
        <ul style={{ marginTop: 10, color: "#3a4357", lineHeight: 1.7 }}>
          <li>Analyze your budget with AI recommendations</li>
          <li>Create your first project</li>
          <li>Generate an estimate / BOQ</li>
          <li>Upload plan and documents</li>
          <li>Request quotes from verified experts</li>
        </ul>
      </div>
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