import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const krw = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 });

export default function AlbaSettlementPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [saving, setSaving] = useState(null);
  const [hours, setHours] = useState({});

  useEffect(() => {
    apiRequest('/alba/jobs', {}, token).then(setJobs).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!selectedJobId) { setApplications([]); return; }
    setLoadingApps(true);
    apiRequest(`/alba/jobs/${selectedJobId}/applications`, {}, token)
      .then((apps) => {
        const accepted = apps.filter((a) => a.status === 'accepted');
        setApplications(accepted);
        const init = {};
        accepted.forEach((a) => { init[a.id] = a.worked_hours ?? ''; });
        setHours(init);
      })
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, [selectedJobId, token]);

  const saveHours = async (appId) => {
    setSaving(appId);
    try {
      const updated = await apiRequest(`/alba/applications/${appId}`,
        { method: 'PATCH', body: JSON.stringify({ worked_hours: Number(hours[appId]) }) }, token);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const selectedJob = jobs.find((j) => String(j.id) === String(selectedJobId));

  const totalSettlement = applications.reduce((sum, app) => {
    const h = app.worked_hours ?? Number(hours[app.id]) ?? 0;
    return sum + (selectedJob ? selectedJob.wage_per_hour * h : 0);
  }, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-medium text-g-on-surface">정산 관리</h1>

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

      {selectedJob && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="g-card">
              <p className="text-xs font-medium text-g-muted">시급</p>
              <p className="mt-2 text-xl font-medium text-g-on-surface">{Number(selectedJob.wage_per_hour).toLocaleString()}원</p>
            </div>
            <div className="g-card">
              <p className="text-xs font-medium text-g-muted">확정 인원</p>
              <p className="mt-2 text-xl font-medium text-g-on-surface">{applications.length}명</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
              <p className="text-xs font-medium text-[#7c3aed]">예상 정산 합계</p>
              <p className="mt-2 text-xl font-medium text-g-on-surface">{krw.format(totalSettlement)}</p>
            </div>
          </div>

          <div className="g-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-g-outline bg-g-surface">
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">이름</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">연락처</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">실 근무시간</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">정산액</th>
                    <th className="px-4 py-3 text-xs font-medium text-g-muted">저장</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingApps ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-g-muted">불러오는 중...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-g-muted">승인된 지원자가 없습니다.</td></tr>
                  ) : (
                    applications.map((app) => {
                      const h = hours[app.id];
                      const pay = h ? selectedJob.wage_per_hour * Number(h) : 0;
                      return (
                        <tr key={app.id} className="border-b border-g-outline last:border-0 transition hover:bg-g-surface">
                          <td className="px-4 py-3 font-medium text-g-on-surface">{app.worker_name}</td>
                          <td className="px-4 py-3 text-g-secondary">{app.worker_contact}</td>
                          <td className="px-4 py-3">
                            <input type="number" min={0} step={0.5} value={h}
                              onChange={(e) => setHours((p) => ({ ...p, [app.id]: e.target.value }))}
                              className="w-24 rounded-xl border border-g-outline bg-white px-2 py-1.5 text-sm text-g-on-surface outline-none focus:border-g-blue focus:ring-2 focus:ring-g-blue/20"
                              placeholder="시간" />
                          </td>
                          <td className="px-4 py-3 font-medium text-[#7c3aed]">
                            {pay > 0 ? krw.format(pay) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <button type="button" disabled={saving === app.id || !h} onClick={() => saveHours(app.id)}
                              className="rounded-lg px-3 py-1 text-xs font-medium text-[#7c3aed] hover:bg-purple-50 transition disabled:opacity-40">
                              {saving === app.id ? '저장중' : '저장'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
