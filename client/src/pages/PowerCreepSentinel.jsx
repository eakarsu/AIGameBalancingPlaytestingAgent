import { useState } from 'react';

export default function PowerCreepSentinel() {
  const [form, setForm] = useState({ currentWinRate: 58, previousWinRate: 51, pickRate: 24, banRate: 16, patchAgeDays: 5 });
  const [result, setResult] = useState(null);

  const submit = async () => {
    const response = await fetch('/api/power-creep-sentinel/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };

  return (
    <div className="page">
      <h1>Power Creep Sentinel</h1>
      <div className="card">
        {Object.entries(form).map(([key, value]) => (
          <label key={key}>{key.replace(/([A-Z])/g, ' $1')}
            <input type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
          </label>
        ))}
        <button className="btn btn-primary" onClick={submit}>Score creep</button>
      </div>
      {result && <div className="card"><h2>{result.level.toUpperCase()} · {result.score}/100</h2><ul>{result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    </div>
  );
}
