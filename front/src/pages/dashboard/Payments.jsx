import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/apiClientService';
import { SkeletonRow, SkeletonStats } from '../../components/common/Skeleton';
import SEO from '../../components/seo/SEO';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const MotionDiv = motion.div;

// ── Status helpers ──────────────────────────────────────────────────────────
const STATUS_COLOR = {
  CONFIRMED:       '#22c55e',
  RELEASED:        '#22c55e',
  INITIATED:       '#3b82f6',
  PENDING:         '#f59e0b',
  PROCESSING:      '#f59e0b',
  ESCROW_HELD:     '#8b5cf6',
  RELEASE_PENDING: '#8b5cf6',
  REFUND_PENDING:  '#f97316',
  REFUNDED:        '#6b7280',
  FAILED:          '#ef4444',
  CANCELLED:       '#ef4444',
};

const PROVIDER_ICON = {
  MTN_MOMO:     '📱',
  AIRTEL_MONEY: '📲',
  STRIPE:       '💳',
  MANUAL:       '🏦',
};

const TERMINAL = new Set(['CONFIRMED', 'RELEASED', 'FAILED', 'CANCELLED', 'REFUNDED']);

function fmtAmount(amount, currency) {
  const n = Number(amount);
  return isNaN(n) ? '—' : `${currency || 'RWF'} ${n.toLocaleString()}`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Invoice download ────────────────────────────────────────────────────────
async function downloadInvoice(transactionId) {
  const res = await fetch(`${BASE_URL}/api/payments/invoice/${transactionId}`, { credentials: 'include' });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Invoice not available'); }
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `invoice-${transactionId}.pdf` });
  a.click();
  URL.revokeObjectURL(url);
}

// ── Polling hook ─────────────────────────────────────────────────────────────
function usePaymentPolling(transactionId, onTerminal) {
  const [polledStatus, setPolledStatus] = useState(null);
  const timer = useRef(null);
  const onTerminalRef = useRef(onTerminal);

  useEffect(() => {
    onTerminalRef.current = onTerminal;
  }, [onTerminal]);

  useEffect(() => {
    if (!transactionId) return;
    let active = true;

    const poll = async () => {
      try {
        const data = await api.get(`/api/payments/status/${transactionId}`);
        const status = data?.status || data?.transaction?.status;
        if (!active) return;
        setPolledStatus(status);
        if (TERMINAL.has(status)) { onTerminalRef.current?.(status); return; }
        timer.current = setTimeout(poll, 3000);
      } catch { if (active) timer.current = setTimeout(poll, 5000); }
    };

    poll();
    return () => { active = false; clearTimeout(timer.current); };
  }, [transactionId]);

  return polledStatus;
}

// ── Status stepper ──────────────────────────────────────────────────────────
const STEPS = ['INITIATED', 'PROCESSING', 'CONFIRMED'];

