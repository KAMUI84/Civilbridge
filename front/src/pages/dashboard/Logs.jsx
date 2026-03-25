// Logs Component
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Logs() {
  const { dashboardConfig } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockLogs = [
    { id: 1, action: 'LOGIN', user: 'Samuel Nizeyimana', timestamp: '2024-03-19 20:39:33', ip: '192.168.1.1', details: 'Successful login' },
    { id: 2, action: 'REGISTER', user: 'Terms Test User', timestamp: '2024-03-19 20:23:57', ip: '192.168.1.2', details: 'New user registration' },
    { id: 3, action: 'ROLE_CHANGE', user: 'Admin', timestamp: '2024-03-19 20:15:22', ip: '192.168.1.3', details: 'Changed user role to PROFESSIONAL' },
    { id: 4, action: 'PROJECT_CREATE', user: 'Sarah Wilson', timestamp: '2024-03-19 19:45:10', ip: '192.168.1.4', details: 'Created new project' },
    { id: 5, action: 'LOGIN_FAILED', user: 'Unknown', timestamp: '2024-03-19 19:30:45', ip: '192.168.1.5', details: 'Failed login attempt' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading logs...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>System Logs</h1>
        <p style={styles.subtitle}>Monitor all system activities</p>
      </div>

      <div style={styles.filters}>
        <select style={styles.filterSelect}>
          <option>All Actions</option>
          <option>LOGIN</option>
          <option>REGISTER</option>
          <option>ROLE_CHANGE</option>
          <option>PROJECT_CREATE</option>
        </select>
        <input type="date" style={styles.filterInput} />
        <button style={styles.exportButton}>Export Logs</button>
      </div>

      <div style={styles.logsContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableHeaderCell}>Timestamp</th>
              <th style={styles.tableHeaderCell}>Action</th>
              <th style={styles.tableHeaderCell}>User</th>
              <th style={styles.tableHeaderCell}>IP Address</th>
              <th style={styles.tableHeaderCell}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={styles.timestamp}>{log.timestamp}</div>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.actionBadge,
                    ...(log.action === 'LOGIN' && styles.actionLogin),
                    ...(log.action === 'REGISTER' && styles.actionRegister),
                    ...(log.action === 'ROLE_CHANGE' && styles.actionRoleChange),
                    ...(log.action === 'LOGIN_FAILED' && styles.actionLoginFailed)
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={styles.tableCell}>{log.user}</td>
                <td style={styles.tableCell}>{log.ip}</td>
                <td style={styles.tableCell}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    color: 'var(--text-muted)'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  filterInput: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px'
  },
  exportButton: {
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  logsContainer: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: 'var(--border-color)'
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-color)',
    borderBottom: '1px solid #262626'
  },
  tableRow: {
    borderBottom: '1px solid #1a1a1a'
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  timestamp: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'monospace'
  },
  actionBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase'
  },
  actionLogin: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e'
  },
  actionRegister: {
    background: 'rgba(0, 242, 255, 0.1)',
    color: '#00f2ff'
  },
  actionRoleChange: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  actionLoginFailed: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  }
};
