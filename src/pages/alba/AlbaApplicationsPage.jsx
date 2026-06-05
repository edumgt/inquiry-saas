import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const APP_STATUS_LABEL = { pending: '대기', accepted: '승인', rejected: '거절' };
const APP_STATUS_COLOR = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function AlbaApplicationsPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const filterJobId = searchParams.get('job_id');

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(filterJobId || '');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [newApp, setNewApp] = useState({ worker_name: '', worker_contact: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/alba/jobs', {}, token).then(setJobs).catch(() => {});
  }, [token]);

  const loadApplications = (jobId) => {
    if (!jobId) return;
    setLoadingApps(true);
    apiRequest(`/alba/jobs/${jobId}/applications`, {}, token)
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingApps(false));
  };

  useEffect(() => {
    if (selectedJobId) loadApplications(selectedJobId);
    else setApplications([]);
  }, [selectedJobId, token]);

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const updated = await apiRequest(`/alba/applications/${appId}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJobId) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await apiRequest(`/alba/jobs/${selectedJobId}/applications`, { method: 'POST', body: JSON.stringify(newApp) }, token);
      setApplications((prev) => [created, ...prev]);
      setNewApp({ worker_name: '', worker_contact: '', note: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find((j) => String(j.id) === String(selectedJobId));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-medium text-g-on-surface">지원 관리</h1>

      <div>
        <label className="block text-sm font-medium text-g-on-surface mb-1.5">공고 선택</label>
        <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className="g-input max-w-lg">
          <option value="">-- 공고를 선택하세요 --</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              [{j.job_no}] {j.title} ({j.job_date})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {selectedJob && (
        <>
          <div className="rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4">
            <p className="font-medium text-g-on-surface">{selectedJob.title}</p>
            <p className="mt-1 text-xs text-[#7c3aed]">
              {selectedJob.location} · {selectedJob.job_date} {selectedJob.start_time}~{selectedJob.end_time} ·
              모집 {selectedJob.headcount}명 · {Number(selectedJob.wage_per_hour).toLocaleString()}원/시
            </p>
          </div>

          {selectedJob.status === 'open' && (
            <form onSubmit={submitApplication} className="g-card">
              <h2 className="text-sm font-medium text-g-on-surface mb-3">지원자 수동 등록</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <input required placeholder="지원자명 *" value={newApp.worker_name}
                  onChange={(e) => setNewApp((p) => ({ ...p, worker_name: e.target.value }))}
                  className="g-input" />
                <input required placeholder="연락처 * (010-xxxx-xxxx)" value={newApp.worker_contact}
                  onChange={(e) => setNewApp((p) => ({ ...p, worker_contact: e.target.value }))}
                  className="g-input" />
                <input placeholder="메모" value={newApp.note}
                  onChange={(e) => setNewApp((p) => ({ ...p, note: e.target.value }))}
                  className="g-input" />
              </div>
              <button type="submit" disabled={submitting} className="btn-filled mt-3 disabled:opacity-50">
                {submitting ? '등록 중...' : '지원자 등록'}
              </button>
            </form>
          )}

          <div className="g-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-g-outline bg-g-surface">
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">지원자</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">연락처</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">메모</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">상태</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">처리</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingApps ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-g-muted">불러오는 중...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-g-muted">지원자가 없습니다.</td></tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="border-b border-g-outline last:border-0 transition hover:bg-g-surface">
                        <td className="px-4 py-3 font-medium text-g-on-surface">{app.worker_name}</td>
                        <td className="px-4 py-3 text-g-secondary">{app.worker_contact}</td>
                        <td className="px-4 py-3 text-xs text-g-muted">{app.note || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${APP_STATUS_COLOR[app.status]}`}>
                            {APP_STATUS_LABEL[app.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.status === 'pending' && (
                            <div className="flex gap-1.5">
                              <button type="button" disabled={updating === app.id} onClick={() => updateStatus(app.id, 'accepted')}
                                className="rounded-lg px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 transition disabled:opacity-50">
                                승인
                              </button>
                              <button type="button" disabled={updating === app.id} onClick={() => updateStatus(app.id, 'rejected')}
                                className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                                거절
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