function PaymentStepper({ currentStatus }) {
  const failed = ['FAILED', 'CANCELLED'].includes(currentStatus);
  const stepIdx = failed ? -1 : STEPS.indexOf(currentStatus);

  return (
    <div style={{ margin: '24px 0', padding: '20px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'center' }}>
        {STEPS.map((step, idx) => {
          const done   = !failed && stepIdx >= idx;
          const active = !failed && stepIdx === idx;
          const color  = failed ? '#ef4444' : done ? '#22c55e' : '#374151';
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <motion.div
                  animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                  transition={{ repeat: active ? Infinity : 0, duration: 1.2 }}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: done ? color : 'transparent',
                    border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: done ? '#fff' : color, fontWeight: 700,
                  }}
                >
                  {done ? '✓' : idx + 1}
                </motion.div>
                <span style={{ fontSize: 11, color: done ? '#d1d5db' : '#6b7280', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: done && stepIdx > idx ? '#22c55e' : '#374151', margin: '0 8px 18px' }} />
              )}
            </div>
          );
        })}
      </div>
      {failed && (
        <div style={{ textAlign: 'center', marginTop: 12, color: '#ef4444', fontSize: 14, fontWeight: 600 }}>
          Payment failed or cancelled
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [state,        setState]        = useState({ loading: true, error: '' });
  const [activeTab,    setActiveTab]    = useState('transactions');
  const [downloading,  setDownloading]  = useState(null);
  const [pollingId,    setPollingId]    = useState(null); // tx being polled after initiation

  const loadHistory = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const data = await api.get('/api/payments/history');
      setTransactions(data?.data ?? data?.transactions ?? []);
      setState({ loading: false, error: '' });
    } catch (e) {
      setState({ loading: false, error: e.message || 'Failed to load payment history' });
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const totalRevenue = transactions.filter(t => ['CONFIRMED','RELEASED'].includes(t.status)).reduce((s,t) => s+Number(t.amount||0),0);
  const pendingAmount= transactions.filter(t => ['PENDING','INITIATED','PROCESSING','ESCROW_HELD'].includes(t.status)).reduce((s,t) => s+Number(t.amount||0),0);
  const successRate  = transactions.length ? Math.round(transactions.filter(t=>['CONFIRMED','RELEASED'].includes(t.status)).length/transactions.length*100) : 0;
  const invoices     = transactions.filter(t => t.invoiceNumber);

  const handleDownload = async (txId) => {
    setDownloading(txId);
    try { await downloadInvoice(txId); } catch (e) { alert(e.message); } finally { setDownloading(null); }
  };

  const onPaymentInitiated = (txId) => {
    setPollingId(txId);
    setActiveTab('status');
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div style={s.container}>
        <SEO title="Payments" noindex />
        <div style={s.header}><div style={{ fontWeight: 700, fontSize: 24 }}>Payment Processing</div></div>
        <SkeletonStats />
        <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
          {Array.from({length:5}).map((_,i)=><SkeletonRow key={i}/>)}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (state.error) {
    return (
      <div style={{ ...s.loading, flexDirection: 'column', gap: 12 }}>
        <SEO title="Payments" noindex />
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ color: '#ef4444', fontWeight: 600 }}>Failed to load payment history</div>
        <div style={{ color: '#9ca3af', fontSize: 14 }}>{state.error}</div>
        <button style={s.actionButton} onClick={loadHistory}>Retry</button>
      </div>
    );
  }

  const TABS = [
    { id: 'transactions', label: '💳 Transactions' },
    { id: 'invoices',     label: '📄 Invoices' },
    { id: 'initiate',     label: '🚀 New Payment' },
    ...(pollingId ? [{ id: 'status', label: '⏳ Payment Status' }] : []),
  ];

  return (
    <div style={s.container}>
      <SEO title="Payments" noindex />

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>Payment Processing</h1>
        <p style={s.subtitle}>Manage transactions, invoices, and payment methods</p>
      </div>

      {/* Overview cards */}
      <div style={s.revenueOverview}>
        {[
          { label: 'Total Revenue',   value: fmtAmount(totalRevenue,'RWF'),   sub: 'Confirmed payments' },
          { label: 'Pending',         value: fmtAmount(pendingAmount,'RWF'),  sub: 'Awaiting confirmation' },
          { label: 'Transactions',    value: transactions.length,              sub: 'Total processed' },
          { label: 'Success Rate',    value: `${successRate}%`,               sub: 'Confirmed / total' },
        ].map(({ label, value, sub }) => (
          <MotionDiv key={label} style={s.revenueCard} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <h3 style={s.revenueTitle}>{label}</h3>
            <div style={s.revenueAmount}>{value}</div>
            <div style={s.revenueSubtitle}>{sub}</div>
          </MotionDiv>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(({ id, label }) => (
          <button key={id} style={{ ...s.tab, ...(activeTab===id && s.tabActive) }} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Transactions ──────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div style={s.tabContent}>
          <h3 style={s.sectionTitle}>Transaction History</h3>
          {transactions.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No transactions yet</div>
              <div style={{ fontSize: 14, color: '#9ca3af' }}>Start a payment to see your history here.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 540, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {transactions.map((tx) => (
                  <MotionDiv key={tx.id} style={s.txItem} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={s.txIcon}>{PROVIDER_ICON[tx.provider] ?? '💳'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-color, #fff)' }}>
                          {tx.serviceType?.replace(/_/g,' ')} {tx.description ? `— ${tx.description}` : ''}
                        </h4>
                        <span style={{ ...s.badge, background: STATUS_COLOR[tx.status]??'#6b7280' }}>{tx.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#9ca3af' }}>
                        <span style={{ fontFamily: 'monospace' }}>Ref: {tx.reference ?? tx.invoiceNumber ?? tx.id}</span>
                        <span>{fmtDate(tx.createdAt)}</span>
                        <span>{tx.provider}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-color, #fff)' }}>{fmtAmount(tx.amount, tx.currency)}</div>
                      {tx.invoiceNumber && (
                        <button style={{ ...s.actionButton, marginTop: 4 }} onClick={() => handleDownload(tx.id)} disabled={downloading===tx.id}>
                          {downloading===tx.id ? '…' : '⬇ Invoice'}
                        </button>
                      )}
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Invoices ──────────────────────────────────────────────── */}
      {activeTab === 'invoices' && (
        <div style={s.tabContent}>
          <h3 style={s.sectionTitle}>Invoices</h3>
          {invoices.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No invoices yet</div>
              <div style={{ fontSize: 14, color: '#9ca3af' }}>Invoices are generated on confirmed payments.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {invoices.map((tx) => (
                  <MotionDiv key={tx.id} style={s.invoiceItem} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{tx.invoiceNumber}</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>{tx.serviceType?.replace(/_/g,' ')} {tx.description && `— ${tx.description}`}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ ...s.badge, background: STATUS_COLOR[tx.status]??'#6b7280' }}>{tx.status}</span>
                        <button style={s.actionButton} onClick={() => handleDownload(tx.id)} disabled={downloading===tx.id}>
                          {downloading===tx.id ? '…' : '⬇ Download PDF'}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtAmount(tx.amount, tx.currency)}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>{fmtDate(tx.createdAt)}</div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Initiate ──────────────────────────────────────────────── */}
      {activeTab === 'initiate' && (
        <InitiatePaymentPanel onInitiated={onPaymentInitiated} onSuccess={() => { setActiveTab('transactions'); loadHistory(); }} />
      )}

      {/* ── Polling status ─────────────────────────────────────────── */}
      {activeTab === 'status' && pollingId && (
        <PaymentStatusPanel transactionId={pollingId} onDone={() => { loadHistory(); setPollingId(null); setActiveTab('transactions'); }} />
      )}
    </div>
  );
}

// ── Initiate payment panel ────────────────────────────────────────────────────
function InitiatePaymentPanel({ onInitiated, onSuccess }) {
  const [form, setForm] = useState({ amount: '', currency: 'RWF', provider: 'MTN_MOMO', serviceType: 'OTHER', phoneNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setFieldErrors(e => ({...e, [k]: ''})); };

  const validate = () => {
    const errs = {};
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount greater than 0';
    if (['MTN_MOMO','AIRTEL_MONEY'].includes(form.provider) && !form.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required for mobile money';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true); setError('');
    try {
      const data = await api.post('/api/payments/initiate', { ...form, amount: Number(form.amount) });
      const txId = data?.transaction?.id ?? data?.data?.transactionId ?? data?.transactionId;
      if (txId) onInitiated?.(String(txId));
      else onSuccess?.();
    } catch (e) {
      setError(e.message || 'Payment initiation failed');
    } finally { setSubmitting(false); }
  };

  const isMobile = ['MTN_MOMO','AIRTEL_MONEY'].includes(form.provider);

  return (
    <div style={s.tabContent}>
      <h3 style={s.sectionTitle}>Initiate New Payment</h3>

      <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: 'grid', gap: 18 }}>
        {error && <div style={s.formError}>{error}</div>}

        {/* Provider selector — visual cards */}
        <div>
          <label style={s.formLabel}>Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 6 }}>
            {[
              { v: 'MTN_MOMO',     icon: '📱', label: 'MTN MoMo' },
              { v: 'AIRTEL_MONEY', icon: '📲', label: 'Airtel Money' },
              { v: 'STRIPE',       icon: '💳', label: 'Card / Stripe' },
            ].map(({ v, icon, label }) => (
              <button
                key={v} type="button"
                onClick={() => set('provider', v)}
                style={{
                  padding: '14px 8px', borderRadius: 12, border: `2px solid ${form.provider===v ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  background: form.provider===v ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: form.provider===v ? '#60a5fa' : '#9ca3af' }}>{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount + currency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
          <div>
            <label style={s.formLabel}>Amount *</label>
            <input type="number" required min={1} value={form.amount} onChange={e=>set('amount',e.target.value)}
              style={{ ...s.formInput, borderColor: fieldErrors.amount ? '#ef4444' : undefined }} placeholder="e.g. 50000" />
            {fieldErrors.amount && <div style={s.fieldErr}>{fieldErrors.amount}</div>}
          </div>
          <div>
            <label style={s.formLabel}>Currency</label>
            <select value={form.currency} onChange={e=>set('currency',e.target.value)} style={s.formInput}>
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Mobile phone */}
        {isMobile && (
          <div>
            <label style={s.formLabel}>Mobile Number *</label>
            <input type="tel" value={form.phoneNumber} onChange={e=>set('phoneNumber',e.target.value)}
              style={{ ...s.formInput, borderColor: fieldErrors.phoneNumber ? '#ef4444' : undefined }}
              placeholder="+250 788 000 000" />
            {fieldErrors.phoneNumber && <div style={s.fieldErr}>{fieldErrors.phoneNumber}</div>}
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              You'll receive a USSD prompt on this number to complete payment.
            </div>
          </div>
        )}

        {/* Stripe card placeholder */}
        {form.provider === 'STRIPE' && (
          <div style={{ padding: '16px', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
              💳 Stripe card form will load here.<br />
              <span style={{ fontSize: 12, color: '#6b7280' }}>A Stripe Elements integration is required — contact your developer.</span>
            </div>
          </div>
        )}

        {/* Service type */}
        <div>
          <label style={s.formLabel}>Service Type</label>
          <select value={form.serviceType} onChange={e=>set('serviceType',e.target.value)} style={s.formInput}>
            <option value="PLAN_DOWNLOAD">Plan Download</option>
            <option value="BOQ_EXPORT">BOQ Export</option>
            <option value="ENGINEER_ASSIGNMENT">Engineer Assignment</option>
            <option value="PROJECT_MILESTONE">Project Milestone</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <button type="submit" disabled={submitting}
          style={{ padding: '13px 0', background: submitting?'#374151':'#3b82f6', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:submitting?'not-allowed':'pointer' }}>
          {submitting ? 'Processing…' : `Pay ${form.amount ? fmtAmount(form.amount, form.currency) : ''}`}
        </button>
      </form>
    </div>
  );
}

// ── Payment status panel (polling) ────────────────────────────────────────────
function PaymentStatusPanel({ transactionId, onDone }) {
  const [finalStatus, setFinalStatus] = useState(null);
  const [txData, setTxData] = useState(null);

  const polledStatus = usePaymentPolling(transactionId, (status) => {
    setFinalStatus(status);
    api.get(`/api/payments/status/${transactionId}`).then(d => setTxData(d?.transaction ?? d)).catch(()=>{});
  });

  const current = finalStatus ?? polledStatus ?? 'INITIATED';
  const done     = TERMINAL.has(current);
  const success  = ['CONFIRMED','RELEASED'].includes(current);
  const failed   = ['FAILED','CANCELLED'].includes(current);

  return (
    <div style={s.tabContent}>
      <h3 style={s.sectionTitle}>Payment Status</h3>
      <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>
        Transaction ID: <span style={{ fontFamily: 'monospace', color: '#d1d5db' }}>{transactionId}</span>
      </div>

      <PaymentStepper currentStatus={current} />

      {/* USSD prompt */}
      {txData?.ussdPrompt && !done && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#eab308', marginBottom: 6 }}>Dial this USSD code on your phone</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24', letterSpacing: 2 }}>
            {txData.ussdPrompt}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>The page will update automatically once confirmed.</div>
        </div>
      )}

      {/* Stripe redirect */}
      {txData?.redirectUrl && !done && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <a href={txData.redirectUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '12px 28px', background: '#3b82f6', color: '#fff', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            Complete Payment →
          </a>
        </div>
      )}

      {/* Polling indicator */}
      {!done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'cb-app-spin 0.9s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Checking payment status every 3 seconds…
        </div>
      )}

      {/* Final states */}
      <AnimatePresence>
        {success && (
          <MotionDiv initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#22c55e', marginBottom: 8 }}>Payment Confirmed!</div>
            {txData && <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
              {fmtAmount(txData.amount, txData.currency)} · {fmtDate(txData.updatedAt || txData.createdAt)}
            </div>}
            {txData?.invoiceNumber && (
              <button style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}
                onClick={() => downloadInvoice(transactionId).catch(() => {})}>
                ⬇ Download Invoice
              </button>
            )}
            <div><button style={s.actionButton} onClick={onDone}>View all transactions</button></div>
          </MotionDiv>
        )}
        {failed && (
          <MotionDiv initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>❌</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#ef4444', marginBottom: 8 }}>Payment Failed</div>
            <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>The payment was not completed. Please try again.</div>
            <button style={{ padding: '11px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              onClick={onDone}>Try again</button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
// function fmtAmount(amount, currency) {
//   const n = Number(amount);
//   return isNaN(n) ? '—' : `${currency || 'RWF'} ${n.toLocaleString()}`;
// }

const s = {
  container:     { maxWidth: '100%', margin: '0 auto', padding: '24px' },
  loading:       { display:'flex', alignItems:'center', justifyContent:'center', height:'40vh', color:'#9ca3af', gap:8 },
  header:        { marginBottom: 24 },
  title:         { margin:'0 0 6px', fontSize:26, fontWeight:700, color:'var(--text-color,#fff)' },
  subtitle:      { margin:'0 0 28px', fontSize:15, color:'#9ca3af' },
  revenueOverview: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:28 },
  revenueCard:     { background:'var(--card-bg,rgba(255,255,255,0.04))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:20, cursor:'default' },
  revenueTitle:    { margin:'0 0 6px', fontSize:13, color:'#9ca3af', fontWeight:500 },
  revenueAmount:   { fontSize:22, fontWeight:700, color:'var(--text-color,#fff)', marginBottom:4 },
  revenueSubtitle: { fontSize:12, color:'#6b7280' },
  tabs:     { display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:0, overflowX:'auto' },
  tab:      { padding:'10px 18px', background:'transparent', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:14, fontWeight:500, borderBottom:'2px solid transparent', marginBottom:-1, whiteSpace:'nowrap' },
  tabActive:{ color:'var(--text-color,#fff)', borderBottomColor:'#3b82f6' },
  tabContent: { background:'var(--card-bg,rgba(255,255,255,0.04))', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:24 },
  sectionTitle: { margin:'0 0 18px', fontSize:17, fontWeight:700, color:'var(--text-color,#fff)' },
  empty:   { textAlign:'center', padding:'60px 0', color:'#9ca3af' },
  txItem:  { display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' },
  txIcon:  { fontSize:22, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.06)', borderRadius:'50%', flexShrink:0 },
  badge:   { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, color:'#fff', whiteSpace:'nowrap' },
  invoiceItem: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:18 },
  actionButton:{ padding:'7px 16px', background:'rgba(255,255,255,0.06)', color:'var(--text-color,#fff)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, cursor:'pointer', fontSize:13 },
  formLabel: { fontSize:13, fontWeight:500, color:'#9ca3af', display:'block', marginBottom:6 },
  formInput: { padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'var(--text-color,#fff)', fontSize:14, width:'100%', boxSizing:'border-box' },
  formError: { color:'#ef4444', fontSize:14, padding:'10px 14px', background:'rgba(239,68,68,0.1)', borderRadius:8, border:'1px solid rgba(239,68,68,0.2)' },
  fieldErr:  { color:'#ef4444', fontSize:12, marginTop:4 },
};
