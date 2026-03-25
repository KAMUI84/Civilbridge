// Property Marketplace System for Rwanda
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PropertyMarketplace() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    province: '',
    district: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    searchTerm: ''
  });
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Rwanda provinces and districts
  const provinces = {
    'Kigali': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Northern': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
    'Southern': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyruwe'],
    'Eastern': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
    'Western': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rutsiro']
  };

  // Mock property data
  const mockProperties = [
    {
      id: 1,
      title: 'Modern Residential Plot - Kigali',
      type: 'residential',
      province: 'Kigali',
      district: 'Gasabo',
      price: 15000000,
      size: '500 sqm',
      description: 'Prime residential land in Kigali with excellent access to infrastructure',
      images: ['property1.jpg'],
      features: ['Water connection', 'Electricity nearby', 'Road access', 'Fenced'],
      agent: {
        name: 'John Mugisha',
        phone: '+250788123456',
        email: 'john@property.rw'
      },
      createdAt: '2024-03-15',
      status: 'available'
    },
    {
      id: 2,
      title: 'Commercial Space - Remera',
      type: 'commercial',
      province: 'Kigali',
      district: 'Kicukiro',
      price: 25000000,
      size: '300 sqm',
      description: 'Strategic commercial location perfect for retail or office space',
      images: ['property2.jpg'],
      features: ['High traffic area', 'Parking available', 'Security', 'Modern building'],
      agent: {
        name: 'Sarah Uwimana',
        phone: '+250787987654',
        email: 'sarah@realestate.rw'
      },
      createdAt: '2024-03-14',
      status: 'available'
    },
    {
      id: 3,
      title: 'Agricultural Land - Eastern Province',
      type: 'agricultural',
      province: 'Eastern',
      district: 'Nyagatare',
      price: 8000000,
      size: '2000 sqm',
      description: 'Fertile agricultural land suitable for various crops',
      images: ['property3.jpg'],
      features: ['Fertile soil', 'Water source nearby', 'Road access', 'Climate suitable'],
      agent: {
        name: 'Joseph Niyonzima',
        phone: '+250785456789',
        email: 'joseph@agriland.rw'
      },
      createdAt: '2024-03-13',
      status: 'available'
    },
    {
      id: 4,
      title: 'Industrial Plot - Rwamagana',
      type: 'industrial',
      province: 'Eastern',
      district: 'Rwamagana',
      price: 35000000,
      size: '1000 sqm',
      description: 'Industrial zone with excellent infrastructure connections',
      images: ['property4.jpg'],
      features: ['Industrial zone', 'Power connection', 'Road access', 'Zoning approved'],
      agent: {
        name: 'Eric Munyaneza',
        phone: '+250784321098',
        email: 'eric@industrial.rw'
      },
      createdAt: '2024-03-12',
      status: 'available'
    }
  ];

  useEffect(() => {
    // Simulate API call with error handling
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // In production, this would be a real API call
        // const response = await fetch('/api/properties');
        // const data = await response.json();
        
        // For now, use mock data
        setTimeout(() => {
          setProperties(mockProperties);
          setFilteredProperties(mockProperties);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setLoading(false);
        // Show error state but still display mock data
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = properties.filter(property => {
      if (filters.province && property.province !== filters.province) return false;
      if (filters.district && property.district !== filters.district) return false;
      if (filters.propertyType && property.type !== filters.propertyType) return false;
      if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return property.title.toLowerCase().includes(searchLower) ||
               property.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
    setFilteredProperties(filtered);
  }, [filters, properties]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleContactAgent = (property) => {
    setSelectedProperty(property);
    setShowContactModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Property Marketplace</h1>
        <p style={styles.subtitle}>Discover properties across Rwanda</p>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Province</label>
            <select
              style={styles.filterSelect}
              value={filters.province}
              onChange={(e) => {
                handleFilterChange('province', e.target.value);
                handleFilterChange('district', ''); // Reset district when province changes
              }}
            >
              <option value="">All Provinces</option>
              {Object.keys(provinces).map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>District</label>
            <select
              style={styles.filterSelect}
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              disabled={!filters.province}
            >
              <option value="">All Districts</option>
              {filters.province && provinces[filters.province].map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Property Type</label>
            <select
              style={styles.filterSelect}
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Min Price (RWF)</label>
            <input
              type="number"
              style={styles.filterInput}
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Max Price (RWF)</label>
            <input
              type="number"
              style={styles.filterInput}
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="No limit"
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search</label>
            <input
              type="text"
              style={styles.filterInput}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search properties..."
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={styles.resultsSummary}>
        <p style={styles.resultsText}>
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
      </div>

      {/* Properties Grid */}
      <div style={styles.propertiesGrid}>
        {filteredProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ y: -5 }}
            style={styles.propertyCard}
          >
            <div style={styles.propertyImage}>
              <div style={styles.propertyImagePlaceholder}>
                🏠 Property Image
              </div>
              <div style={styles.propertyTypeBadge}>
                {property.type}
              </div>
            </div>

            <div style={styles.propertyContent}>
              <h3 style={styles.propertyTitle}>{property.title}</h3>
              <div style={styles.propertyLocation}>
                📍 {property.district}, {property.province}
              </div>
              <div style={styles.propertyPrice}>
                {formatPrice(property.price)}
              </div>
              <div style={styles.propertySize}>
                Size: {property.size}
              </div>
              <p style={styles.propertyDescription}>
                {property.description}
              </p>
              
              <div style={styles.propertyFeatures}>
                {property.features.map((feature, idx) => (
                  <span key={idx} style={styles.featureTag}>
                    ✓ {feature}
                  </span>
                ))}
              </div>

              <div style={styles.propertyActions}>
                <button
                  style={styles.contactButton}
                  onClick={() => handleContactAgent(property)}
                >
                  Contact Agent
                </button>
                <button
                  style={styles.detailsButton}
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedProperty && (
        <div style={styles.modalOverlay}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Contact Property Agent</h3>
              <button
                style={styles.modalClose}
                onClick={() => setShowContactModal(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.propertySummary}>
                <h4 style={styles.propertySummaryTitle}>{selectedProperty.title}</h4>
                <p style={styles.propertySummaryLocation}>
                  📍 {selectedProperty.district}, {selectedProperty.province}
                </p>
                <p style={styles.propertySummaryPrice}>
                  {formatPrice(selectedProperty.price)}
                </p>
              </div>

              <div style={styles.agentInfo}>
                <h4 style={styles.agentTitle}>Agent Information</h4>
                <div style={styles.agentDetails}>
                  <p style={styles.agentName}>
                    <strong>Name:</strong> {selectedProperty.agent.name}
                  </p>
                  <p style={styles.agentPhone}>
                    <strong>Phone:</strong> {selectedProperty.agent.phone}
                  </p>
                  <p style={styles.agentEmail}>
                    <strong>Email:</strong> {selectedProperty.agent.email}
                  </p>
                </div>
              </div>

              <div style={styles.contactNote}>
                <p style={styles.contactNoteText}>
                  <strong>Note:</strong> Exact property location will be shared after initial contact 
                  to protect privacy and ensure serious inquiries only.
                </p>
              </div>

              <div style={styles.modalActions}>
                <button
                  style={styles.callButton}
                  onClick={() => window.open(`tel:${selectedProperty.agent.phone}`)}
                >
                  📞 Call Agent
                </button>
                <button
                  style={styles.emailButton}
                  onClick={() => window.open(`mailto:${selectedProperty.agent.email}`)}
                >
                  📧 Send Email
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  // Header
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-muted)'
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: 'var(--text-muted)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #262626',
    borderTop: '4px solid #00f2ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },

  // Filters
  filtersSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-muted)'
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

  // Results
  resultsSummary: {
    marginBottom: '24px'
  },
  resultsText: {
    color: 'var(--text-muted)',
    fontSize: '14px'
  },

  // Properties Grid
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  propertyCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  propertyImage: {
    position: 'relative',
    height: '200px',
    background: 'var(--border-color)'
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '18px'
  },
  propertyTypeBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0, 242, 255, 0.2)',
    color: '#00f2ff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  propertyContent: {
    padding: '20px'
  },
  propertyTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  propertyLocation: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '12px'
  },
  propertyPrice: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#00f2ff',
    marginBottom: '8px'
  },
  propertySize: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '12px'
  },
  propertyDescription: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    marginBottom: '16px'
  },
  propertyFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px'
  },
  featureTag: {
    fontSize: '12px',
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  propertyActions: {
    display: 'flex',
    gap: '12px'
  },
  contactButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  detailsButton: {
    flex: 1,
    background: 'transparent',
    border: '1px solid #262626',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'var(--text-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-color)',
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  propertySummary: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px'
  },
  propertySummaryTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '8px'
  },
  propertySummaryLocation: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '4px'
  },
  propertySummaryPrice: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#00f2ff'
  },
  agentInfo: {
    padding: '16px',
    background: 'rgba(0, 242, 255, 0.1)',
    borderRadius: '8px'
  },
  agentTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '12px'
  },
  agentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  agentName: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0
  },
  agentPhone: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0
  },
  agentEmail: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0
  },
  contactNote: {
    padding: '12px',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },
  contactNoteText: {
    fontSize: '13px',
    color: '#f59e0b',
    margin: 0
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  callButton: {
    flex: 1,
    background: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  emailButton: {
    flex: 1,
    background: '#00f2ff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
