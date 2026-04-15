import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import AuthGateModal from '../../components/auth/authGateModal';
import { useAuthStore } from '../../store/authStore';
import { aiService } from '../../services/aiService';

const GUEST_LIMIT = 3;
const CHAT_STORAGE_KEY = 'cb_ai_messages';
const GUEST_COUNT_KEY = 'cb_ai_guest_count';
const THREAD_STORAGE_KEY = 'cb_ai_thread_id';

function lsGet(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value, currency = 'RWF') {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normaliseMessage(message) {
  return {
    role: message.role === 'assistant' || message.role === 'model' ? 'model' : 'user',
    content: message.content || message.body || '',
  };
}

function firstNonEmptyArray(source, keys) {
  for (const key of keys) {
    if (Array.isArray(source?.[key]) && source[key].length) {
      return source[key];
    }
  }
  return [];
}

function readString(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function LoadingCard({ label }) {
  return (
    <div style={styles.resultState}>
      <div style={styles.spinner} />
      <h3 style={styles.resultTitle}>Loading</h3>
      <p style={styles.resultText}>{label}</p>
    </div>
  );
}

function ErrorCard({ title, message, onRetry }) {
  return (
    <div style={styles.resultState}>
      <div style={styles.resultIcon}>!</div>
      <h3 style={styles.resultTitle}>{title}</h3>
      <p style={styles.resultText}>{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyCard({ title, message }) {
  return (
    <div style={styles.resultState}>
      <div style={styles.resultIcon}>0</div>
      <h3 style={styles.resultTitle}>{title}</h3>
      <p style={styles.resultText}>{message}</p>
    </div>
  );
}

function ResultList({ title, items, renderItem }) {
  if (!items.length) return null;
  return (
    <div style={styles.resultBlock}>
      <h4 style={styles.resultBlockTitle}>{title}</h4>
      <div style={styles.resultList}>
        {items.map((item, index) => (
          <div key={`${title}-${index}`} style={styles.resultListItem}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

function EstimateResult({ result }) {
  const options = firstNonEmptyArray(result, ['options', 'feasibleOptions', 'recommendations']);
  const risks = firstNonEmptyArray(result, ['risks', 'flaggedRisks', 'warnings']);
  const summary = readString(result, ['summary', 'recommendation', 'overview']);

  return (
    <div style={styles.resultContent}>
      <div style={styles.resultHero}>
        <span style={styles.resultLabel}>Feasibility summary</span>
        <h3 style={styles.resultHeadline}>{summary || 'Feasible options generated from the live AI estimation endpoint.'}</h3>
      </div>
      <ResultList
        title="Options"
        items={options}
        renderItem={(item) => (
          <>
            <strong style={styles.resultItemTitle}>{readString(item, ['title', 'name', 'option']) || 'Option'}</strong>
            <p style={styles.resultItemText}>{readString(item, ['description', 'summary', 'notes']) || JSON.stringify(item)}</p>
            {item.estimatedCost || item.costRange ? (
              <span style={styles.resultMeta}>{item.estimatedCost || item.costRange}</span>
            ) : null}
          </>
        )}
      />
      <ResultList
        title="Flagged risks"
        items={risks}
        renderItem={(item) => (
          <>
            <strong style={styles.resultItemTitle}>{readString(item, ['title', 'risk', 'name']) || 'Risk'}</strong>
            <p style={styles.resultItemText}>{readString(item, ['description', 'details', 'impact']) || JSON.stringify(item)}</p>
          </>
        )}
      />
      {!options.length && !risks.length ? (
        <pre style={styles.resultJson}>{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </div>
  );
}

function PlanResult({ result, currency }) {
  const boqItems = firstNonEmptyArray(result, ['boq', 'boqItems', 'materials']);
  const procurement = firstNonEmptyArray(result, ['procurementGuide', 'materialProcurementGuide']);
  const summary = readString(result, ['summary', 'overview', 'planSummary']);
  const planName = readString(result, ['title', 'planName', 'name']);

  return (
    <div style={styles.resultContent}>
      <div style={styles.resultHero}>
        <span style={styles.resultLabel}>Plan specification</span>
        <h3 style={styles.resultHeadline}>{planName || 'AI-generated architectural plan'}</h3>
        <p style={styles.resultText}>{summary || 'Generated from the live plan generation endpoint with structured BOQ output.'}</p>
      </div>
      <ResultList
        title="BOQ items"
        items={boqItems}
        renderItem={(item) => (
          <div style={styles.boqRow}>
            <div>
              <strong style={styles.resultItemTitle}>{readString(item, ['item', 'name', 'material']) || 'Material item'}</strong>
              <p style={styles.resultItemText}>{readString(item, ['description', 'notes']) || 'Structured quantity and pricing returned by the AI service.'}</p>
            </div>
            <div style={styles.boqMeta}>
              <span>{item.quantity || item.qty || '-'}</span>
              <span>{item.unit || '-'}</span>
              <span>{formatCurrency(item.totalCost || item.cost || item.unitCost || 0, currency)}</span>
            </div>
          </div>
        )}
      />
      <ResultList
        title="Procurement guide"
        items={procurement}
        renderItem={(item) => (
          <>
            <strong style={styles.resultItemTitle}>{readString(item, ['title', 'material', 'name']) || 'Procurement step'}</strong>
            <p style={styles.resultItemText}>{readString(item, ['description', 'guidance', 'notes']) || JSON.stringify(item)}</p>
          </>
        )}
      />
      {!boqItems.length && !procurement.length ? (
        <pre style={styles.resultJson}>{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </div>
  );
}

export default function Intelligence() {
  const nav = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const authed = isAuthenticated;
  const listRef = useRef(null);

  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState(() => lsGet(CHAT_STORAGE_KEY, [
    {
      role: 'model',
      content: 'Hi! I am CivilBridge Intelligence. Ask about plans, BOQ, costs, permits, or project steps.',
    },
  ]));
  const [guestCount, setGuestCount] = useState(() => lsGet(GUEST_COUNT_KEY, 0));
  const [threadId, setThreadId] = useState(() => lsGet(THREAD_STORAGE_KEY, null));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [providerState, setProviderState] = useState({ loading: authed, error: '', data: null });
  const [estimateForm, setEstimateForm] = useState({ idea: '', budgetRange: '', location: '', timeline: '' });
  const [planForm, setPlanForm] = useState({ budget: '', currency: 'RWF', preferences: '', location: '', upiData: '' });
  const [estimateState, setEstimateState] = useState({ loading: false, error: '', data: null, lastPayload: null });
  const [planState, setPlanState] = useState({ loading: false, error: '', data: null, lastPayload: null });

  useEffect(() => {
    lsSet(CHAT_STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    lsSet(GUEST_COUNT_KEY, guestCount);
  }, [guestCount]);

  useEffect(() => {
    lsSet(THREAD_STORAGE_KEY, threadId);
  }, [threadId]);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [busy, messages]);

  useEffect(() => {
    if (!authed) {
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
  }, [authed]);

  useEffect(() => {
    if (!authed || !threadId) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const response = await aiService.getMessages(threadId);
        if (cancelled) return;
        const nextMessages = response?.messages?.map(normaliseMessage) || [];
        if (nextMessages.length) {
          setMessages(nextMessages);
        }
      } catch {
        if (!cancelled) {
          setThreadId(null);
        }
      }
    };

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [authed, threadId]);

  const remaining = useMemo(() => {
    if (authed) return Infinity;
    return Math.max(0, GUEST_LIMIT - guestCount);
  }, [authed, guestCount]);

  const canSend = authed || guestCount < GUEST_LIMIT;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    if (!authed && !canSend) {
      setShowGate(true);
      return;
    }

    setInput('');
    setBusy(true);
    setChatError('');
    setMessages((current) => [...current, { role: 'user', content: text }]);

    try {
      if (authed) {
        let activeThreadId = threadId;
        if (!activeThreadId) {
          const threadResponse = await aiService.createThread({ title: 'Website Intelligence', contextType: 'general' });
          activeThreadId = threadResponse?.thread_id;
          setThreadId(activeThreadId);
        }

        const response = await aiService.sendMessage(activeThreadId, text);
        setMessages((current) => [...current, { role: 'model', content: response?.response || 'No reply returned.' }]);
      } else {
        const response = await aiService.guestChat(text);
        setGuestCount((current) => current + 1);
        setMessages((current) => [...current, { role: 'model', content: response?.response || 'No reply returned.' }]);
      }
    } catch (error) {
      setChatError(error.message || 'AI failed');
      setMessages((current) => [...current, { role: 'model', content: 'Sorry, something failed. Try again.' }]);
    } finally {
      setBusy(false);
    }
  }, [authed, busy, canSend, input, threadId]);

  const handleEstimate = useCallback(async (payload = estimateForm) => {
    if (!authed) {
      setShowGate(true);
      return;
    }

    try {
      setEstimateState({ loading: true, error: '', data: null, lastPayload: payload });
      const response = await aiService.estimateProject(payload);
      setEstimateState({ loading: false, error: '', data: response?.estimation || null, lastPayload: payload });
    } catch (error) {
      setEstimateState({ loading: false, error: error.message || 'Failed to generate estimation.', data: null, lastPayload: payload });
    }
  }, [authed, estimateForm]);

  const handlePlanGeneration = useCallback(async (payload = planForm) => {
    if (!authed) {
      setShowGate(true);
      return;
    }

    try {
      setPlanState({ loading: true, error: '', data: null, lastPayload: payload });
      const response = await aiService.generatePlan(payload);
      setPlanState({ loading: false, error: '', data: response?.plan || null, lastPayload: payload });
    } catch (error) {
      setPlanState({ loading: false, error: error.message || 'Failed to generate plan.', data: null, lastPayload: payload });
    }
  }, [authed, planForm]);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }, [send]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        role: 'model',
        content: 'Hi! I am CivilBridge Intelligence. Ask about plans, BOQ, costs, permits, or project steps.',
      },
    ]);
    setChatError('');
    if (!authed) {
      setGuestCount(0);
    } else {
      setThreadId(null);
    }
  }, [authed]);

  const providerSummary = providerState.data
    ? `${providerState.data.defaultProvider || 'gemini'} default · ${providerState.data.routing?.analyzePlanPdf || 'claude'} for PDF analysis`
    : 'Authentication required to read provider routing.';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 18px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#0c1220', letterSpacing: '-0.02em' }}>
            Intelligence
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64708a', fontWeight: 650, maxWidth: 720 }}>
            Live AI estimation and plan generation, with guest chat still available for quick questions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {!authed ? (
            <div style={styles.statusPill}>
              Guest messages left: <span style={{ color: '#1d4ed8' }}>{remaining}</span>
            </div>
          ) : (
            <div style={styles.statusPill}>Logged in · Advanced AI unlocked</div>
          )}

          <button onClick={resetChat} style={primaryGhostBtn}>New chat</button>
        </div>
      </div>

      <div style={styles.tabRow}>
        {[
          { id: 'chat', label: 'Chat' },
          { id: 'estimate', label: 'Estimate' },
          { id: 'generate', label: 'Generate Plan' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.tabButtonActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {authed ? (
        <div style={styles.providerRibbon}>
          {providerState.loading ? 'Loading provider routing...' : providerState.error ? providerState.error : providerSummary}
        </div>
      ) : null}

      {activeTab === 'chat' ? (
        <div style={styles.panelShell}>
          <div
            ref={listRef}
            style={styles.chatBody}
          >
            {messages.map((message, index) => (
              <Bubble key={index} role={message.role} text={message.content} />
            ))}
            {busy ? <Bubble role="model" text="Thinking..." dim /> : null}
          </div>

          {chatError ? (
            <div style={styles.chatErrorBar}>{chatError}</div>
          ) : null}

          <div style={styles.composerWrap}>
            {!authed && !canSend ? (
              <div style={styles.gateCard}>
                <div style={{ color: '#0c1220', fontWeight: 850 }}>
                  Guest limit reached. Please sign in to continue.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowGate(true)} style={primaryBtn}>Continue</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about BOQ, costs, permits, steps, or materials..."
                  rows={2}
                  style={styles.textArea}
                />
                <button onClick={send} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'estimate' ? (
        <div style={styles.toolLayout}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Project Estimation</h2>
            <p style={styles.formSubtitle}>Submit the client idea and budget range to get feasible options and flagged risks.</p>
            <textarea
              rows={4}
              value={estimateForm.idea}
              onChange={(event) => setEstimateForm((current) => ({ ...current, idea: event.target.value }))}
              placeholder="Describe the project idea"
              style={styles.formTextArea}
            />
            <input
              value={estimateForm.budgetRange}
              onChange={(event) => setEstimateForm((current) => ({ ...current, budgetRange: event.target.value }))}
              placeholder="Budget range"
              style={styles.formInput}
            />
            <input
              value={estimateForm.location}
              onChange={(event) => setEstimateForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
              style={styles.formInput}
            />
            <input
              value={estimateForm.timeline}
              onChange={(event) => setEstimateForm((current) => ({ ...current, timeline: event.target.value }))}
              placeholder="Preferred timeline"
              style={styles.formInput}
            />
            <Button onClick={() => handleEstimate()} loading={estimateState.loading}>Generate Estimation</Button>
          </div>
          <div style={styles.resultCard}>
            {!authed ? (
              <ErrorCard
                title="Sign in required"
                message="The live estimation endpoint is protected, so advanced AI estimations are available after login."
                onRetry={() => setShowGate(true)}
              />
            ) : estimateState.loading ? (
              <LoadingCard label="Running the live estimation workflow..." />
            ) : estimateState.error ? (
              <ErrorCard title="Estimation failed" message={estimateState.error} onRetry={() => estimateState.lastPayload && handleEstimate(estimateState.lastPayload)} />
            ) : !estimateState.data ? (
              <EmptyCard title="No estimation yet" message="Submit the form to fetch feasible options and flagged risks from the AI estimation endpoint." />
            ) : (
              <EstimateResult result={estimateState.data} />
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'generate' ? (
        <div style={styles.toolLayout}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Plan Generation</h2>
            <p style={styles.formSubtitle}>Generate a plan specification and BOQ from budget, preferences, location, and UPI data.</p>
            <input
              value={planForm.budget}
              onChange={(event) => setPlanForm((current) => ({ ...current, budget: event.target.value }))}
              placeholder="Budget"
              style={styles.formInput}
            />
            <input
              value={planForm.currency}
              onChange={(event) => setPlanForm((current) => ({ ...current, currency: event.target.value }))}
              placeholder="Currency"
              style={styles.formInput}
            />
            <textarea
              rows={4}
              value={planForm.preferences}
              onChange={(event) => setPlanForm((current) => ({ ...current, preferences: event.target.value }))}
              placeholder="Preferences"
              style={styles.formTextArea}
            />
            <input
              value={planForm.location}
              onChange={(event) => setPlanForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
              style={styles.formInput}
            />
            <textarea
              rows={3}
              value={planForm.upiData}
              onChange={(event) => setPlanForm((current) => ({ ...current, upiData: event.target.value }))}
              placeholder="UPI data"
              style={styles.formTextArea}
            />
            <Button onClick={() => handlePlanGeneration()} loading={planState.loading}>Generate Plan</Button>
          </div>
          <div style={styles.resultCard}>
            {!authed ? (
              <ErrorCard
                title="Sign in required"
                message="The live plan generation endpoint is protected, so authenticated users can generate structured plan specifications and BOQs here."
                onRetry={() => setShowGate(true)}
              />
            ) : planState.loading ? (
              <LoadingCard label="Generating the live plan package..." />
            ) : planState.error ? (
              <ErrorCard title="Plan generation failed" message={planState.error} onRetry={() => planState.lastPayload && handlePlanGeneration(planState.lastPayload)} />
            ) : !planState.data ? (
              <EmptyCard title="No plan generated yet" message="Submit the form to fetch a real plan specification and BOQ from the AI plan generation endpoint." />
            ) : (
              <PlanResult result={planState.data} currency={planForm.currency || 'RWF'} />
            )}
          </div>
        </div>
      ) : null}

      <AuthGateModal
        open={showGate}
        onClose={() => setShowGate(false)}
        onGoLogin={() => nav('/login')}
        onGoRegister={() => nav('/register')}
      />
    </div>
  );
}

function Bubble({ role, text, dim }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div
        style={{
          maxWidth: 720,
          padding: '12px 14px',
          borderRadius: 16,
          border: '1px solid #eef0f4',
          background: isUser ? 'linear-gradient(135deg,#2a66ff,#1d4ed8)' : '#fff',
          color: isUser ? '#fff' : '#0c1220',
          boxShadow: isUser ? '0 14px 26px rgba(29,78,216,.18)' : '0 10px 24px rgba(12,18,32,.05)',
          fontWeight: 650,
          lineHeight: 1.55,
          opacity: dim ? 0.75 : 1,
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(65, 89, 157, 0.2)',
  background: 'linear-gradient(135deg,#2a66ff,#1d4ed8)',
  color: '#fff',
  fontWeight: 950,
  cursor: 'pointer',
  boxShadow: '0 14px 26px rgba(29,78,216,.18)',
};

const primaryGhostBtn = {
  padding: '10px 12px',
  borderRadius: 14,
  border: '1px solid #eef0f4',
  background: '#fff',
  fontWeight: 900,
  cursor: 'pointer',
};

const styles = {
  statusPill: {
    padding: '10px 12px',
    borderRadius: 14,
    border: '1px solid #eef0f4',
    background: 'linear-gradient(135deg,#ffffff,#f7f9ff)',
    color: '#0c1220',
    fontWeight: 850,
    fontSize: 13,
  },
  tabRow: {
    display: 'flex',
    gap: 10,
    marginTop: 18,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  tabButton: {
    padding: '10px 14px',
    borderRadius: 14,
    border: '1px solid #e5ebf7',
    background: '#fff',
    color: '#51607a',
    fontWeight: 800,
    cursor: 'pointer',
  },
  tabButtonActive: {
    background: 'linear-gradient(135deg,#2a66ff,#1d4ed8)',
    color: '#fff',
    borderColor: 'transparent',
    boxShadow: '0 14px 26px rgba(29,78,216,.18)',
  },
  providerRibbon: {
    marginBottom: 14,
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid #eef0f4',
    background: '#fff',
    color: '#51607a',
    fontWeight: 700,
  },
  panelShell: {
    marginTop: 8,
    border: '1px solid #eef0f4',
    borderRadius: 18,
    background: '#fff',
    overflow: 'hidden',
    boxShadow: '0 14px 40px rgba(12,18,32,.06)',
  },
  chatBody: {
    height: '62vh',
    minHeight: 420,
    padding: 16,
    overflow: 'auto',
    background: 'radial-gradient(900px 420px at 0% 0%, rgba(42,102,255,0.08), transparent 60%), linear-gradient(180deg,#ffffff,#fbfcff)',
  },
  chatErrorBar: {
    padding: '10px 14px',
    borderTop: '1px solid #eef0f4',
    background: '#fff1f2',
    color: '#9f1239',
    fontWeight: 750,
  },
  composerWrap: {
    borderTop: '1px solid #eef0f4',
    padding: 12,
    background: '#fff',
  },
  gateCard: {
    padding: 12,
    borderRadius: 14,
    border: '1px solid #eef0f4',
    background: 'linear-gradient(135deg,#ffffff,#f7f9ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textArea: {
    flex: 1,
    resize: 'none',
    padding: '12px 12px',
    borderRadius: 14,
    border: '1px solid #e9ecf2',
    outline: 'none',
    fontWeight: 650,
  },
  toolLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 360px) minmax(0, 1fr)',
    gap: 18,
    alignItems: 'start',
  },
  formCard: {
    border: '1px solid #eef0f4',
    borderRadius: 18,
    background: '#fff',
    padding: 18,
    boxShadow: '0 14px 40px rgba(12,18,32,.06)',
    display: 'grid',
    gap: 12,
  },
  formTitle: {
    margin: 0,
    fontSize: 22,
    color: '#0c1220',
    letterSpacing: '-0.02em',
  },
  formSubtitle: {
    margin: 0,
    color: '#64708a',
    fontWeight: 650,
    lineHeight: 1.5,
  },
  formInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid #e9ecf2',
    outline: 'none',
    fontWeight: 650,
    boxSizing: 'border-box',
  },
  formTextArea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid #e9ecf2',
    outline: 'none',
    fontWeight: 650,
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  resultCard: {
    border: '1px solid #eef0f4',
    borderRadius: 18,
    background: '#fff',
    minHeight: 520,
    boxShadow: '0 14px 40px rgba(12,18,32,.06)',
    overflow: 'hidden',
  },
  resultState: {
    minHeight: 520,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    textAlign: 'center',
    padding: 24,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(42,102,255,0.08)',
    color: '#1d4ed8',
    fontWeight: 900,
    fontSize: 20,
  },
  resultTitle: {
    margin: 0,
    color: '#0c1220',
    fontSize: 22,
  },
  resultText: {
    margin: 0,
    color: '#64708a',
    fontWeight: 650,
    lineHeight: 1.6,
    maxWidth: 620,
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid #dbe3f1',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  resultContent: {
    padding: 20,
    display: 'grid',
    gap: 20,
  },
  resultHero: {
    padding: 18,
    borderRadius: 16,
    background: 'linear-gradient(135deg,#f7f9ff,#eef4ff)',
    border: '1px solid #e5ebf7',
  },
  resultLabel: {
    display: 'inline-block',
    marginBottom: 8,
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  resultHeadline: {
    margin: 0,
    color: '#0c1220',
    fontSize: 22,
    lineHeight: 1.3,
  },
  resultBlock: {
    display: 'grid',
    gap: 12,
  },
  resultBlockTitle: {
    margin: 0,
    color: '#0c1220',
    fontSize: 18,
  },
  resultList: {
    display: 'grid',
    gap: 12,
  },
  resultListItem: {
    padding: 16,
    borderRadius: 14,
    border: '1px solid #eef0f4',
    background: '#fff',
    display: 'grid',
    gap: 8,
  },
  resultItemTitle: {
    color: '#0c1220',
    fontSize: 15,
  },
  resultItemText: {
    margin: 0,
    color: '#64708a',
    lineHeight: 1.6,
    fontWeight: 600,
  },
  resultMeta: {
    color: '#1d4ed8',
    fontWeight: 800,
    fontSize: 13,
  },
  resultJson: {
    margin: 0,
    padding: 16,
    borderRadius: 14,
    background: '#f7f9ff',
    color: '#334155',
    overflow: 'auto',
    fontSize: 13,
    lineHeight: 1.5,
  },
  boqRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  boqMeta: {
    display: 'grid',
    gap: 6,
    minWidth: 130,
    color: '#1d4ed8',
    fontWeight: 800,
    textAlign: 'right',
  },
};
