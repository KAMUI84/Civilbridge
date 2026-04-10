import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { aiService } from '../../services/aiService';
import { useAuthStore } from '../../store/authStore';

const buildingTypes = [
  { id: 'residential', name: 'Residential House', baseCost: 15000000, time: '6 months', tag: 'RH' },
  { id: 'apartment', name: 'Apartment Building', baseCost: 50000000, time: '12 months', tag: 'AB' },
  { id: 'commercial', name: 'Commercial Building', baseCost: 80000000, time: '18 months', tag: 'CB' },
  { id: 'industrial', name: 'Industrial Facility', baseCost: 120000000, time: '24 months', tag: 'IF' },
  { id: 'mixed', name: 'Mixed-Use Building', baseCost: 60000000, time: '15 months', tag: 'MU' },
];

const availableFeatures = [
  { id: 'parking', name: 'Parking Garage', cost: 2000000, time: '+1 month' },
  { id: 'pool', name: 'Swimming Pool', cost: 3000000, time: '+2 months' },
  { id: 'solar', name: 'Solar Panels', cost: 5000000, time: '+1 month' },
  { id: 'garden', name: 'Landscaping', cost: 1500000, time: '+1 month' },
  { id: 'security', name: 'Security System', cost: 1000000, time: '+2 weeks' },
  { id: 'elevator', name: 'Elevator', cost: 8000000, time: '+2 months' },
];

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function formatCurrency(value, currency = 'RWF') {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatLabel(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== '' && entry !== null && entry !== undefined)
  );
}

function SummaryState({ title, message, actionLabel, onAction }) {
  return (
    <div style={styles.stateCard}>
      <h3 style={styles.stateTitle}>{title}</h3>
      <p style={styles.stateText}>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" style={styles.stateButton} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div style={styles.stateCard}>
      <div style={styles.skeletonTitle} />
      <div style={styles.skeletonText} />
      <div style={styles.skeletonTextWide} />
      <div style={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={styles.skeletonBox} />
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.resultSection}>
      <h4 style={styles.sectionTitle}>{title}</h4>
      {children}
    </div>
  );
}

