import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const STATUS_LABEL = { open: '모집중', closed: '마감', completed: '완료' };
const STATUS_COLOR = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-g-surface text-g-muted border border-g-outline',
  completed: 'bg-blue-100 text-blue-700',
};

export default function AlbaJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(null);

  const load = () => {
    setLoading(true);
    apiRequest('/alba/jobs', {}, token)
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const closeJob = async (id) => {
    setClosing(id);
    try {
      await apiRequest(`/alba/jobs/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'closed' }) }, token);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setClosing(null);
    }
  };

  if (error) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-g-on-surface">공고 목록</h1>
        <Link to="/alba/jobs/new" className="btn-filled">+ 공고 등록</Link>
      </div>

      {loading ? (
        <p className="text-sm text-g-muted">불러오는 중...</p>
      ) : jobs.length === 0 ? (
        <div className="g-card py-12 text-center">
          <p className="text-g-secondary">등록된 공고가 없습니다.</p>
          <Link to="/alba/jobs/new" className="mt-3 inline-block text-sm font-medium text-[#7c3aed] hover:underline">
            첫 공고 등록하기 →
          </Link>
        </div>
      ) : (
        <div className="g-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-g-outline bg-g-surface">
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">공고번호</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">제목</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">업무유형</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">장소</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">날짜</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">모집/시급</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">상태</th>
                  <th className="px-4 py-3 text-xs font-medium text-g-muted">관리</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-g-outline last:border-0 transition hover:bg-g-surface">
                    <td className="px-4 py-3 font-mono text-xs text-g-muted">{job.job_no}</td>
                    <td className="px-4 py-3 font-medium text-g-on-surface">{job.title}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-g-outline bg-g-surface px-1.5 py-0.5 text-xs text-g-secondary">{job.job_type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-g-secondary">{job.location}</td>
                    <td className="px-4 py-3 text-xs text-g-secondary">
                      {job.job_date}<br /><span className="text-g-muted">{job.start_time}~{job.end_time}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-medium text-g-on-surface">{job.headcount}명</span><br />
                      <span className="text-g-muted">{Number(job.wage_per_hour).toLocaleString()}원/시</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[job.status] || 'bg-g-surface text-g-muted'}`}>
                        {STATUS_LABEL[job.status] || job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/alba/applications?job_id=${job.id}`}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-[#7c3aed] hover:bg-purple-50 transition">
                          지원자
                        </Link>
                        {job.status === 'open' && (
                          <button type="button" onClick={() => closeJob(job.id)} disabled={closing === job.id}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-g-secondary hover:bg-g-surface-hover transition disabled:opacity-50">
                            마감
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
