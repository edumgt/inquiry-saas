import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { role: 'Admin', email: 'admin@inquiry.local', password: 'Admin123!' },
  { role: 'Agent A', email: 'agent.alpha@globalfreight.com', password: 'Agent123!' },
  { role: 'Agent B', email: 'agent.beta@oceangate.com', password: 'Agent123!' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@inquiry.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-g-surface p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-g-blue">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <span className="text-base font-medium text-g-on-surface">Operations Hub</span>
        </div>

        <div>
          <h1 className="text-4xl font-normal text-g-on-surface leading-tight">
            Korea Inland Freight<br />Quotation Platform
          </h1>
          <p className="mt-4 text-base text-g-secondary leading-relaxed">
            화물 정보를 입력하면 차량 자동 매칭, LCL/FTL 비교,<br />
            할증 계산을 거쳐 즉시 견적을 발행합니다.
          </p>

          <div className="mt-8 space-y-2">
            <p className="text-xs font-medium text-g-muted">Demo accounts</p>
            {demoAccounts.map((acc) => (
              <button key={acc.email} type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                className="flex w-full items-center justify-between rounded-2xl border border-g-outline bg-white px-4 py-3 text-left transition hover:bg-g-surface-hover">
                <span className="text-sm font-medium text-g-on-surface">{acc.role}</span>
                <span className="text-xs text-g-muted">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-g-muted">© 2026 Operations Hub</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-g-blue">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <span className="text-sm font-medium">Operations Hub</span>
          </div>

          <h2 className="text-2xl font-normal text-g-on-surface">로그인</h2>
          <p className="mt-2 text-sm text-g-secondary">승인된 계정으로 접속하세요.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-g-on-surface mb-1.5">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="g-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-g-on-surface mb-1.5">비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="g-input" required />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <button type="submit" disabled={submitting} className="btn-filled w-full py-3">
              {submitting ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
