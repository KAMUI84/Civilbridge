import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { listingsService } from '../../services/listingsService';
import { regionsService } from '../../services/regionsService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const MotionDiv = motion.div;

const RWANDA_PROVINCES = {
  Kigali: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
};

function formatPrice(price, currency = 'RWF') {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

function containsText(source, needle) {
  return String(source || '').toLowerCase().includes(String(needle || '').toLowerCase());
}

function buildPriceRanges(items) {
  const prices = items
    .map((item) => Number(item.price))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (!prices.length) {
    return [{ id: 'all', label: 'All prices', min: null, max: null }];
  }

  const min = prices[0];
  const max = prices[prices.length - 1];

  if (min === max) {
    return [
      { id: 'all', label: 'All prices', min: null, max: null },
      { id: `${min}-${max}`, label: formatPrice(min), min, max },
    ];
  }

  const ranges = [{ id: 'all', label: 'All prices', min: null, max: null }];
  const bucketCount = Math.min(6, Math.max(3, Math.ceil(prices.length / 2)));
  const step = Math.max(1, Math.ceil((max - min) / bucketCount));

  for (let index = 0; index < bucketCount; index += 1) {
    const start = min + step * index;
    const end = index === bucketCount - 1 ? max : Math.min(max, start + step - 1);

    if (start > max) {
      break;
    }

    ranges.push({
      id: `${start}-${end}`,
      label: `${formatPrice(start)} - ${formatPrice(end)}`,
      min: start,
      max: end,
    });
  }

  return ranges;
}

function ListingSkeleton() {
  return (
    <div style={styles.propertyCard}>
      <div style={{ ...styles.propertyImage, ...styles.skeletonBlock }} />
      <div style={styles.propertyContent}>
        <div style={styles.skeletonLineWide} />
        <div style={styles.skeletonLine} />
        <div style={styles.skeletonLineShort} />
        <div style={styles.skeletonParagraph} />
        <div style={styles.skeletonActions}>
          <div style={{ ...styles.skeletonButton, ...styles.skeletonBlock }} />
          <div style={{ ...styles.skeletonButton, ...styles.skeletonBlock }} />
        </div>
      </div>
    </div>
  );
}

export default function PropertyMarketplace() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const [filters, setFilters] = useState({
    province: '',
    district: '',
    priceRange: 'all',
    searchTerm: '',
  });
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadRegions = async () => {
      try {
        const response = await regionsService.getAllRegions();
        if (!cancelled) {
          setRegions(Array.isArray(response?.regions) ? response.regions : []);
        }
      } catch {
        if (!cancelled) {
          setRegions([]);
        }
      }
    };

    loadRegions();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRegion = useMemo(() => (
    regions.find((region) => region.name === filters.province) || null
  ), [filters.province, regions]);

  const districtOptions = useMemo(() => (
    filters.province ? RWANDA_PROVINCES[filters.province] || [] : []
  ), [filters.province]);

  const loadMarketplace = useCallback(async () => {
    try {
      const response = await listingsService.getAll({
        page: 1,
        limit: 100,
        status: 'ACTIVE',
        search: filters.searchTerm || undefined,
        region: selectedRegion?.id || undefined,
      });

      setProperties(Array.isArray(response?.listings) ? response.listings : []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setProperties([]);
      setState({
        loading: false,
        error: error.message || 'Failed to load marketplace listings.',
      });
    }
  }, [filters.searchTerm, selectedRegion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMarketplace();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadMarketplace]);

  const priceRanges = useMemo(() => buildPriceRanges(properties), [properties]);
  const selectedPriceRangeId = useMemo(() => (
    priceRanges.some((range) => range.id === filters.priceRange) ? filters.priceRange : 'all'
  ), [filters.priceRange, priceRanges]);

  const filteredProperties = useMemo(() => {
    const selectedRange = priceRanges.find((range) => range.id === selectedPriceRangeId) || priceRanges[0];

    return properties.filter((property) => {
      const searchableText = [
        property.title,
        property.description,
        property.locationText,
        property.region?.name,
      ].join(' ');

      if (filters.province && !containsText(property.region?.name || property.locationText, filters.province)) {
        return false;
      }

      if (filters.district && !containsText(searchableText, filters.district)) {
        return false;
      }

      if (filters.searchTerm && !containsText(searchableText, filters.searchTerm)) {
        return false;
      }

      if (selectedRange?.min !== null || selectedRange?.max !== null) {
        const price = Number(property.price);
        if (!Number.isFinite(price)) {
          return false;
        }
        if (selectedRange.min !== null && price < selectedRange.min) {
          return false;
        }
        if (selectedRange.max !== null && price > selectedRange.max) {
          return false;
        }
      }

      return true;
    });
  }, [filters.district, filters.province, filters.searchTerm, priceRanges, properties, selectedPriceRangeId]);

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'province' || key === 'searchTerm') {
      setState((current) => ({ ...current, loading: true, error: '' }));
    }

    setFilters((current) => {
      if (key === 'province') {
        return { ...current, province: value, district: '', priceRange: 'all' };
      }
      return { ...current, [key]: value };
    });
  }, []);

  const isEmpty = !state.loading && !state.error && filteredProperties.length === 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Property Marketplace</h1>
        <p style={styles.subtitle}>Browse live listings across Rwanda with province, district, and budget-range filtering.</p>
      </div>

      <div style={styles.filtersSection}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Province</label>
            <select
              style={styles.filterSelect}
              value={filters.province}
              onChange={(event) => handleFilterChange('province', event.target.value)}
            >
              <option value="">All provinces</option>
              {Object.keys(RWANDA_PROVINCES).map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>District</label>
            <select
              style={styles.filterSelect}
              value={filters.district}
              onChange={(event) => handleFilterChange('district', event.target.value)}
              disabled={!filters.province}
            >
              <option value="">All districts</option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Price range</label>
            <select
              style={styles.filterSelect}
              value={selectedPriceRangeId}
              onChange={(event) => handleFilterChange('priceRange', event.target.value)}
            >
              {priceRanges.map((range) => (
                <option key={range.id} value={range.id}>{range.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search</label>
            <input
              type="text"
              style={styles.filterInput}
              value={filters.searchTerm}
              onChange={(event) => handleFilterChange('searchTerm', event.target.value)}
              placeholder="Search title, district, or location"
            />
          </div>
        </div>
      </div>

      <div style={styles.resultsSummary}>
        <p style={styles.resultsText}>Showing {filteredProperties.length} of {properties.length} live listings</p>
      </div>

      {state.error ? (
        <div style={styles.stateCard}>
          <h3 style={styles.stateTitle}>Marketplace unavailable</h3>
          <p style={styles.stateText}>{state.error}</p>
          <button type="button" style={styles.retryButton} onClick={loadMarketplace}>
            Retry
          </button>
        </div>
      ) : null}

      {state.loading ? (
        <div style={styles.propertiesGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ListingSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {isEmpty ? (
        <div style={styles.stateCard}>
          <h3 style={styles.stateTitle}>No listings found</h3>
          <p style={styles.stateText}>Try a different province, district, or price range to widen the search.</p>
        </div>
      ) : null}

      {!state.loading && !state.error ? (
        <div style={styles.propertiesGrid}>
          {filteredProperties.map((property, index) => {
            const imageUrl = getImageUrl(property.images?.[0]?.imageUrl);
            const location = property.locationText || property.region?.name || 'Location pending';
            const ownerName = property.owner?.fullName || 'CivilBridge listing owner';
            const districtMatch = districtOptions.find((district) => (
              containsText([property.locationText, property.title, property.description].join(' '), district)
            ));

            return (
              <MotionDiv
                key={property.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                whileHover={{ y: -4 }}
                style={styles.propertyCard}
              >
                <div style={styles.propertyImage}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={property.title} style={styles.propertyImageTag} />
                  ) : (
                    <div style={styles.propertyImagePlaceholder}>Listing image unavailable</div>
                  )}
                  <div style={styles.propertyTypeBadge}>{property.listingType || 'Listing'}</div>
                </div>

                <div style={styles.propertyContent}>
                  <h3 style={styles.propertyTitle}>{property.title}</h3>
                  <div style={styles.propertyLocation}>{districtMatch ? `${districtMatch}, ${property.region?.name || ''}` : location}</div>
                  <div style={styles.propertyPrice}>{formatPrice(property.price, property.currency || 'RWF')}</div>
                  <div style={styles.propertyMetaRow}>
                    <span>{property.sizeM2 ? `${property.sizeM2} m2` : 'Size on request'}</span>
                    <span>{property.bedrooms ? `${property.bedrooms} bed` : 'Layout open'}</span>
                    <span>{property.bathrooms ? `${property.bathrooms} bath` : 'Baths n/a'}</span>
                  </div>
                  <p style={styles.propertyDescription}>{property.description || 'No description has been added for this listing yet.'}</p>

                  <div style={styles.propertyFeatures}>
                    <span style={styles.featureTag}>{property.region?.name || 'Rwanda'}</span>
                    {districtMatch ? <span style={styles.featureTag}>{districtMatch}</span> : null}
                    {property.zoningInfo ? <span style={styles.featureTag}>{property.zoningInfo}</span> : null}
                  </div>

                  <div style={styles.propertyActions}>
                    <button
                      type="button"
                      style={styles.contactButton}
                      onClick={() => setSelectedProperty({ ...property, districtMatch, location, ownerName })}
                    >
                      Preview listing
                    </button>
                    <button
                      type="button"
                      style={styles.detailsButton}
                      onClick={() => navigate(`/marketplace/${property.id}`)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </MotionDiv>
            );
          })}
        </div>
      ) : null}

      {selectedProperty ? (
        <div style={styles.modalOverlay} onClick={() => setSelectedProperty(null)}>
          <MotionDiv
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Listing preview</h3>
              <button type="button" style={styles.modalClose} onClick={() => setSelectedProperty(null)}>
                x
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.propertySummary}>
                <h4 style={styles.propertySummaryTitle}>{selectedProperty.title}</h4>
                <p style={styles.propertySummaryLocation}>{selectedProperty.districtMatch ? `${selectedProperty.districtMatch}, ${selectedProperty.region?.name || ''}` : selectedProperty.location}</p>
                <p style={styles.propertySummaryPrice}>{formatPrice(selectedProperty.price, selectedProperty.currency || 'RWF')}</p>
              </div>

              <div style={styles.agentInfo}>
                <h4 style={styles.agentTitle}>Listing details</h4>
                <div style={styles.agentDetails}>
                  <p style={styles.agentName}><strong>Owner:</strong> {selectedProperty.ownerName}</p>
                  <p style={styles.agentPhone}><strong>Type:</strong> {selectedProperty.listingType || 'Listing'}</p>
                  <p style={styles.agentEmail}><strong>Location:</strong> {selectedProperty.location}</p>
                </div>
              </div>

              <div style={styles.contactNote}>
                <p style={styles.contactNoteText}>{selectedProperty.description || 'No extra description is available for this listing yet.'}</p>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.detailsButton}
                  onClick={() => {
                    setSelectedProperty(null);
                    navigate(`/marketplace/${selectedProperty.id}`);
                  }}
                >
                  Open listing
                </button>
              </div>
            </div>
          </MotionDiv>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--text-color)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
    maxWidth: '760px',
    margin: '0 auto',
  },
  filtersSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  filterSelect: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '10px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  filterInput: {
    padding: '12px 16px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '10px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  resultsSummary: {
    marginBottom: '20px',
  },
  resultsText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  propertiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  propertyCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    overflow: 'hidden',
  },
  propertyImage: {
    position: 'relative',
    height: '220px',
    background: 'var(--border-color)',
    overflow: 'hidden',
  },
  propertyImageTag: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px',
    padding: '0 20px',
    textAlign: 'center',
  },
  propertyTypeBadge: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'rgba(0, 242, 255, 0.16)',
    color: '#00f2ff',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  propertyContent: {
    padding: '20px',
  },
  propertyTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '8px',
  },
  propertyLocation: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '10px',
  },
  propertyPrice: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#00f2ff',
    marginBottom: '10px',
  },
  propertyMetaRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    color: 'var(--text-muted)',
    fontSize: '13px',
    marginBottom: '14px',
  },
  propertyDescription: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '16px',
  },
  propertyFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '18px',
  },
  featureTag: {
    fontSize: '12px',
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '5px 9px',
    borderRadius: '999px',
  },
  propertyActions: {
    display: 'flex',
    gap: '12px',
  },
  contactButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  detailsButton: {
    flex: 1,
    background: 'transparent',
    border: '1px solid #262626',
    borderRadius: '10px',
    padding: '12px 18px',
    color: 'var(--text-color)',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  stateCard: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '28px',
    background: 'rgba(255, 255, 255, 0.04)',
    textAlign: 'center',
    marginBottom: '24px',
  },
  stateTitle: {
    margin: '0 0 10px',
    color: 'var(--text-color)',
    fontSize: '20px',
  },
  stateText: {
    margin: '0 auto',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '560px',
  },
  retryButton: {
    marginTop: '18px',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    color: 'var(--bg-color)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.72)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '18px',
    padding: '24px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-color)',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  propertySummary: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
  },
  propertySummaryTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '8px',
  },
  propertySummaryLocation: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  propertySummaryPrice: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#00f2ff',
    margin: 0,
  },
  agentInfo: {
    padding: '16px',
    background: 'rgba(0, 242, 255, 0.08)',
    borderRadius: '12px',
  },
  agentTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '12px',
  },
  agentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  agentName: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0,
  },
  agentPhone: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0,
  },
  agentEmail: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0,
  },
  contactNote: {
    padding: '14px',
    background: 'rgba(245, 158, 11, 0.08)',
    borderRadius: '12px',
    border: '1px solid rgba(245, 158, 11, 0.18)',
  },
  contactNoteText: {
    fontSize: '13px',
    color: '#fbbf24',
    margin: 0,
    lineHeight: 1.6,
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
  },
  skeletonBlock: {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
  },
  skeletonLineWide: {
    height: '18px',
    width: '78%',
    borderRadius: '999px',
    marginBottom: '12px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonLine: {
    height: '14px',
    width: '52%',
    borderRadius: '999px',
    marginBottom: '10px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonLineShort: {
    height: '14px',
    width: '38%',
    borderRadius: '999px',
    marginBottom: '16px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonParagraph: {
    height: '62px',
    borderRadius: '14px',
    marginBottom: '18px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonActions: {
    display: 'flex',
    gap: '12px',
  },
  skeletonButton: {
    height: '42px',
    flex: 1,
    borderRadius: '10px',
  },
};
