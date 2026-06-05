import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

const JOB_TYPES = ['행사도우미', '포장/분류', '이사/운반', '청소/환경', '배송보조', '주방보조', '판촉/홍보', '기타'];
const today = new Date().toISOString().slice(0, 10);

export default function AlbaNewJobPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', location: '', job_date: today,
    start_time: '09:00', end_time: '18:00',
    headcount: 1, wage_per_hour: 10030,
    job_type: JOB_TYPES[0], description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiRequest('/alba/jobs', {
        method: 'POST',
        body: JSON.stringify({ ...form, headcount: Number(form.headcount), wage_per_hour: Number(form.wage_per_hour) }),
      }, token);
      navigate('/alba/jobs');
    } catch (err) {
      setError(err.message || '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-medium text-g-on-surface">공고 등록</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={submit} className="g-card space-y-5">
        <div>
          <label className="block text-sm font-medium text-g-on-surface mb-1.5">공고 제목 *</label>
          <input required value={form.title} onChange={set('title')}
            placeholder="예: 롯데월드타워 행사 도우미"
            className="g-input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-g-on-surface mb-1.5">업무 유형 *</label>
            <select value={form.job_type} onChange={set('job_type')} className="g-input">
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-g-on-surface mb-1.5">모집 인원 *</label>
            <input type="number" min={1} required value={form.headcount} onChange={set('headcount')} className="g-input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-g-on-surface mb-1.5">근무지 주소 *</label>
          <input required value={form.location} onChange={set('location')}
            placeholder="예: 서울 송파구 올림픽로 300"
            className="g-input" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-g-on-surface mb-1.5">근무 날짜 *</label>
            <input type="date" required value={form.job_date} onChange={set('job_date')} className="g-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-g-on-surface mb-1.5">시작 시간 *</label>
            <input type="time" required value={form.start_time} onChange={set('start_time')} className="g-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-g-on-surface mb-1.5">종료 시간 *</label>
            <input type="time" required value={form.end_time} onChange={set('end_time')} className="g-input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-g-on-surface mb-1.5">시급 (원) *</label>
          <input type="number" min={9860} required value={form.wage_per_hour} onChange={set('wage_per_hour')} className="g-input" />
          <p className="mt-1 text-xs text-g-muted">2024년 최저시급 9,860원 이상</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-g-on-surface mb-1.5">업무 설명</label>
          <textarea rows={3} value={form.description} onChange={set('description')}
            placeholder="업무 내용, 복장, 주의사항 등을 입력하세요."
            className="g-input resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-filled px-6 py-2.5 disabled:opacity-50">
            {submitting ? '등록 중...' : '공고 등록'}
          </button>
          <button type="button" onClick={() => navigate('/alba/jobs')} className="btn-outlined px-6 py-2.5">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
