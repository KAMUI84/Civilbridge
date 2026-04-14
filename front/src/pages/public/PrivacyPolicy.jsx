// Privacy Policy Page
import React from 'react';
import { Link } from 'react-router-dom';
import civilbridge from "/civilbridge.png";

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/" style={styles.logoLink}>
            <img src={civilbridge} alt="CivilBridge" style={styles.logo} />
          </Link>
        </div>
        
        <div style={styles.content}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
            <p style={styles.text}>
              We collect information you provide directly to us, such as when you create an account, register for a service, or contact us.
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Name and contact information</li>
              <li style={styles.listItem}>Account credentials</li>
              <li style={styles.listItem}>Professional information</li>
              <li style={styles.listItem}>Communication data</li>
            </ul>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. How We Use Your Information</h2>
            <p style={styles.text}>
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Process transactions and send related information</li>
              <li style={styles.listItem}>Provide customer support</li>
              <li style={styles.listItem}>Communicate with you about products, services, and events</li>
              <li style={styles.listItem}>Monitor and analyze trends and usage</li>
            </ul>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Information Sharing</h2>
            <p style={styles.text}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Data Security</h2>
            <p style={styles.text}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Data Retention</h2>
            <p style={styles.text}>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Your Rights</h2>
            <p style={styles.text}>
              You have the right to:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Access and update your personal information</li>
              <li style={styles.listItem}>Request deletion of your personal information</li>
              <li style={styles.listItem}>Opt-out of marketing communications</li>
              <li style={styles.listItem}>Request a copy of your data</li>
            </ul>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Cookies and Tracking</h2>
            <p style={styles.text}>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Children's Privacy</h2>
            <p style={styles.text}>
              Our service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. International Data Transfers</h2>
            <p style={styles.text}>
              Your personal information may be transferred to, and maintained on, computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>10. Changes to This Policy</h2>
            <p style={styles.text}>
              We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "last updated" date.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>
            <p style={styles.text}>
              If you have any questions about this Privacy Policy, please contact us:
              <br />
              Email: privacy@civilbridge.rw
              <br />
              Phone: +250 788 123 456
              <br />
              Address: Kigali, Rwanda
            </p>
          </div>
          
          <div style={styles.actions}>
            <Link to="/register" style={styles.backButton}>
              ← Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    color: '#0f172a'
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: 40
  },
  logoLink: {
    display: 'inline-block'
  },
  logo: {
    height: 40,
    width: 'auto'
  },
  content: {
    background: '#ffffff',
    border: '1px solid #e8eef5',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 16px 34px rgba(15,23,42,0.06)'
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8
  },
  lastUpdated: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 32
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#2563eb',
    marginBottom: 12
  },
  text: {
    lineHeight: 1.6,
    color: '#64748b',
    fontSize: 15,
    marginBottom: 16
  },
  list: {
    marginLeft: 20,
    color: '#64748b'
  },
  listItem: {
    marginBottom: 8,
    lineHeight: 1.5
  },
  actions: {
    marginTop: 40,
    textAlign: 'center'
  },
  backButton: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: 8,
    fontWeight: 600,
    transition: 'opacity 0.2s ease'
  }
};
