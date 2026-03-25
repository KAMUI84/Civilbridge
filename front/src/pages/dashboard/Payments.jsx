// Advanced Payment Processing System
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Payments() {
  const { dashboardConfig } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Mock transactions data
  const mockTransactions = [
    {
      id: 1,
      type: 'payment',
      amount: 5000,
      currency: 'USD',
      status: 'completed',
      client: 'John Doe',
      project: 'Bridge Design Project',
      method: 'credit_card',
      date: '2024-03-19',
      time: '14:30',
      transactionId: 'TXN_001',
      description: 'Project milestone payment'
    },
    {
      id: 2,
      type: 'payment',
      amount: 3000,
      currency: 'USD',
      status: 'pending',
      client: 'ABC Corp',
      project: 'Road Construction',
      method: 'bank_transfer',
      date: '2024-03-18',
      time: '10:15',
      transactionId: 'TXN_002',
      description: 'Initial project payment'
    },
    {
      id: 3,
      type: 'refund',
      amount: 500,
      currency: 'USD',
      status: 'completed',
      client: 'City Council',
      project: 'Infrastructure Audit',
      method: 'credit_card',
      date: '2024-03-17',
      time: '16:45',
      transactionId: 'TXN_003',
      description: 'Partial refund for overcharge'
    },
    {
      id: 4,
      type: 'payment',
      amount: 12000,
      currency: 'USD',
      status: 'failed',
      client: 'David Chen',
      project: 'Bridge Design Project',
      method: 'paypal',
      date: '2024-03-16',
      time: '09:20',
      transactionId: 'TXN_004',
      description: 'Final project payment'
    }
  ];

  // Mock invoices data
  const mockInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      client: 'John Doe',
      project: 'Bridge Design Project',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-03-25',
      issuedDate: '2024-03-15',
      items: [
        { description: 'Design Phase', quantity: 1, rate: 3000, amount: 3000 },
        { description: 'Consultation Hours', quantity: 20, rate: 100, amount: 2000 }
      ]
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      client: 'ABC Corp',
      project: 'Road Construction',
      amount: 12000,
      status: 'pending',
      dueDate: '2024-03-30',
      issuedDate: '2024-03-18',
      items: [
        { description: 'Site Preparation', quantity: 1, rate: 5000, amount: 5000 },
        { description: 'Material Costs', quantity: 1, rate: 7000, amount: 7000 }
      ]
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      client: 'City Council',
      project: 'Infrastructure Audit',
      amount: 8000,
      status: 'overdue',
      dueDate: '2024-03-10',
      issuedDate: '2024-03-01',
      items: [
        { description: 'Audit Services', quantity: 1, rate: 8000, amount: 8000 }
      ]
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setTransactions(mockTransactions);
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#22c55e',
      'pending': '#f59e0b',
      'failed': '#ef4444',
      'paid': '#22c55e',
      'overdue': '#ef4444',
      'draft': 'var(--text-muted)'
    };
    return colors[status] || 'var(--text-muted)';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'completed': 'Completed',
      'pending': 'Pending',
      'failed': 'Failed',
      'paid': 'Paid',
      'overdue': 'Overdue',
      'draft': 'Draft'
    };
    return labels[status] || status;
  };

  const getMethodIcon = (method) => {
    const icons = {
      'credit_card': '💳',
      'bank_transfer': '🏦',
      'paypal': '🅿️',
      'cash': '💵',
      'check': '📋'
    };
    return icons[method] || '💳';
  };

  const handleCreateInvoice = (invoiceData) => {
    const newInvoice = {
      ...invoiceData,
      id: invoices.length + 1,
      invoiceNumber: `INV-2024-00${invoices.length + 1}`,
      status: 'draft',
      issuedDate: new Date().toISOString().split('T')[0]
    };
    setInvoices([...invoices, newInvoice]);
    setShowCreateInvoice(false);
  };

  const totalRevenue = transactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.type === 'payment' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return <div style={styles.loading}>Loading payment data...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Payment Processing</h1>
        <p style={styles.subtitle}>Manage transactions, invoices, and payment methods</p>
      </div>

      {/* Revenue Overview */}
      <div style={styles.revenueOverview}>
        <div style={styles.revenueCard}>
          <h3 style={styles.revenueTitle}>Total Revenue</h3>
          <div style={styles.revenueAmount}>${totalRevenue.toLocaleString()}</div>
          <div style={styles.revenueSubtitle}>This month</div>
        </div>
        <div style={styles.revenueCard}>
          <h3 style={styles.revenueTitle}>Pending</h3>
          <div style={styles.revenueAmount}>${pendingAmount.toLocaleString()}</div>
          <div style={styles.revenueSubtitle}>Awaiting confirmation</div>
        </div>
        <div style={styles.revenueCard}>
          <h3 style={styles.revenueTitle}>Transactions</h3>
          <div style={styles.revenueAmount}>{transactions.length}</div>
          <div style={styles.revenueSubtitle}>Total processed</div>
        </div>
        <div style={styles.revenueCard}>
          <h3 style={styles.revenueTitle}>Success Rate</h3>
          <div style={styles.revenueAmount}>92%</div>
          <div style={styles.revenueSubtitle}>Payment success</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'transactions' && styles.tabActive)
          }}
          onClick={() => setActiveTab('transactions')}
        >
          💳 Transactions
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'invoices' && styles.tabActive)
          }}
          onClick={() => setActiveTab('invoices')}
        >
          📄 Invoices
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'payment-methods' && styles.tabActive)
          }}
          onClick={() => setActiveTab('payment-methods')}
        >
          💰 Payment Methods
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'analytics' && styles.tabActive)
          }}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Transaction History</h3>
            <button style={styles.exportButton}>Export CSV</button>
          </div>
          
          <div style={styles.transactionList}>
            {transactions.map(transaction => (
              <div key={transaction.id} style={styles.transactionItem}>
                <div style={styles.transactionIcon}>
                  {getMethodIcon(transaction.method)}
                </div>
                <div style={styles.transactionInfo}>
                  <div style={styles.transactionHeader}>
                    <h4 style={styles.transactionTitle}>
                      {transaction.type === 'payment' ? 'Payment' : 'Refund'} - {transaction.description}
                    </h4>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(transaction.status)
                    }}>
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                  <div style={styles.transactionMeta}>
                    <span style={styles.transactionClient}>{transaction.client}</span>
                    <span style={styles.transactionProject}>{transaction.project}</span>
                    <span style={styles.transactionId}>ID: {transaction.transactionId}</span>
                    <span style={styles.transactionDate}>{transaction.date} at {transaction.time}</span>
                  </div>
                </div>
                <div style={styles.transactionAmount}>
                  <div style={{
                    ...styles.amount,
                    ...(transaction.type === 'refund' && styles.refundAmount)
                  }}>
                    {transaction.type === 'refund' ? '-' : '+'}${transaction.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Invoice Management</h3>
            <button
              onClick={() => setShowCreateInvoice(true)}
              style={styles.createButton}
            >
              + Create Invoice
            </button>
          </div>
          
          <div style={styles.invoiceList}>
            {invoices.map(invoice => (
              <div key={invoice.id} style={styles.invoiceItem}>
                <div style={styles.invoiceHeader}>
                  <div>
                    <h4 style={styles.invoiceNumber}>{invoice.invoiceNumber}</h4>
                    <div style={styles.invoiceMeta}>
                      <span style={styles.invoiceClient}>{invoice.client}</span>
                      <span style={styles.invoiceProject}>{invoice.project}</span>
                    </div>
                  </div>
                  <div style={styles.invoiceActions}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(invoice.status)
                    }}>
                      {getStatusLabel(invoice.status)}
                    </span>
                    <button style={styles.actionButton}>View</button>
                    <button style={styles.actionButton}>Send</button>
                  </div>
                </div>
                
                <div style={styles.invoiceDetails}>
                  <div style={styles.invoiceAmount}>${invoice.amount.toLocaleString()}</div>
                  <div style={styles.invoiceDates}>
                    <div style={styles.invoiceDate}>
                      <span style={styles.dateLabel}>Issued:</span>
                      <span style={styles.dateValue}>{invoice.issuedDate}</span>
                    </div>
                    <div style={styles.invoiceDate}>
                      <span style={styles.dateLabel}>Due:</span>
                      <span style={styles.dateValue}>{invoice.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Payment Methods</h3>
            <button style={styles.createButton}>+ Add Method</button>
          </div>
          
          <div style={styles.paymentMethods}>
            <div style={styles.paymentMethod}>
              <div style={styles.paymentMethodIcon}>💳</div>
              <div style={styles.paymentMethodInfo}>
                <h4 style={styles.paymentMethodTitle}>Credit Card</h4>
                <p style={styles.paymentMethodDescription}>Visa, Mastercard, American Express</p>
                <div style={styles.paymentMethodStats}>
                  <span style={styles.stat}>124 transactions</span>
                  <span style={styles.stat}>98% success rate</span>
                </div>
              </div>
              <div style={styles.paymentMethodActions}>
                <button style={styles.actionButton}>Configure</button>
              </div>
            </div>
            
            <div style={styles.paymentMethod}>
              <div style={styles.paymentMethodIcon}>🏦</div>
              <div style={styles.paymentMethodInfo}>
                <h4 style={styles.paymentMethodTitle}>Bank Transfer</h4>
                <p style={styles.paymentMethodDescription}>Direct bank transfers and ACH</p>
                <div style={styles.paymentMethodStats}>
                  <span style={styles.stat}>67 transactions</span>
                  <span style={styles.stat}>95% success rate</span>
                </div>
              </div>
              <div style={styles.paymentMethodActions}>
                <button style={styles.actionButton}>Configure</button>
              </div>
            </div>
            
            <div style={styles.paymentMethod}>
              <div style={styles.paymentMethodIcon}>🅿️</div>
              <div style={styles.paymentMethodInfo}>
                <h4 style={styles.paymentMethodTitle}>PayPal</h4>
                <p style={styles.paymentMethodDescription}>PayPal and digital wallets</p>
                <div style={styles.paymentMethodStats}>
                  <span style={styles.stat}>45 transactions</span>
                  <span style={styles.stat}>92% success rate</span>
                </div>
              </div>
              <div style={styles.paymentMethodActions}>
                <button style={styles.actionButton}>Configure</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Payment Analytics</h3>
            <select style={styles.dateFilter}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
          </div>
          
          <div style={styles.analyticsGrid}>
            <div style={styles.chartCard}>
              <h4 style={styles.chartTitle}>Revenue Trend</h4>
              <div style={styles.chartPlaceholder}>
                📈 Revenue chart would go here
              </div>
            </div>
            <div style={styles.chartCard}>
              <h4 style={styles.chartTitle}>Payment Methods</h4>
              <div style={styles.chartPlaceholder}>
                🍩 Payment methods pie chart
              </div>
            </div>
            <div style={styles.chartCard}>
              <h4 style={styles.chartTitle}>Success Rate</h4>
              <div style={styles.chartPlaceholder}>
                📊 Success rate chart
              </div>
            </div>
            <div style={styles.chartCard}>
              <h4 style={styles.chartTitle}>Top Clients</h4>
              <div style={styles.chartPlaceholder}>
                🏆 Top clients list
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <CreateInvoiceModal
          onClose={() => setShowCreateInvoice(false)}
          onSave={handleCreateInvoice}
        />
      )}
    </div>
  );
}

// Create Invoice Modal Component
function CreateInvoiceModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    dueDate: '',
    notes: ''
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value;
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: getTotalAmount(),
      items: formData.items.filter(item => item.description)
    });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>Create Invoice</h3>
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                style={styles.formInput}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Project</label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                style={styles.formInput}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              style={styles.formInput}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Invoice Items</label>
            <div style={styles.itemsList}>
              {formData.items.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    style={styles.itemInput}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    style={styles.itemInputSmall}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    style={styles.itemInputSmall}
                    required
                  />
                  <div style={styles.itemAmount}>
                    ${item.amount.toFixed(2)}
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      style={styles.removeButton}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddItem} style={styles.addButton}>
              + Add Item
            </button>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={styles.formTextarea}
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div style={styles.totalSection}>
            <div style={styles.totalLabel}>Total Amount:</div>
            <div style={styles.totalAmount}>${getTotalAmount().toFixed(2)}</div>
          </div>

          <div style={styles.modalActions}>
            <button type="submit" style={styles.saveButton}>Create Invoice</button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '24px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '18px',
    color: 'var(--text-muted)'
  }
};
