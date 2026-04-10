import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClientService.js';
import { upiService } from '../../services/upiService.js';

// ─── Rwanda geographic data ───────────────────────────────────────────────────
const PROVINCES = {
  Kigali:   ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  Northern: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  Southern: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  Eastern:  ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  Western:  ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rutsiro', 'Rusizi'],
};

const BUILDING_TYPES = [
  { value: 'RESIDENTIAL',  label: 'Residential (House/Villa)' },
  { value: 'APARTMENT',    label: 'Apartment Block' },
  { value: 'COMMERCIAL',   label: 'Commercial / Office' },
  { value: 'INDUSTRIAL',   label: 'Industrial / Warehouse' },
  { value: 'HOSPITAL',     label: 'Hospital / Clinic' },
  { value: 'SCHOOL',       label: 'School / Institution' },
];

// ─── Currency helpers ─────────────────────────────────────────────────────────
const USD_RATE = 1300; // 1 USD ≈ 1300 RWF
const CURRENCY_KEY = 'cb_currency';

function loadCurrency() {
  try { return localStorage.getItem(CURRENCY_KEY) || 'RWF'; } catch { return 'RWF'; }
}
function saveCurrency(c) {
  try { localStorage.setItem(CURRENCY_KEY, c); } catch { /* ignore */ }
}

