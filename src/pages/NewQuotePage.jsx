import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const INITIAL_FORM = {
  origin: 'Busan Port',
  destination_region: 'Seoul Metro',
  destination_address: '101 Teheran-ro, Gangnam-gu, Seoul, KR',
  package_count: 10,
  total_weight_kg: 1450,
  total_cbm: 8.4,
  cargo_length_cm: 380,
  cargo_width_cm: 170,
  cargo_height_cm: 170,
};

export default function NewQuotePage() {
  const { token } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [rawText, setRawText] = useState(
    'Busan to Seoul, 12 packages, 1480kg, 8.5cbm, size 380x170x170cm\nAddress: 101 Teheran-ro, Gangnam-gu, Seoul, KR'
  );
  const [tariffs, setTariffs] = useState([]);
  const [result, setResult] = useState(null);
  const [parseDisclaimer, setParseDisclaimer] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    apiRequest('/reference/tariffs', {}, token).then(setTariffs).catch(() => {});
  }, [token]);

  const origins = useMemo(() => [...new Set(tariffs.map((t) => t.origin))], [tariffs]);
  const destinations = useMemo(() => [...new Set(tariffs.map((t) => t.destination_region))], [tariffs]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const response = await apiRequest('/quotes/calculate', { method: 'POST', body: JSON.stringify(form) }, token);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Quote creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onParse = async () => {
    setError('');
    setParseDisclaimer('');
    setParsing(true);
    try {
      const parsed = await apiRequest('/quotes/parse-text', { method: 'POST', body: JSON.stringify({ raw_text: rawText }) }, token);
      const { legal_disclaimer, ...fields } = parsed;
      setForm((prev) => ({ ...prev, ...fields }));
      if (legal_disclaimer) setParseDisclaimer(legal_disclaimer);
    } catch (err) {
      setError(err.message || 'Auto parse failed');
    } finally {
      setParsing(false);
    }
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <form onSubmit={onSubmit} className="g-card space-y-5">
        <div>
          <h2 className="text-xl font-medium text-g-on-surface">Create New Quotation</h2>
          <p className="mt-1 text-sm text-g-secondary">입력값을 저장하면 차량 자동 매칭 + LCL/FTL 비교 후 견적이 발행됩니다.</p>
        </div>

        {/* Auto parse */}
        <div className="rounded-2xl border border-g-outline bg-g-surface p-4 space-y-3">
          <p className="text-xs font-medium text-g-muted">Optional Auto Parse</p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={3}
            className="g-input resize-none"
            placeholder="Copy email/message text here..."
          />
          <button type="button" onClick={onParse} disabled={parsing}
            className="btn-tonal disabled:opacity-50">
            {parsing ? 'Parsing...' : 'Parse Text Into Fields'}
          </button>
          {parseDisclaimer && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              ⚠ {parseDisclaimer}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-g-on-surface">Origin Port</span>
            <select name="origin" value={form.origin} onChange={onChange} className="g-input">
              {origins.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-g-on-surface">Destination Region</span>
            <select name="destination_region" value={form.destination_region} onChange={onChange} className="g-input">
              {destinations.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="block text-xs font-medium text-g-on-surface">Destination Address (EN)</span>
            <input type="text" name="destination_address" value={form.destination_address} onChange={onChange} className="g-input" required />
          </label>

          {[
            { label: 'Package Count', name: 'package_count', min: '1', step: '1' },
            { label: 'Total Weight (kg)', name: 'total_weight_kg', min: '1', step: '0.1' },
            { label: 'Total CBM', name: 'total_cbm', min: '0.1', step: '0.1' },
            { label: 'Cargo Length (cm)', name: 'cargo_length_cm', min: '1', step: '1' },
            { label: 'Cargo Width (cm)', name: 'cargo_width_cm', min: '1', step: '1' },
            { label: 'Cargo Height (cm)', name: 'cargo_height_cm', min: '1', step: '1' },
          ].map(({ label, name, min, step }) => (
            <label key={name} className="space-y-1.5">
              <span className="block text-xs font-medium text-g-on-surface">{label}</span>
              <input type="number" name={name} min={min} step={step} value={form[name]} onChange={onChange} className="g-input" required />
            </label>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <button type="submit" disabled={submitting} className="btn-filled w-full py-3 disabled:opacity-50">
          {submitting ? 'Calculating...' : 'Calculate & Issue Quote'}
        </button>
      </form>

      <aside className="space-y-4">
        <div className="g-card">
          <h3 className="text-lg font-medium text-g-on-surface">Result</h3>
          {!result ? (
            <p className="mt-4 text-sm text-g-muted">견적 발행 후 상세 계산 결과가 표시됩니다.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-g-outline bg-g-surface p-3">
                <p className="text-xs font-medium text-g-muted">Quote No</p>
                <p className="mt-1 font-mono font-medium text-g-blue">{result.quote_no}</p>
              </div>
              <div className="space-y-2 text-g-secondary">
                <p><span className="text-g-muted">Mode: </span>
                  <span className="rounded border border-g-outline bg-g-surface px-1.5 py-0.5 text-xs text-g-on-surface">{result.service_mode}</span>
                </p>
                <p><span className="text-g-muted">Subtotal: </span>${result.subtotal_usd.toLocaleString('en-US')}</p>
                <p><span className="text-g-muted">Surcharge: </span>${result.surcharge_usd.toLocaleString('en-US')}</p>
                <p><span className="text-g-muted">Discount: </span>-${result.discount_usd.toLocaleString('en-US')}</p>
                <div className="rounded-2xl border border-g-blue/20 bg-g-blue-container p-3">
                  <p className="font-medium text-g-on-surface">Final: ${result.final_usd.toLocaleString('en-US')}</p>
                  <p className="mt-0.5 text-xs text-g-blue">{result.final_krw.toLocaleString('ko-KR')} KRW</p>
                </div>
                <p><span className="text-g-muted">Oversize: </span>{result.pricing_breakdown?.oversize ? 'Yes (surcharge applied)' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
