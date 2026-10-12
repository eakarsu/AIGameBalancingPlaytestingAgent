import { useState } from 'react';
import AIReport from '../components/AIReport';
import FullFieldPresets from '../components/FullFieldPresets';

const PRESETS = [
  { label: 'Stable baseline', values: { currentWinRate: 51, previousWinRate: 50, pickRate: 18, banRate: 7, patchAgeDays: 21 } },
  { label: 'Emerging risk', values: { currentWinRate: 56, previousWinRate: 51, pickRate: 27, banRate: 19, patchAgeDays: 8 } },
  { label: 'Critical spike', values: { currentWinRate: 63, previousWinRate: 52, pickRate: 39, banRate: 34, patchAgeDays: 3 } },
];

export default function PowerCreepSentinel() {
  const [form, setForm] = useState(PRESETS[0].values);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/power-creep-sentinel/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      setResult(data);
    } catch (failure) {
      setError(failure.message || 'Scoring failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Power Creep Sentinel</h1>
      <div className="card">
        <FullFieldPresets value={form} presets={PRESETS} disabled={loading} onChange={(next) => { setForm(next); setResult(null); setError(''); }} />
        {Object.entries(form).map(([key, value]) => (
          <label key={key}>{key.replace(/([A-Z])/g, ' $1')}
            <input type="number" value={value} onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })} />
          </label>
        ))}
        <button className="btn btn-primary" disabled={loading} onClick={submit}>{loading ? 'Scoring…' : 'Score creep'}</button>
      </div>
      <AIReport response={result} error={error} loading={loading} title="Power creep score" />
    </div>
  );
}
