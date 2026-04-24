import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

function formatColumnHeader(col) {
  return col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCellValue(val, col) {
  if (val === null || val === undefined) return '—';
  if (col === 'auto_apply' || col === 'threshold_alert') return val === true || val === 'true' ? 'Yes' : 'No';
  if (typeof val === 'number') {
    if (col.includes('rate') && !col.includes('drop_rate')) return `${val}%`;
    if (col.includes('pct')) return `${val}%`;
    return val.toLocaleString();
  }
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return String(val);
}

function StatusBadge({ value }) {
  if (!value) return null;
  return <span className={`status-badge ${value}`}>{value}</span>;
}

function AIOutput({ result }) {
  if (!result) return null;

  const formatContent = (text) => {
    // Convert markdown-like formatting to styled HTML
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
      // Bold markers
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} style={{ color: 'var(--primary-light)', marginTop: 12 }}>{line.slice(2, -2)}</h3>;
      }
      // List items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.slice(2);
        const boldMatch = content.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
        if (boldMatch) {
          return (
            <div key={i} style={{ padding: '4px 0 4px 16px', display: 'flex', gap: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>&#x2022;</span>
              <span><strong style={{ color: 'var(--accent)' }}>{boldMatch[1]}</strong>{boldMatch[2] ? `: ${boldMatch[2]}` : ''}</span>
            </div>
          );
        }
        return (
          <div key={i} style={{ padding: '4px 0 4px 16px', display: 'flex', gap: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>&#x2022;</span>
            <span>{content}</span>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\.\s(.*)/);
        return (
          <div key={i} style={{ padding: '4px 0 4px 16px', display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: 700, minWidth: 20 }}>{num[1]}.</span>
            <span>{num[2]}</span>
          </div>
        );
      }
      // Separator
      if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(99,102,241,0.15)', margin: '12px 0' }} />;
      // Empty line
      if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
      // Regular text
      // Handle inline bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ margin: '4px 0', lineHeight: 1.7 }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} style={{ color: 'var(--accent)' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <div className="ai-icon">🤖</div>
        <div>
          <div className="ai-label">AI Analysis Result</div>
        </div>
        {result.model && <div className="ai-model">{result.model}</div>}
      </div>
      <div className="ai-output-body">
        {formatContent(result.analysis)}
      </div>
      {result.usage && (
        <div className="ai-output-footer">
          <span>Tokens: {result.usage.total_tokens?.toLocaleString()}</span>
          <span>Prompt: {result.usage.prompt_tokens?.toLocaleString()}</span>
          <span>Completion: {result.usage.completion_tokens?.toLocaleString()}</span>
          {result.id && <span style={{ marginLeft: 'auto' }}>ID: {result.id.slice(0, 20)}...</span>}
        </div>
      )}
    </div>
  );
}

export default function FeaturePage({ feature }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(() => {
    setLoading(true);
    apiGet(feature.api)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [feature.api]);

  useEffect(() => {
    loadItems();
    setSelected(null);
    setShowForm(false);
    setAiResult(null);
    setSearch('');
  }, [feature.key, loadItems]);

  const handleRowClick = (item) => {
    setSelected(item);
    setAiResult(null);
  };

  const handleNew = () => {
    const initial = {};
    feature.fields.forEach((f) => {
      if (f.type === 'select' && f.options?.length) initial[f.key] = f.options[0];
      else if (f.type === 'number') initial[f.key] = '';
      else initial[f.key] = '';
    });
    setFormData(initial);
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    const data = {};
    feature.fields.forEach((f) => {
      data[f.key] = item[f.key] ?? '';
    });
    setFormData(data);
    setEditItem(item);
    setShowForm(true);
    setSelected(null);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await apiDelete(`${feature.api}/${item.id}`);
      loadItems();
      setSelected(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      // Convert numeric fields
      feature.fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key] !== '') {
          payload[f.key] = Number(payload[f.key]);
        }
      });

      if (editItem) {
        await apiPut(`${feature.api}/${editItem.id}`, payload);
      } else {
        await apiPost(feature.api, payload);
      }
      setShowForm(false);
      loadItems();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAiAnalyze = async (item) => {
    if (!feature.ai || !feature.aiEndpoint) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const body = buildAiPayload(feature.key, item);
      const result = await apiPost(feature.aiEndpoint, body);
      setAiResult(result);
    } catch (err) {
      setAiResult({ analysis: `Error: ${err.message}`, model: null, usage: null });
    } finally {
      setAiLoading(false);
    }
  };

  const buildAiPayload = (key, item) => {
    switch (key) {
      case 'playtests': return { sessionId: item.id, gameConfig: item };
      case 'difficulty': return { levelData: item, playerMetrics: { churn_rate: item.player_churn_rate, smoothness: item.smoothness_score } };
      case 'economy': return { economyData: item, inflationMetrics: { rate: item.inflation_rate, sink: item.sink_ratio, source: item.source_ratio } };
      case 'exploits': return { gameRules: { system: item.affected_system, game: item.game_title }, playerActions: { type: item.exploit_type, steps: item.reproduction_steps } };
      case 'progression': return { progressionData: item, playerSegments: { archetype: item.player_archetype, type: item.model_type } };
      case 'balance': return { gameStats: item, unitData: { element: item.target_element, current: item.current_value, recommended: item.recommended_value } };
      case 'meta': return { metaData: item, patchHistory: { strategy: item.dominant_strategy, diversity: item.meta_diversity_score } };
      case 'sentiment': return { feedbackData: item, source: item.source };
      default: return item;
    }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(item).some((v) => String(v).toLowerCase().includes(s));
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{feature.icon} {feature.label}</h1>
          <div className="subtitle">
            {feature.ai ? 'AI-Powered Feature' : 'Management Feature'} — {items.length} records
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          + New {feature.label.replace(/s$/, '').replace(/ Analysis$/, '').replace(/ Modeling$/, '')}
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={`Search ${feature.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="ai-loading"><div className="spinner" /> Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{feature.icon}</div>
          <h3>No {feature.label} Found</h3>
          <p>Create your first item to get started.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {feature.columns.map((col) => (
                  <th key={col}>{formatColumnHeader(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => handleRowClick(item)}>
                  {feature.columns.map((col) => (
                    <td key={col}>
                      {col === 'status' || col === 'priority' || col === 'severity' ? (
                        col === 'severity' && typeof item[col] === 'number' ? (
                          <span className={`severity ${item[col] >= 8 ? 'critical' : item[col] >= 5 ? 'medium' : 'low'}`}>
                            {item[col]}
                          </span>
                        ) : (
                          <StatusBadge value={item[col]} />
                        )
                      ) : col === 'rarity' ? (
                        <span className={`rarity-${item[col]}`} style={{ fontWeight: 600 }}>{item[col]}</span>
                      ) : col === 'trend' ? (
                        <span className={`trend-${item[col]}`} style={{ fontWeight: 600 }}>
                          {item[col] === 'up' ? '↑' : item[col] === 'down' ? '↓' : '→'} {item[col]}
                        </span>
                      ) : col === 'change_pct' ? (
                        <span className={item[col] >= 0 ? 'trend-up' : 'trend-down'} style={{ fontWeight: 600 }}>
                          {item[col] >= 0 ? '+' : ''}{formatCellValue(item[col], col)}
                        </span>
                      ) : (
                        formatCellValue(item[col], col)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{feature.icon} {selected.name}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-body">
              <div className="detail-grid">
                {feature.fields.map((f) => (
                  <div key={f.key} className={`detail-field ${f.type === 'textarea' ? '' : ''}`} style={f.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                    <label>{f.label}</label>
                    <div className="value">
                      {f.key === 'status' || f.key === 'priority' ? (
                        <StatusBadge value={selected[f.key]} />
                      ) : (
                        formatCellValue(selected[f.key], f.key) || '—'
                      )}
                    </div>
                  </div>
                ))}
                <div className="detail-field">
                  <label>Created</label>
                  <div className="value">{selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</div>
                </div>
                <div className="detail-field">
                  <label>Updated</label>
                  <div className="value">{selected.updated_at ? new Date(selected.updated_at).toLocaleString() : '—'}</div>
                </div>
              </div>

              {feature.ai && (
                <div style={{ marginTop: 20 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAiAnalyze(selected)}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Analyzing...' : '🤖 Run AI Analysis'}
                  </button>
                  {aiLoading && (
                    <div className="ai-loading" style={{ marginTop: 12 }}>
                      <div className="spinner" />
                      AI is analyzing this data via OpenRouter...
                    </div>
                  )}
                  {aiResult && <AIOutput result={aiResult} />}
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleEdit(selected)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(selected)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="detail-panel form-modal">
            <div className="detail-header">
              <h2>{editItem ? 'Edit' : 'New'} {feature.label.replace(/s$/, '')}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="detail-body">
                <div className="detail-grid">
                  {feature.fields.map((f) => (
                    <div key={f.key} className="form-group" style={f.type === 'textarea' ? { gridColumn: '1/-1' } : {}}>
                      <label>{f.label}{f.required ? ' *' : ''}</label>
                      {f.type === 'select' ? (
                        <select
                          value={formData[f.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        >
                          {f.options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          value={formData[f.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                          required={f.required}
                        />
                      ) : (
                        <input
                          type={f.type}
                          value={formData[f.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                          required={f.required}
                          step={f.type === 'number' ? 'any' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={saving}>
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