function fmtCost(rwf, currency) {
  if (rwf == null || isNaN(rwf)) return '—';
  if (currency === 'USD') {
    return `$${Math.round(rwf / USD_RATE).toLocaleString()}`;
  }
  return `RWF ${Math.round(rwf).toLocaleString()}`;
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--color-border, #2a2a3a)',
  borderRadius: 8,
  background: 'var(--color-surface, #111)',
  color: 'var(--color-text-primary, #fff)',
  fontSize: 14,
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--color-text-secondary, #9ca3af)',
  marginBottom: 6,
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Verdict badge ────────────────────────────────────────────────────────────
function VerdictBadge({ verdict }) {
  const map = {
    ACHIEVABLE:     { bg: 'rgba(34,197,94,0.14)',  color: '#22c55e', label: 'Achievable' },
    PARTIAL:        { bg: 'rgba(234,179,8,0.14)',   color: '#eab308', label: 'Achievable with Adjustments' },
    NOT_ACHIEVABLE: { bg: 'rgba(239,68,68,0.14)',   color: '#ef4444', label: 'Budget Insufficient' },
  };
  const v = map[verdict] || map.PARTIAL;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 18px', borderRadius: 999,
      background: v.bg, color: v.color, fontWeight: 700, fontSize: 15,
    }}>
      {verdict === 'ACHIEVABLE' ? '✓' : verdict === 'NOT_ACHIEVABLE' ? '✗' : '~'} {v.label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BudgetAnalyzer() {
  const navigate = useNavigate();

  // ── form fields ──
  const [province, setProvince]     = useState('');
  const [district, setDistrict]     = useState('');
  const [buildingType, setBuildingType] = useState('RESIDENTIAL');
  const [floors, setFloors]         = useState(1);
  const [bedrooms, setBedrooms]     = useState(3);
  const [builtArea, setBuiltArea]   = useState('');
  const [budget, setBudget]         = useState('');
  const [upiCode, setUpiCode]       = useState('');

  // ── currency toggle ──
  const [currency, setCurrencyState] = useState(loadCurrency);
  const setCurrency = (c) => { setCurrencyState(c); saveCurrency(c); };

  // ── UPI lookup ──
  const [upiData, setUpiData]       = useState(null);
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiError, setUpiError]     = useState('');
  const upiTimer = useRef(null);

  // ── analysis ──
  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Province change resets district
  const handleProvince = (p) => { setProvince(p); setDistrict(''); };

  // UPI debounced lookup
  useEffect(() => {
    if (!upiCode.trim() || upiCode.length < 5) {
      setUpiData(null);
      setUpiError('');
      return;
    }
    clearTimeout(upiTimer.current);
    upiTimer.current = setTimeout(async () => {
      setUpiLoading(true);
      setUpiError('');
      try {
        const data = await upiService.lookup(upiCode.trim());
        setUpiData(data);
      } catch (e) {
        setUpiData(null);
        setUpiError(e.message || 'UPI lookup failed');
      } finally {
        setUpiLoading(false);
      }
    }, 600);
    return () => clearTimeout(upiTimer.current);
  }, [upiCode]);

  // Budget in RWF regardless of display currency
  const budgetRwf = currency === 'USD'
    ? Number(budget) * USD_RATE
    : Number(budget);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!province) { setError('Select a province.'); return; }
    if (!district) { setError('Select a district.'); return; }
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      setError('Enter a valid budget amount.'); return;
    }
    if (budgetRwf < 1_000_000) {
      setError('Minimum budget is RWF 1,000,000.'); return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const result = await api.post('/api/budget/analyze', {
        budget: budgetRwf,
        province,
        district,
        preferences: {
          buildingType,
          floors: Number(floors) || 1,
          bedrooms: Number(bedrooms) || 0,
          builtAreaM2: builtArea ? Number(builtArea) : undefined,
          upiCode: upiCode.trim() || undefined,
        },
      });
      setAnalysis(result);
    } catch (e) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePackage = () => {
    const params = new URLSearchParams({
      province,
      district,
      buildingType,
      budget: budgetRwf,
    });
    navigate(`/dashboard/projects/new?${params.toString()}`);
  };

  const districts = province ? (PROVINCES[province] || []) : [];

  // ── Convert budget input placeholder ──
  const budgetPlaceholder = currency === 'USD'
    ? 'e.g. 50000 (USD)'
    : 'e.g. 65000000 (RWF)';

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px' }}>
      {/* Header + currency toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
            Budget Analyzer
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-text-secondary, #9ca3af)' }}>
            Enter your project details to get ranked construction recommendations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--color-border, #2a2a3a)', borderRadius: 8, overflow: 'hidden' }}>
          {['RWF', 'USD'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              style={{
                padding: '7px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: currency === c ? '#3b82f6' : 'transparent',
                color: currency === c ? '#fff' : 'var(--color-text-secondary, #9ca3af)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleAnalyze}>
        <div style={{
          background: 'var(--color-surface, #111)',
          border: '1px solid var(--color-border, #2a2a3a)',
          borderRadius: 14, padding: 24, marginBottom: 20,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            {/* Province */}
            <Field label="Province *">
              <select value={province} onChange={(e) => handleProvince(e.target.value)} style={inputStyle}>
                <option value="">Select province…</option>
                {Object.keys(PROVINCES).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            {/* District */}
            <Field label="District *">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!province}
                style={{ ...inputStyle, opacity: province ? 1 : 0.5 }}
              >
                <option value="">Select district…</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>

            {/* Building type */}
            <Field label="Building Type">
              <select value={buildingType} onChange={(e) => setBuildingType(e.target.value)} style={inputStyle}>
                {BUILDING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>

            {/* Budget */}
            <Field label={`Budget (${currency}) *`}>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={budgetPlaceholder}
                min={0}
                style={inputStyle}
              />
            </Field>

            {/* Floors */}
            <Field label="Number of Floors">
              <input
                type="number"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                min={1} max={20}
                style={inputStyle}
              />
            </Field>

            {/* Bedrooms */}
            <Field label="Bedrooms">
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                min={0} max={50}
                style={inputStyle}
              />
            </Field>

            {/* Built area */}
            <Field label="Desired Built Area (m²) — optional">
              <input
                type="number"
                value={builtArea}
                onChange={(e) => setBuiltArea(e.target.value)}
                placeholder="e.g. 200"
                min={0}
                style={inputStyle}
              />
            </Field>

            {/* UPI */}
            <Field label="UPI Code — optional (land registry lookup)">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={upiCode}
                  onChange={(e) => setUpiCode(e.target.value)}
                  placeholder="e.g. 1/01/01/01/001"
                  style={inputStyle}
                />
                {upiLoading && (
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>
                    Looking up…
                  </span>
                )}
              </div>
              {upiError && (
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{upiError}</div>
              )}
              {upiData && (
                <div style={{
                  marginTop: 8, padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                  fontSize: 13,
                }}>
                  <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>Plot found</div>
                  {upiData.plotSizeM2 && <div>Plot size: <strong>{upiData.plotSizeM2} m²</strong></div>}
                  {upiData.landUse && <div>Land use: <strong>{upiData.landUse}</strong></div>}
                  {upiData.district && <div>District: <strong>{upiData.district}</strong></div>}
                  {upiData.zoning && <div>Zoning: <strong>{upiData.zoning}</strong></div>}
                </div>
              )}
            </Field>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16,
              background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
              background: loading ? '#374151' : '#3b82f6',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Analyzing your project…' : 'Analyze Budget & Get Recommendations'}
          </button>
        </div>
      </form>

      {/* Results */}
      {analysis && (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Verdict */}
          <div style={{
            padding: 24, borderRadius: 14,
            border: '1px solid var(--color-border, #2a2a3a)',
            background: 'var(--color-surface, #111)',
          }}>
            <div style={{ marginBottom: 16 }}>
              <VerdictBadge verdict={analysis.verdict || (analysis.success ? 'ACHIEVABLE' : 'NOT_ACHIEVABLE')} />
            </div>

            {analysis.recommendations?.recommendation && (
              <p style={{
                margin: 0, lineHeight: 1.7, fontSize: 14,
                color: 'var(--color-text-secondary, #9ca3af)',
                whiteSpace: 'pre-wrap',
              }}>
                {analysis.recommendations.recommendation}
              </p>
            )}

            {analysis.recommendations?.confidence != null && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                Confidence: {Math.round(analysis.recommendations.confidence * 100)}%
              </div>
            )}
          </div>

          {/* Ranked alternatives */}
          {analysis.suitable_plans?.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
                Ranked Recommendations
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {analysis.suitable_plans.slice(0, 3).map((plan, idx) => {
                  const isTop = idx === 0;
                  const minCost = plan.adjusted_min_budget ?? plan.estimatedCostMin;
                  const maxCost = plan.adjusted_max_budget ?? plan.estimatedCostMax;
                  return (
                    <div
                      key={plan.key || plan.id || idx}
                      style={{
                        padding: 20, borderRadius: 12,
                        border: isTop
                          ? '2px solid #3b82f6'
                          : '1px solid var(--color-border, #2a2a3a)',
                        background: isTop
                          ? 'rgba(59,130,246,0.07)'
                          : 'var(--color-surface, #111)',
                        position: 'relative',
                      }}
                    >
                      {isTop && (
                        <span style={{
                          position: 'absolute', top: -1, right: 16,
                          background: '#3b82f6', color: '#fff',
                          fontSize: 11, fontWeight: 700, padding: '2px 10px',
                          borderRadius: '0 0 8px 8px',
                        }}>
                          BEST MATCH
                        </span>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary, #fff)', marginBottom: 4 }}>
                            #{idx + 1} — {plan.name || plan.title || `Option ${idx + 1}`}
                          </div>
                          <div style={{ fontSize: 13, color: '#9ca3af', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {plan.size_range && (
                              <span>Size: {plan.size_range.min}–{plan.size_range.max} m²</span>
                            )}
                            {plan.bedrooms && (
                              <span>Beds: {plan.bedrooms.min ?? plan.bedrooms}–{plan.bedrooms.max ?? plan.bedrooms}</span>
                            )}
                            {plan.construction_time && (
                              <span>Timeline: {plan.construction_time.min}–{plan.construction_time.max} mo.</span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: 15 }}>
                            {minCost && maxCost
                              ? `${fmtCost(minCost, currency)} – ${fmtCost(maxCost, currency)}`
                              : minCost
                                ? `From ${fmtCost(minCost, currency)}`
                                : '—'}
                          </div>
                          {plan.affordability_score != null && (
                            <div style={{
                              marginTop: 4, fontSize: 12, fontWeight: 600,
                              color: plan.affordability_score >= 0.7 ? '#22c55e' : plan.affordability_score >= 0.4 ? '#eab308' : '#ef4444',
                            }}>
                              Affordability: {Math.round(plan.affordability_score * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed cost breakdown */}
          {analysis.detailed_analysis && (
            <div style={{
              padding: 20, borderRadius: 14,
              border: '1px solid var(--color-border, #2a2a3a)',
              background: 'var(--color-surface, #111)',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
                Cost Breakdown
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Estimated Size', value: analysis.detailed_analysis.estimated_size_m2 ? `${analysis.detailed_analysis.estimated_size_m2} m²` : null },
                  { label: 'Materials', value: fmtCost(analysis.detailed_analysis.material_costs?.total, currency) },
                  { label: 'Labour', value: fmtCost(analysis.detailed_analysis.labor_costs?.total, currency) },
                  { label: 'Other (Transport, Permits, Contingency)', value: fmtCost(analysis.detailed_analysis.other_costs?.total, currency) },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary, #fff)' }}>
                    Total Estimated Cost
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: '#60a5fa' }}>
                    {fmtCost(analysis.detailed_analysis.total_cost, currency)}
                  </span>
                </div>
                {analysis.detailed_analysis.remaining_budget != null && (
                  <div style={{
                    marginTop: 8, fontSize: 14,
                    color: analysis.detailed_analysis.remaining_budget >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {analysis.detailed_analysis.remaining_budget >= 0
                      ? `Surplus: ${fmtCost(analysis.detailed_analysis.remaining_budget, currency)}`
                      : `Shortfall: ${fmtCost(Math.abs(analysis.detailed_analysis.remaining_budget), currency)}`}
                  </div>
                )}
                {analysis.detailed_analysis.budget_utilization != null && (
                  <div style={{ marginTop: 6, fontSize: 13, color: '#6b7280' }}>
                    Budget utilization: {Math.round(analysis.detailed_analysis.budget_utilization)}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Low-budget suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div style={{
              padding: 20, borderRadius: 14,
              border: '1px solid rgba(234,179,8,0.3)',
              background: 'rgba(234,179,8,0.07)',
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#eab308' }}>
                How to make it work
              </h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {analysis.suggestions.map((s, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>{s.description}</div>
                    {s.estimated_saving && (
                      <div style={{ fontSize: 12, color: '#eab308', marginTop: 4 }}>
                        Estimated saving: {s.estimated_saving}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Project Package CTA */}
          {(analysis.success || analysis.verdict === 'ACHIEVABLE' || analysis.verdict === 'PARTIAL') && (
            <div style={{
              padding: 24, borderRadius: 14, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary, #fff)', marginBottom: 6 }}>
                Ready to move forward?
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 18 }}>
                Generate a project package with your specifications, recommended plans, and an engineer shortlist.
              </div>
              <button
                type="button"
                onClick={handleGeneratePackage}
                style={{
                  padding: '12px 32px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                Generate Project Package →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
