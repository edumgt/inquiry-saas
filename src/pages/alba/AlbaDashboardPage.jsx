import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const krw = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 });

const STATUS_LABEL = { open: '모집중', closed: '마감', completed: '완료' };
const STATUS_COLOR = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-g-surface text-g-muted border border-g-outline',
  completed: 'bg-blue-100 text-blue-700',
};

export default function AlbaDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/alba/dashboard', {}, token).then(setData).catch((err) => setError(err.message || '불러오기 실패'));
  }, [token]);

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  }

  const stats = data
    ? [
        { label: '전체 공고', value: String(data.total_jobs), hint: '등록된 총 공고 수' },
        { label: '모집중', value: String(data.open_jobs), hint: '현재 지원 가능한 공고' },
        { label: '전체 지원', value: String(data.total_applications), hint: '전체 수신 지원 수' },
        { label: '확정 인원', value: String(data.accepted_applications), hint: '승인 완료 지원자' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="g-card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-g-outline">
            <h2 className="text-base font-medium text-g-on-surface">최근 공고</h2>
            <Link to="/alba/jobs" className="text-sm font-medium text-[#7c3aed] hover:underline">전체 보기 →</Link>
          </div>
          <div className="divide-y divide-g-outline">
            {data?.recent_jobs?.map((job) => (
              <div key={job.id} className="flex items-start justify-between px-5 py-4 transition hover:bg-g-surface">
                <div>
                  <p className="font-medium text-g-on-surface">{job.title}</p>
                  <p className="mt-0.5 text-xs text-g-secondary">{job.location} · {job.job_date} {job.start_time}~{job.end_time}</p>
                  <p className="mt-0.5 text-xs text-g-muted">{job.headcount}명 · {Number(job.wage_per_hour).toLocaleString()}원/시</p>
                </div>
                <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[job.status] || 'bg-g-surface text-g-muted'}`}>
                  {STATUS_LABEL[job.status] || job.status}
                </span>
              </div>
            ))}
            {!data && <p className="px-5 py-4 text-sm text-g-muted">불러오는 중...</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="g-card">
            <h2 className="text-base font-medium text-g-on-surface">정산 현황</h2>
            <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4">
              <p className="text-xs font-medium text-[#7c3aed]">확정 정산액 합계</p>
              <p className="mt-2 text-3xl font-light text-g-on-surface">
                {data ? krw.format(data.total_settlement_krw) : '-'}
              </p>
              <p className="mt-2 text-xs text-[#7c3aed]">근무시간 입력 완료 건 기준</p>
            </div>
          </div>

          <div className="g-card">
            <p className="font-medium text-g-on-surface">운영 가이드</p>
            <ul className="mt-3 space-y-3">
              {[
                '공고 등록에서 신규 발주를 등록합니다.',
                '지원 관리에서 접수된 수주를 승인·거절합니다.',
                '근무 완료 후 정산 관리에서 시간을 입력합니다.',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-g-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-[#7c3aed]">
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
