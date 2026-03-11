import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClientService';

export default function CatalogManagement() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    unitPrice: '',
    supplierId: '',
    specifications: '',
  });

  const categories = ['Cement', 'Steel', 'Bricks', 'Sand', 'Aggregate', 'Timber', 'Roofing', 'Plumbing', 'Electrical', 'Finishing'];

  useEffect(() => {
    fetchCatalog();
  }, []);

  async function fetchCatalog() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/estimator/catalog');
      setCatalog(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/estimator/catalog/${editing.id}`, {
          ...form,
          unitPrice: Number(form.unitPrice),
        });
      } else {
        await api.post('/api/estimator/catalog', {
          ...form,
          unitPrice: Number(form.unitPrice),
        });
      }
      setShowCreateForm(false);
      setEditing(null);
      setForm({ name: '', description: '', category: '', unit: '', unitPrice: '', supplierId: '', specifications: '' });
      fetchCatalog();
    } catch (err) {
      alert(err.message || 'Failed to save catalog item');
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      unitPrice: item.unitPrice?.toString() || '',
      supplierId: item.supplierId?.toString() || '',
      specifications: item.specifications || '',
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this catalog item?')) return;
    try {
      await api.delete(`/api/estimator/catalog/${id}`);
      setCatalog(catalog.filter(item => item.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete catalog item');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Catalog Management</h1>
          <p style={styles.subtitle}>Manage materials catalog for cost estimation.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={styles.btnPrimary}
        >
          + Add Item
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {/* Create/Edit Modal */}
      {showCreateForm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>{editing ? 'Edit Item' : 'Add Catalog Item'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={styles.input}
                    placeholder="e.g. Portland Cement"
                  />
                </div>
                <div>
                  <label style={styles.label}>Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Unit *</label>
                  <input
                    required
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    style={styles.input}
                    placeholder="e.g. bag, kg, m³"
                  />
                </div>
                <div>
                  <label style={styles.label}>Unit Price (RWF) *</label>
                  <input
                    required
                    type="number"
                    value={form.unitPrice}
                    onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                    style={styles.input}
                    placeholder="e.g. 12000"
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={styles.textarea}
                    rows={3}
                    placeholder="Brief description of the material..."
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Specifications</label>
                  <textarea
                    value={form.specifications}
                    onChange={e => setForm(f => ({ ...f, specifications: e.target.value }))}
                    style={styles.textarea}
                    rows={2}
                    placeholder="Technical specifications..."
                  />
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => { setShowCreateForm(false); setEditing(null); }} style={styles.btnOutline}>
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {editing ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Loading catalog...</div>
        ) : catalog.length === 0 ? (
          <div style={styles.loading}>No catalog items found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Supplier</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map(item => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.itemName}>{item.name}</div>
                      {item.description && (
                        <div style={styles.itemDesc}>{item.description}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryPill}>{item.category}</span>
                    </td>
                    <td style={styles.td}>{item.unit}</td>
                    <td style={styles.td}>
                      <div style={styles.price}>{item.unitPrice?.toLocaleString()} RWF</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.supplier}>{item.supplier?.name || '—'}</div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actions}>
                        <button onClick={() => handleEdit(item)} style={{ ...styles.btnOutline, color: '#2563eb', borderColor: '#bfdbfe' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} style={{ ...styles.btnOutline, color: '#dc2626', borderColor: '#fecaca' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1200, paddingBottom: 40 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: "#0c1220", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", color: "#64708a", fontSize: 14 },
  
  btnPrimary: {
    padding: "10px 16px", borderRadius: 8, border: "none", background: "#0c1220", color: "#fff",
    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "0.2s"
  },
  btnOutline: {
    padding: "6px 12px", borderRadius: 6, border: "1px solid", background: "#fff",
    fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "0.2s"
  },
  error: { padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 20 },
  loading: { padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 15 },

  modalBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000
  },
  modalCard: {
    background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto'
  },
  modalTitle: { margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#0c1220' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 },
  select: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' },
  textarea: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' },
  formActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 },

  tableCard: {
    background: "#fff", borderRadius: 12, border: "1px solid #f0f0f4", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", overflow: 'hidden'
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 },
  th: { padding: "14px 20px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600, fontSize: 13, background: '#f8fafc' },
  td: { padding: "16px 20px", borderBottom: "1px solid #f3f4f6", color: "#1f2937", verticalAlign: 'middle' },
  tr: { transition: "background 0.2s" },

  itemName: { fontWeight: 700, color: '#0c1220', fontSize: 15 },
  itemDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  categoryPill: { background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, display: 'inline-block' },
  price: { fontWeight: 700, color: '#047857' },
  supplier: { fontSize: 14, color: '#374151', fontWeight: 600 },

  actions: { display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' },
};
