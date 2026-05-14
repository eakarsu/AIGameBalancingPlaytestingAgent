import { useEffect, useState } from 'react';
import { apiGet } from '../api';

const ENTITY_TYPES = ['character', 'weapon', 'item', 'skill', 'ability', 'General', 'adjustment', 'other'];

function groupByTargetElement(items) {
  const groups = {};
  items.forEach((item) => {
    const key = item.target_element || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

function StatusBadge({ value }) {
  if (!value) return null;
  return <span className={`status-badge ${value}`}>{value}</span>;
}

export default function BalanceRecommendations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadItems(1);
  }, []);

  const loadItems = (pageNum) => {
    setLoading(true);
    apiGet(`/balance?page=${pageNum}&limit=50`)
      .then((res) => {
        if (Array.isArray(res)) {
          setItems(res);
        } else {
          setItems(res.data || []);
          setPagination(res.pagination || { page: pageNum, limit: 50, total: 0, totalPages: 1 });
          setPage(pageNum);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const groups = groupByTargetElement(items);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>⚖️ Balance Recommendations</h1>
          <div className="subtitle">Saved AI balance recommendations — grouped by target element</div>
        </div>
      </div>

      {loading ? (
        <div className="ai-loading"><div className="spinner" /> Loading recommendations...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">⚖️</div>
          <h3>No Balance Recommendations Yet</h3>
          <p>Run AI balance analysis from the Balance Recommendations feature page to generate recommendations.</p>
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([entityType, recs]) => (
            <div key={entityType} style={{ marginBottom: 28 }}>
              <h2 style={{
                fontSize: 16,
                color: 'var(--primary-light)',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
                paddingBottom: 8,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{
                  background: 'rgba(99,102,241,0.15)',
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 13,
                }}>
                  {entityType}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
                  {recs.length} recommendation{recs.length !== 1 ? 's' : ''}
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recs.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      background: 'rgba(15,23,42,0.5)',
                      border: '1px solid rgba(99,102,241,0.15)',
                      borderRadius: 10,
                      padding: '14px 16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 600 }}>{rec.name}</span>
                        {rec.change_type && (
                          <span style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: rec.change_type === 'buff' ? 'rgba(16,185,129,0.15)' :
                              rec.change_type === 'nerf' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                            color: rec.change_type === 'buff' ? '#10b981' :
                              rec.change_type === 'nerf' ? '#ef4444' : 'var(--primary-light)',
                          }}>
                            {rec.change_type}
                          </span>
                        )}
                        {rec.priority && <StatusBadge value={rec.priority} />}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'center' }}>
                        {rec.game_title && <span>{rec.game_title}</span>}
                        {rec.current_value != null && rec.recommended_value != null && (
                          <span>
                            {rec.current_value} &rarr; <strong style={{ color: 'var(--primary-light)' }}>{rec.recommended_value}</strong>
                          </span>
                        )}
                        <StatusBadge value={rec.status} />
                      </div>
                    </div>

                    {expanded === rec.id && rec.notes && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: 'rgba(99,102,241,0.06)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: 300,
                        overflow: 'auto',
                      }}>
                        {rec.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '16px 0' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => loadItems(page - 1)}
              >
                &larr; Prev
              </button>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => loadItems(page + 1)}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
