import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';

/**
 * Apply pass 5 frontend: deterministic A/B cohort + patch registry.
 * Wires the new BE endpoints `/api/ab-cohorts/*` and `/api/patches/*`.
 */

export default function ABAndPatches() {
  const [tab, setTab] = useState('ab');
  return (
    <div className="page">
      <header className="page-header">
        <h1>A/B Cohorts & Patch Registry</h1>
        <p>Deterministic cohort bucketing and patch lifecycle (draft → staged → live).</p>
      </header>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={tab === 'ab' ? 'btn-primary' : 'btn'} onClick={() => setTab('ab')}>A/B Cohorts</button>
        <button className={tab === 'patches' ? 'btn-primary' : 'btn'} onClick={() => setTab('patches')}>Patches</button>
      </div>
      {tab === 'ab' ? <AB /> : <Patches />}
    </div>
  );
}

function AB() {
  const [exps, setExps] = useState([]);
  const [form, setForm] = useState({ key: '', description: '', cohorts: '[{"name":"control","allocation_pct":50},{"name":"treatment","allocation_pct":50}]' });
  const [assignForm, setAssignForm] = useState({ experiment_key: '', subject_id: '' });
  const [preview, setPreview] = useState(null);
  const [sample, setSample] = useState({ baseline_rate: 0.5, mde: 0.05 });
  const [sampleResult, setSampleResult] = useState(null);
  const [error, setError] = useState(null);
  const refresh = async () => { try { setExps(await apiGet('/ab-cohorts/experiments')); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);

  const submitExp = async (e) => {
    e.preventDefault(); setError(null);
    try {
      await apiPost('/ab-cohorts/experiments', { ...form, cohorts: JSON.parse(form.cohorts) });
      refresh();
    } catch (err) { setError(err.message); }
  };
  const assign = async (e) => {
    e.preventDefault(); setError(null);
    try { setPreview(await apiPost('/ab-cohorts/assign', assignForm)); } catch (err) { setError(err.message); }
  };
  const previewDist = async () => {
    try { setPreview(await apiPost('/ab-cohorts/preview', { cohorts: JSON.parse(form.cohorts), sample: 5000 })); } catch (err) { setError(err.message); }
  };
  const calcSample = async () => {
    try { setSampleResult(await apiPost('/ab-cohorts/sample-size', sample)); } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      {error && <div className="status-badge error">{error}</div>}
      <form onSubmit={submitExp} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder="experiment key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required />
        <input placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea rows={3} value={form.cohorts} onChange={(e) => setForm({ ...form, cohorts: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary">Create / replace</button>
          <button type="button" className="btn" onClick={previewDist}>Preview distribution</button>
        </div>
      </form>
      <form onSubmit={assign} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="experiment_key" value={assignForm.experiment_key} onChange={(e) => setAssignForm({ ...assignForm, experiment_key: e.target.value })} required />
        <input placeholder="subject_id" value={assignForm.subject_id} onChange={(e) => setAssignForm({ ...assignForm, subject_id: e.target.value })} required />
        <button type="submit" className="btn-primary">Assign</button>
      </form>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <input type="number" step="0.01" value={sample.baseline_rate} onChange={(e) => setSample({ ...sample, baseline_rate: Number(e.target.value) })} />
        <input type="number" step="0.01" value={sample.mde} onChange={(e) => setSample({ ...sample, mde: Number(e.target.value) })} />
        <button className="btn" onClick={calcSample}>Sample size</button>
      </div>
      {preview && <pre>{JSON.stringify(preview, null, 2)}</pre>}
      {sampleResult && <pre>{JSON.stringify(sampleResult, null, 2)}</pre>}
      <h3>Experiments</h3>
      <ul>{exps.map((e) => <li key={e.id}>{e.key} ({e.status})</li>)}</ul>
    </div>
  );
}

function Patches() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ version_tag: '', title: '', description: '', changes: '[]' });
  const [error, setError] = useState(null);
  const refresh = async () => { try { setList(await apiGet('/patches')); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);
  const create = async (e) => {
    e.preventDefault(); setError(null);
    try {
      await apiPost('/patches', { ...form, changes: JSON.parse(form.changes || '[]') });
      setForm({ version_tag: '', title: '', description: '', changes: '[]' });
      refresh();
    } catch (err) { setError(err.message); }
  };
  const transition = async (id, status) => {
    try { await apiPost(`/patches/${id}/transition`, { status }); refresh(); } catch (err) { setError(err.message); }
  };
  return (
    <div className="card">
      {error && <div className="status-badge error">{error}</div>}
      <form onSubmit={create} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder="version_tag e.g. 1.4.2" value={form.version_tag} onChange={(e) => setForm({ ...form, version_tag: e.target.value })} required />
        <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea placeholder="changes JSON" value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} />
        <button type="submit" className="btn-primary">Create</button>
      </form>
      <ul>{list.map((p) => (
        <li key={p.id} style={{ marginBottom: 8 }}>
          <strong>{p.version_tag}</strong> · {p.title} · <em>{p.status}</em>
          {' '}<button className="btn" onClick={() => transition(p.id, 'staged')}>Stage</button>
          {' '}<button className="btn" onClick={() => transition(p.id, 'live')}>Go Live</button>
          {' '}<button className="btn" onClick={() => transition(p.id, 'rolled_back')}>Rollback</button>
        </li>
      ))}</ul>
    </div>
  );
}
