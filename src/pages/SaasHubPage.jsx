import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SAAS_PRODUCTS = [
  {
    id: 'inquiry',
    to: '/inquiry/dashboard',
    title: '내륙 운송 견적',
    subtitle: 'Korea Inland Freight Estimator',
    description: '부산/인천항 수입 화물의 내륙 운송 요율 자동 산출. LCL/FTL 비교 및 견적서 발행.',
    badge: 'LIVE',
    color: 'text-g-blue',
    iconBg: 'bg-g-blue-container',
    badgeCls: 'bg-green-100 text-green-700',
    icon: (
      <svg className="h-7 w-7 text-g-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    features: ['LCL / FTL 자동 비교', '실시간 환율 적용', '견적 이력 관리', '요율 매트릭스 조회'],
  },
  {
    id: 'alba',
    to: '/alba/dashboard',
    title: '알바·용역 수발주',
    subtitle: 'Part-time & Contract Worker Orders',
    description: '단기 알바·용역 인력의 공고 등록부터 지원자 관리, 정산까지 원스톱 수발주 플랫폼.',
    badge: 'NEW',
    color: 'text-[#7c3aed]',
    iconBg: 'bg-[#ede9fe]',
    badgeCls: 'bg-purple-100 text-purple-700',
    icon: (
      <svg className="h-7 w-7 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    features: ['공고(발주) 등록·관리', '지원자(수주) 접수', '채용 승인/거절 처리', '근무시간 정산'],
  },
];

export default function SaasHubPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-g-surface">
      <header className="sticky top-0 z-10 border-b border-g-outline bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-g-blue">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-g-on-surface">Operations Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-g-secondary sm:block">{user?.full_name || user?.username}</span>
            <button type="button" onClick={logout}
              className="rounded-full border border-g-blue px-4 py-1.5 text-sm font-medium text-g-blue transition hover:bg-g-blue-container">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium text-g-blue">Service Hub</p>
          <h1 className="mt-2 text-3xl font-normal text-g-on-surface sm:text-4xl">어떤 서비스를 사용할까요?</h1>
          <p className="mt-3 text-sm text-g-secondary">카드를 클릭하여 원하는 서비스로 이동하세요.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {SAAS_PRODUCTS.map((p) => (
            <Link key={p.id} to={p.to}
              className="group relative flex flex-col rounded-3xl border border-g-outline bg-white p-7 transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
              <div className="flex items-start justify-between">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${p.iconBg}`}>
                  {p.icon}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.badgeCls}`}>{p.badge}</span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium text-g-muted">{p.subtitle}</p>
                <h2 className="mt-1 text-xl font-medium text-g-on-surface">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-g-secondary">{p.description}</p>
              </div>

              <ul className="mt-5 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-g-secondary">
                    <svg className={`h-3.5 w-3.5 shrink-0 ${p.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className={`mt-7 flex items-center gap-1 text-sm font-medium ${p.color}`}>
                서비스 열기
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-g-muted">© {new Date().getFullYear()} Operations Hub</p>
      </main>
    </div>
  );
}
