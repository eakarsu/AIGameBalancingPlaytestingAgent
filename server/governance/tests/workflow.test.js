'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

test('domain workflow accepts a reviewable, grounded case', () => {
  const evaluation = evaluate({
  build: { version: '1.4.0', sha256: 'b'.repeat(64) },
  configuration: { version: 'cfg-9', seed: 42 },
  metrics: [{ id: 'win-rate', formula: 'wins / matches', unit: 'ratio', window: 'match' }],
  cohorts: [
    { id: 'control', sampleSize: 60, synthetic: false, containsMinorData: false },
    { id: 'bots', sampleSize: 60, synthetic: true, containsMinorData: false }
  ],
  outcomes: [{ metricId: 'win-rate', regression: false }]
});
  assert.deepEqual(evaluation.errors, []);
  assert.equal(evaluation.result.decision, 'reviewable');
  assert.ok(Array.isArray(evaluation.assumptions));
  assert.equal(typeof evaluation.uncertainty, 'object');
});

test('domain workflow fails closed on unsafe or incomplete input', () => {
  const evaluation = evaluate({ build: {}, configuration: {}, metrics: [], cohorts: [{ id: 'minor', sampleSize: 2, containsMinorData: true }] });
  assert.ok(evaluation.errors.length > 0);
  assert.notEqual(evaluation.result.decision, 'reviewable');
});