function MetricGrid({ items }) {
  if (!items.length) return null;
  return (
    <div style={styles.metricGrid}>
      {items.map((item) => (
        <div key={item.label} style={styles.metricCard}>
          <span style={styles.metricLabel}>{item.label}</span>
          <strong style={styles.metricValue}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, renderItem }) {
  if (!items.length) return null;
  return (
    <div style={styles.listBlock}>
      {items.map((item, index) => (
        <div key={`${index}-${typeof item === 'object' ? JSON.stringify(item) : item}`} style={styles.listItem}>
          {renderItem ? renderItem(item, index) : item}
        </div>
      ))}
    </div>
  );
}

function ProviderSummary({ providerState, isAuthenticated }) {
  if (!isAuthenticated) {
    return 'Sign in is required to use the live AI tools in this dashboard.';
  }

  if (providerState.loading) {
    return 'Loading AI provider routing...';
  }

  if (providerState.error) {
    return providerState.error;
  }

  const defaultProvider = providerState.data?.routing?.default || 'unknown';
  const analyzePdf = providerState.data?.routing?.analyzePlanPdf || 'unknown';
  const estimate = providerState.data?.routing?.estimate || 'unknown';

  return `Default: ${defaultProvider} | Plan PDF analysis: ${analyzePdf} | Estimation: ${estimate}`;
}

export default function PlanLibraryEnhanced() {
  const { isAuthenticated } = useAuthStore();
  const [activeMode, setActiveMode] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [analysisState, setAnalysisState] = useState({ loading: false, error: '', data: null });
  const [manualState, setManualState] = useState({ loading: false, error: '', estimate: null, plan: null });
  const [providerState, setProviderState] = useState({ loading: isAuthenticated, error: '', data: null });
  const [activityLog, setActivityLog] = useState([]);
  const [landDetails, setLandDetails] = useState({
    size: '',
    location: '',
    soilType: '',
    topography: '',
    access: '',
    utilities: '',
  });
  const [buildingType, setBuildingType] = useState('');
  const [customFeatures, setCustomFeatures] = useState([]);
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('RWF');

  const selectedBuilding = useMemo(() => (
    buildingTypes.find((item) => item.id === buildingType) || null
  ), [buildingType]);

  const selectedFeatures = useMemo(() => (
    availableFeatures.filter((feature) => customFeatures.includes(feature.id))
  ), [customFeatures]);

  const providerSummary = useMemo(() => ProviderSummary({ providerState, isAuthenticated }), [isAuthenticated, providerState]);

  const addActivity = useCallback((type, title, summary, status = 'success') => {
    setActivityLog((current) => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      summary,
      status,
      createdAt: new Date().toISOString(),
    }, ...current].slice(0, 8));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setProviderState({ loading: false, error: '', data: null });
      return;
    }

    let cancelled = false;

    const loadProviders = async () => {
      try {
        setProviderState({ loading: true, error: '', data: null });
        const response = await aiService.getProviders();
        if (!cancelled) {
          setProviderState({ loading: false, error: '', data: response?.status || null });
        }
      } catch (error) {
        if (!cancelled) {
          setProviderState({ loading: false, error: error.message || 'Failed to load AI provider status.', data: null });
        }
      }
    };

    loadProviders();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadedFile(null);
      setFileError('Please upload a PDF, JPG, PNG, or WEBP plan file.');
      return;
    }

    setUploadedFile(file);
    setFileError('');
    setAnalysisState((current) => ({ ...current, error: '' }));
  }, []);

  const handleAnalyzePlan = useCallback(async () => {
    if (!uploadedFile) {
      setFileError('Choose a plan file before running the analysis.');
      return;
    }

    if (!isAuthenticated) {
      setAnalysisState({ loading: false, error: 'Sign in is required to analyze plans.', data: null });
      return;
    }

    try {
      setAnalysisState({ loading: true, error: '', data: null });
      const formData = new FormData();
      formData.append('file', uploadedFile);
      if (landDetails.location) {
        formData.append('location', landDetails.location);
      }
      if (selectedBuilding?.name) {
        formData.append('projectType', selectedBuilding.name);
      }
      if (selectedFeatures.length) {
        formData.append('notes', selectedFeatures.map((feature) => feature.name).join(', '));
      }

      const response = await aiService.analyzePlan(formData);
      const analysis = response?.analysis || null;
      setAnalysisState({ loading: false, error: '', data: analysis });
      addActivity('analysis', 'Plan analyzed', analysis?.summary || uploadedFile.name, 'success');
    } catch (error) {
      const message = error.message || 'Failed to analyze the uploaded plan.';
      setAnalysisState({ loading: false, error: message, data: null });
      addActivity('analysis', 'Plan analysis failed', message, 'error');
    }
  }, [addActivity, isAuthenticated, landDetails.location, selectedBuilding?.name, selectedFeatures, uploadedFile]);

  const handleGeneratePlan = useCallback(async () => {
    if (!isAuthenticated) {
      setManualState({ loading: false, error: 'Sign in is required to generate plans.', estimate: null, plan: null });
      return;
    }

    if (!selectedBuilding) {
      setManualState({ loading: false, error: 'Choose a building type before generating a plan.', estimate: null, plan: null });
      return;
    }

    if (!budget) {
      setManualState({ loading: false, error: 'Enter a budget before generating a plan.', estimate: null, plan: null });
      return;
    }

    const featureNames = selectedFeatures.map((feature) => feature.name);
    const siteConstraints = compactObject({
      sizeM2: landDetails.size,
      soilType: landDetails.soilType,
      topography: landDetails.topography,
      access: landDetails.access,
      utilities: landDetails.utilities,
    });

    const estimatePayload = {
      idea: `${selectedBuilding.name}${landDetails.size ? ` on ${landDetails.size} m2` : ''}${featureNames.length ? ` with ${featureNames.join(', ')}` : ''}`,
      budgetRange: `${formatCurrency(budget, currency)} target budget`,
      location: landDetails.location,
      timeline: selectedBuilding.time,
    };

    const planPayload = {
      budget,
      currency,
      preferences: [selectedBuilding.name, ...featureNames].join(', '),
      location: landDetails.location,
      siteConstraints,
      upiData: JSON.stringify(siteConstraints),
    };

    try {
      setManualState({ loading: true, error: '', estimate: null, plan: null });
      const [estimateResponse, planResponse] = await Promise.all([
        aiService.estimateProject(estimatePayload),
        aiService.generatePlan(planPayload),
      ]);

      const estimate = estimateResponse?.estimation || null;
      const plan = planResponse?.plan || null;
      setManualState({ loading: false, error: '', estimate, plan });
      addActivity('estimate', 'Project estimation ready', estimate?.projectIntent || selectedBuilding.name, 'success');
      addActivity('plan', 'Plan specification ready', plan?.planSpecification || selectedBuilding.name, 'success');
    } catch (error) {
      const message = error.message || 'Failed to generate the plan package.';
      setManualState({ loading: false, error: message, estimate: null, plan: null });
      addActivity('plan', 'Plan generation failed', message, 'error');
    }
  }, [addActivity, budget, currency, isAuthenticated, landDetails, selectedBuilding, selectedFeatures]);

  const analysisMetrics = useMemo(() => {
    const totals = analysisState.data?.totals;
    const confidence = analysisState.data?.confidence;

    return [
      totals?.grandTotal ? { label: 'Grand total', value: formatCurrency(totals.grandTotal, totals.currency || 'RWF') } : null,
      totals?.subtotal ? { label: 'Subtotal', value: formatCurrency(totals.subtotal, totals.currency || 'RWF') } : null,
      totals?.lineItems ? { label: 'Line items', value: totals.lineItems } : null,
      confidence?.overall ? { label: 'Confidence', value: `${confidence.overall}%` } : null,
    ].filter(Boolean);
  }, [analysisState.data]);

  const estimateMetrics = useMemo(() => {
    const estimate = manualState.estimate;
    if (!estimate) return [];

    return [
      estimate?.budgetFit ? { label: 'Budget fit', value: estimate.budgetFit } : null,
      estimate?.feasibleOptions?.length ? { label: 'Feasible options', value: estimate.feasibleOptions.length } : null,
      estimate?.flaggedRisks?.length ? { label: 'Flagged risks', value: estimate.flaggedRisks.length } : null,
      estimate?.recommendedNextSteps?.length ? { label: 'Next steps', value: estimate.recommendedNextSteps.length } : null,
    ].filter(Boolean);
  }, [manualState.estimate]);

  const planMetrics = useMemo(() => {
    const plan = manualState.plan;
    if (!plan) return [];

    return [
      plan?.totals?.targetBudget ? { label: 'Target budget', value: formatCurrency(plan.totals.targetBudget, plan.totals.currency || currency) } : null,
      plan?.totals?.estimatedTotal ? { label: 'Estimated total', value: formatCurrency(plan.totals.estimatedTotal, plan.totals.currency || currency) } : null,
      plan?.totals?.budgetFit ? { label: 'Budget fit', value: plan.totals.budgetFit } : null,
      plan?.boq?.length ? { label: 'BOQ items', value: plan.boq.length } : null,
    ].filter(Boolean);
  }, [currency, manualState.plan]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>AI Plan Intelligence</h1>
          <p style={styles.subtitle}>Live analysis, estimation, and plan generation with real AI endpoints.</p>
        </div>
        <button type="button" style={styles.sidebarToggle} onClick={() => setShowSidebar((current) => !current)}>
          {showSidebar ? 'Hide' : 'Show'} activity
        </button>
      </div>

      <div style={styles.providerRibbon}>{providerSummary}</div>

      <div style={styles.mainContent}>
        <div style={{ ...styles.contentArea, width: showSidebar ? 'calc(100% - 360px)' : '100%' }}>
          <div style={styles.modeSelection}>
            <button
              type="button"
              style={{ ...styles.modeButton, ...(activeMode === 'upload' ? styles.modeButtonActive : {}) }}
              onClick={() => setActiveMode('upload')}
            >
              AI Analysis
            </button>
            <button
              type="button"
              style={{ ...styles.modeButton, ...(activeMode === 'manual' ? styles.modeButtonActive : {}) }}
              onClick={() => setActiveMode('manual')}
            >
              Plan Builder
            </button>
          </div>

          {activeMode === 'upload' ? (
            <div style={styles.modeContent}>
              <div style={styles.uploadSection}>
                <div style={styles.uploadArea}>
                  <input
                    type="file"
                    id="plan-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".jpg,.jpeg,.png,.pdf,.webp"
                  />
                  <label htmlFor="plan-upload" style={styles.uploadLabel}>
                    <div style={styles.uploadBadge}>AI</div>
                    <h3 style={styles.uploadTitle}>Upload a construction plan</h3>
                    <p style={styles.uploadText}>Run the real plan-analysis workflow to extract quantities, totals, and risks.</p>
                    <p style={styles.uploadSubtext}>Supported formats: PDF, JPG, PNG, WEBP</p>
                  </label>
                </div>

                {uploadedFile ? (
                  <div style={styles.fileInfo}>
                    <p style={styles.fileName}>{uploadedFile.name}</p>
                    <button type="button" style={styles.primaryButton} onClick={handleAnalyzePlan} disabled={analysisState.loading}>
                      {analysisState.loading ? 'Analyzing...' : 'Analyze plan'}
                    </button>
                  </div>
                ) : null}

                {fileError ? <p style={styles.inlineError}>{fileError}</p> : null}
                {analysisState.error ? <p style={styles.inlineError}>{analysisState.error}</p> : null}

                {analysisState.loading ? (
                  <SkeletonPanel />
                ) : analysisState.data ? (
                  <div style={styles.resultsLayout}>
                    <Section title="Analysis summary">
                      <p style={styles.sectionText}>{analysisState.data.summary || 'The AI service completed the plan analysis and returned structured construction data.'}</p>
                      <MetricGrid items={analysisMetrics} />
                    </Section>

                    <Section title="Dimensions">
                      <BulletList
                        items={analysisState.data.dimensions || []}
                        renderItem={(item) => `${item.label || item.name || 'Dimension'}: ${item.value}${item.unit ? ` ${item.unit}` : ''}`}
                      />
                    </Section>

                    <Section title="Materials">
                      <BulletList
                        items={analysisState.data.materials || []}
                        renderItem={(item) => `${item.material || item.name || 'Material'}${item.quantity ? ` - ${item.quantity}` : ''}${item.unit ? ` ${item.unit}` : ''}`}
                      />
                    </Section>

                    <Section title="Bill of quantities">
                      <BulletList
                        items={analysisState.data.boq || []}
                        renderItem={(item) => `${item.item || item.name || 'Line item'} | ${item.quantity || '-'} ${item.unit || ''} | ${formatCurrency(item.totalCost || item.unitCost || 0, analysisState.data?.totals?.currency || 'RWF')}`}
                      />
                    </Section>

                    <Section title="Assumptions and risks">
                      <BulletList items={analysisState.data.assumptions || []} />
                      <BulletList items={analysisState.data.missingInformation || []} />
                      <BulletList items={analysisState.data.risks || []} />
                      {analysisState.data.confidence?.notes ? <p style={styles.sectionText}>{analysisState.data.confidence.notes}</p> : null}
                    </Section>
                  </div>
                ) : (
                  <SummaryState title="No analysis yet" message="Upload a plan file to fetch a live BOQ extraction result from the AI service." />
                )}
              </div>
            </div>
          ) : null}

          {activeMode === 'manual' ? (
            <div style={styles.modeContent}>
              <div style={styles.manualSection}>
                <div style={styles.sectionPanel}>
                  <h3 style={styles.sectionTitle}>Site details</h3>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Land size (m2)</label>
                      <input type="number" style={styles.formInput} value={landDetails.size} onChange={(event) => setLandDetails((current) => ({ ...current, size: event.target.value }))} placeholder="e.g. 500" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Location</label>
                      <input type="text" style={styles.formInput} value={landDetails.location} onChange={(event) => setLandDetails((current) => ({ ...current, location: event.target.value }))} placeholder="e.g. Kigali, Gasabo" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Soil type</label>
                      <select style={styles.formSelect} value={landDetails.soilType} onChange={(event) => setLandDetails((current) => ({ ...current, soilType: event.target.value }))}>
                        <option value="">Select soil type</option>
                        <option value="clay">Clay</option>
                        <option value="sandy">Sandy</option>
                        <option value="loamy">Loamy</option>
                        <option value="rocky">Rocky</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Topography</label>
                      <select style={styles.formSelect} value={landDetails.topography} onChange={(event) => setLandDetails((current) => ({ ...current, topography: event.target.value }))}>
                        <option value="">Select topography</option>
                        <option value="flat">Flat</option>
                        <option value="sloping">Sloping</option>
                        <option value="hilly">Hilly</option>
                        <option value="uneven">Uneven</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Access</label>
                      <input type="text" style={styles.formInput} value={landDetails.access} onChange={(event) => setLandDetails((current) => ({ ...current, access: event.target.value }))} placeholder="Road width or nearby access" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Utilities</label>
                      <input type="text" style={styles.formInput} value={landDetails.utilities} onChange={(event) => setLandDetails((current) => ({ ...current, utilities: event.target.value }))} placeholder="Water, power, drainage" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Budget</label>
                      <input type="number" style={styles.formInput} value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="e.g. 45000000" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Currency</label>
                      <input type="text" style={styles.formInput} value={currency} onChange={(event) => setCurrency(event.target.value || 'RWF')} placeholder="RWF" />
                    </div>
                  </div>
                </div>

                <div style={styles.sectionPanel}>
                  <h3 style={styles.sectionTitle}>Building type</h3>
                  <div style={styles.cardGrid}>
                    {buildingTypes.map((type) => (
                      <button key={type.id} type="button" style={{ ...styles.choiceCard, ...(buildingType === type.id ? styles.choiceCardActive : {}) }} onClick={() => setBuildingType(type.id)}>
                        <div style={styles.choiceTag}>{type.tag}</div>
                        <strong style={styles.choiceTitle}>{type.name}</strong>
                        <span style={styles.choiceMeta}>{formatCurrency(type.baseCost)}</span>
                        <span style={styles.choiceMeta}>{type.time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.sectionPanel}>
                  <h3 style={styles.sectionTitle}>Additional features</h3>
                  <div style={styles.cardGrid}>
                    {availableFeatures.map((feature) => {
                      const active = customFeatures.includes(feature.id);
                      return (
                        <button
                          key={feature.id}
                          type="button"
                          style={{ ...styles.choiceCard, ...(active ? styles.choiceCardActive : {}) }}
                          onClick={() => setCustomFeatures((current) => (current.includes(feature.id) ? current.filter((item) => item !== feature.id) : [...current, feature.id]))}
                        >
                          <strong style={styles.choiceTitle}>{feature.name}</strong>
                          <span style={styles.choiceMeta}>{formatCurrency(feature.cost)}</span>
                          <span style={styles.choiceMeta}>{feature.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.sectionActions}>
                  <button type="button" style={styles.primaryButton} onClick={handleGeneratePlan} disabled={manualState.loading}>
                    {manualState.loading ? 'Generating...' : 'Generate estimate and plan'}
                  </button>
                  {manualState.error ? <p style={styles.inlineError}>{manualState.error}</p> : null}
                </div>

                {manualState.loading ? (
                  <SkeletonPanel />
                ) : manualState.estimate || manualState.plan ? (
                  <div style={styles.resultsLayout}>
                    <Section title="Project estimate">
                      <p style={styles.sectionText}>{manualState.estimate?.projectIntent || 'The AI estimation workflow returned project-fit options for this site.'}</p>
                      <MetricGrid items={estimateMetrics} />
                      <BulletList items={manualState.estimate?.feasibleOptions || []} renderItem={(item) => `${item.title || item.option || item.name || 'Option'}${item.description ? ` - ${item.description}` : ''}`} />
                      <BulletList items={manualState.estimate?.recommendedNextSteps || []} />
                      <BulletList items={manualState.estimate?.flaggedRisks || []} renderItem={(item) => item.title || item.risk || item.description || JSON.stringify(item)} />
                    </Section>

                    <Section title="Plan specification">
                      <p style={styles.sectionText}>{manualState.plan?.planSpecification || 'The AI plan-generation workflow returned a structured plan package.'}</p>
                      <MetricGrid items={planMetrics} />
                      <BulletList items={manualState.plan?.spaceProgram || []} renderItem={(item) => item.name || item.space || item.description || JSON.stringify(item)} />
                      <BulletList items={manualState.plan?.boq || []} renderItem={(item) => `${item.item || item.name || 'BOQ item'} | ${item.quantity || '-'} ${item.unit || ''} | ${formatCurrency(item.totalCost || item.unitCost || 0, manualState.plan?.totals?.currency || currency)}`} />
                      <BulletList items={manualState.plan?.nextSteps || []} />
                      <BulletList items={manualState.plan?.risks || []} />
                    </Section>
                  </div>
                ) : (
                  <SummaryState title="No plan package yet" message="Fill in the site details, choose a building type, and enter a budget to call the live estimation and generation endpoints." />
                )}
              </div>
            </div>
          ) : null}
        </div>

        {showSidebar ? (
          <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Activity</h3>
              <span style={styles.sidebarPill}>{activityLog.length} recent</span>
            </div>

            <div style={styles.providerPanel}>
              <strong style={styles.providerPanelTitle}>Provider status</strong>
              <p style={styles.providerPanelText}>{providerSummary}</p>
              {providerState.data?.providers ? (
                <div style={styles.providerBadges}>
                  {Object.entries(providerState.data.providers).map(([key, value]) => (
                    <span key={key} style={{ ...styles.providerBadge, ...(value.available ? styles.providerBadgeLive : styles.providerBadgeMuted) }}>
                      {formatLabel(key)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={styles.activityList}>
              {activityLog.length ? activityLog.map((item) => (
                <div key={item.id} style={styles.activityCard}>
                  <div style={styles.activityHeader}>
                    <strong style={styles.activityTitle}>{item.title}</strong>
                    <span style={{ ...styles.activityStatus, ...(item.status === 'error' ? styles.activityStatusError : styles.activityStatusSuccess) }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={styles.activityText}>{item.summary}</p>
                  <span style={styles.activityMeta}>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              )) : (
                <SummaryState title="No activity yet" message="Results from analysis, estimation, and plan generation will appear here." />
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    color: 'var(--text-color)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '24px 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
  },
  sidebarToggle: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 16px',
    color: 'var(--bg-color)',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  providerRibbon: {
    margin: '18px 32px 0',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    padding: '32px',
    overflowY: 'auto',
  },
  modeSelection: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '8px',
    borderRadius: '16px',
  },
  modeButton: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 24px',
    color: 'var(--text-muted)',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  modeButtonActive: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    color: 'var(--bg-color)',
  },
  modeContent: {
    minHeight: '600px',
  },
  uploadSection: {
    display: 'grid',
    gap: '24px',
  },
  uploadArea: {
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    padding: '56px 32px',
    background: 'rgba(255, 255, 255, 0.03)',
    textAlign: 'center',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  uploadBadge: {
    width: '72px',
    height: '72px',
    borderRadius: '36px',
    background: 'rgba(0, 242, 255, 0.12)',
    color: '#00f2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 800,
    margin: '0 auto 18px',
  },
  uploadTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '12px',
  },
  uploadText: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  uploadSubtext: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  fileInfo: {
    background: 'rgba(0, 242, 255, 0.08)',
    border: '1px solid rgba(0, 242, 255, 0.2)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  fileName: {
    color: '#00f2ff',
    margin: 0,
    fontWeight: 700,
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    color: 'var(--bg-color)',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  inlineError: {
    color: '#fca5a5',
    margin: 0,
    fontSize: '14px',
  },
  resultsLayout: {
    display: 'grid',
    gap: '20px',
  },
  resultSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    display: 'grid',
    gap: '14px',
  },
  sectionPanel: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    display: 'grid',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    margin: 0,
  },
  sectionText: {
    margin: 0,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  metricCard: {
    borderRadius: '12px',
    padding: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    display: 'grid',
    gap: '8px',
  },
  metricLabel: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  metricValue: {
    color: 'var(--text-color)',
    fontSize: '16px',
  },
  listBlock: {
    display: 'grid',
    gap: '10px',
  },
  listItem: {
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  manualSection: {
    display: 'grid',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  formInput: {
    padding: '12px 14px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '10px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  formSelect: {
    padding: '12px 14px',
    background: 'var(--border-color)',
    border: '1px solid #262626',
    borderRadius: '10px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  choiceCard: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '18px',
    color: 'var(--text-color)',
    display: 'grid',
    gap: '8px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  choiceCardActive: {
    borderColor: '#00f2ff',
    background: 'rgba(0, 242, 255, 0.08)',
  },
  choiceTag: {
    width: '38px',
    height: '38px',
    borderRadius: '19px',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
  },
  choiceTitle: {
    fontSize: '15px',
  },
  choiceMeta: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  sectionActions: {
    display: 'grid',
    gap: '12px',
    alignItems: 'start',
  },
  sidebar: {
    width: '360px',
    background: 'rgba(10, 10, 10, 0.92)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  sidebarPill: {
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-muted)',
  },
  providerPanel: {
    padding: '18px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'grid',
    gap: '10px',
  },
  providerPanelTitle: {
    color: 'var(--text-color)',
  },
  providerPanelText: {
    margin: 0,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    fontSize: '13px',
  },
  providerBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  providerBadge: {
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
  },
  providerBadgeLive: {
    background: 'rgba(34, 197, 94, 0.16)',
    color: '#86efac',
  },
  providerBadgeMuted: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#fcd34d',
  },
  activityList: {
    padding: '18px 20px',
    display: 'grid',
    gap: '12px',
    overflowY: 'auto',
  },
  activityCard: {
    borderRadius: '14px',
    padding: '14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'grid',
    gap: '10px',
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
  },
  activityTitle: {
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  activityText: {
    margin: 0,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    fontSize: '13px',
  },
  activityMeta: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  activityStatus: {
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  activityStatusSuccess: {
    background: 'rgba(34, 197, 94, 0.16)',
    color: '#86efac',
  },
  activityStatusError: {
    background: 'rgba(239, 68, 68, 0.14)',
    color: '#fca5a5',
  },
  stateCard: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.04)',
    textAlign: 'center',
    display: 'grid',
    gap: '12px',
  },
  stateTitle: {
    margin: 0,
    color: 'var(--text-color)',
    fontSize: '20px',
  },
  stateText: {
    margin: 0,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  stateButton: {
    justifySelf: 'center',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
    color: 'var(--bg-color)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  skeletonTitle: {
    height: '20px',
    width: '50%',
    margin: '0 auto',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.10)',
  },
  skeletonText: {
    height: '14px',
    width: '60%',
    margin: '0 auto',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonTextWide: {
    height: '14px',
    width: '78%',
    margin: '0 auto',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  skeletonBox: {
    height: '88px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.08)',
  },
};
