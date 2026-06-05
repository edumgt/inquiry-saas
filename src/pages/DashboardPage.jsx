import { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryData, rateData] = await Promise.all([
          apiRequest('/dashboard/summary', {}, token),
          apiRequest('/reference/exchange-rate', {}, token),
        ]);
        setSummary(summaryData);
        setExchangeRate(rateData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      }
    };
    load();
  }, [token]);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Total Quotes', value: summary.total_quotes, hint: 'All issued quotations' },
      { label: 'This Month', value: summary.quotes_this_month, hint: 'Quotes this month' },
      { label: 'Average Quote', value: usd.format(summary.avg_quote_usd || 0), hint: 'Mean quoted amount (USD)' },
      { label: 'LCL Ratio', value: `${summary.lcl_ratio_pct}%`, hint: 'Share of LCL quotes' },
    ];
  }, [summary]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        {/* Latest quotes table */}
        <div className="g-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-g-outline">
            <h2 className="text-base font-medium text-g-on-surface">Latest Quotations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-g-outline bg-g-surface">
                  <th className="px-5 py-3 text-xs font-medium text-g-muted">Quote No</th>
                  <th className="px-5 py-3 text-xs font-medium text-g-muted">Route</th>
                  <th className="px-5 py-3 text-xs font-medium text-g-muted">Mode</th>
                  <th className="px-5 py-3 text-xs font-medium text-g-muted">USD</th>
                </tr>
              </thead>
              <tbody>
                {summary?.latest_quotes?.map((quote) => (
                  <tr key={quote.id} className="border-b border-g-outline last:border-0 transition hover:bg-g-surface">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-g-blue">{quote.quote_no}</td>
                    <td className="px-5 py-3 text-g-secondary">{quote.origin} → {quote.destination_region}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full border border-g-outline bg-g-surface px-2 py-0.5 text-xs text-g-secondary">
                        {quote.service_mode}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-g-on-surface">{usd.format(quote.final_usd)}</td>
                  </tr>
                ))}
                {!summary && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-g-muted">Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* FX rate */}
          <div className="g-card">
            <h2 className="text-base font-medium text-g-on-surface">Rate Snapshot</h2>
            <div className="mt-4 rounded-2xl border border-g-blue/20 bg-g-blue-container px-5 py-4">
              <p className="text-xs font-medium text-g-blue">Current FX</p>
              <p className="mt-2 text-3xl font-light text-g-on-surface">
                {exchangeRate?.currency} / {exchangeRate?.rate_to_krw?.toLocaleString('en-US')} KRW
              </p>
              <p className="mt-2 text-xs text-g-muted">
                Updated: {exchangeRate?.updated_at ? new Date(exchangeRate.updated_at).toLocaleString() : '-'}
              </p>
            </div>
          </div>

          {/* Guide */}
          <div className="g-card">
            <p className="font-medium text-g-on-surface">Operational Guide</p>
            <ul className="mt-3 space-y-3">
              {[
                '신규 요청은 New Quote 메뉴에서 입력합니다.',
                'LCL/FTL 자동 비교 결과를 확인하고 발행합니다.',
                '요율 기준 확인은 Tariff Matrix에서 조회합니다.',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-g-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-g-blue-container text-xs font-medium text-g-blue">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
