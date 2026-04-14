// Terms & Conditions Page
import React from 'react';
import { Link } from 'react-router-dom';
import civilbridge from "/civilbridge.png";

export default function TermsAndConditions() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/" style={styles.logoLink}>
            <img src={civilbridge} alt="CivilBridge" style={styles.logo} />
          </Link>
        </div>
        
        <div style={styles.content}>
          <h1 style={styles.title}>Terms & Conditions</h1>
          <p style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p style={styles.text}>
              By accessing and using CivilBridge, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Use License</h2>
            <p style={styles.text}>
              Permission is granted to temporarily download one copy of CivilBridge for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. User Accounts</h2>
            <p style={styles.text}>
              You are responsible for safeguarding the password and for all activities that occur under your password. You agree to notify CivilBridge immediately of any unauthorized use of your account.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Privacy Policy</h2>
            <p style={styles.text}>
              Your use of CivilBridge is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Prohibited Uses</h2>
            <p style={styles.text}>
              You may not use CivilBridge for any illegal or unauthorized purpose. You may not use the Site in any way that could damage, disable, or impair the Site.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Intellectual Property</h2>
            <p style={styles.text}>
              All content included on CivilBridge, such as text, graphics, logos, images, is the property of CivilBridge and protected by intellectual property laws.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Limitation of Liability</h2>
            <p style={styles.text}>
              In no event shall CivilBridge, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Termination</h2>
            <p style={styles.text}>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. Governing Law</h2>
            <p style={styles.text}>
              These Terms shall be interpreted and governed by the laws of Rwanda, without regard to its conflict of law provisions.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>10. Changes to Terms</h2>
            <p style={styles.text}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </div>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>
            <p style={styles.text}>
              If you have any questions about these Terms, please contact us at:
              <br />
              Email: legal@civilbridge.rw
              <br />
              Phone: +250 788 123 456
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
    fontSize: 15
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
