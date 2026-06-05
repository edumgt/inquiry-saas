import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/alba/dashboard', end: true, label: '대시보드',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  },
  {
    to: '/alba/jobs', label: '공고 목록',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
  },
  {
    to: '/alba/jobs/new', label: '공고 등록',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  },
  {
    to: '/alba/applications', label: '지원 관리',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>,
  },
  {
    to: '/alba/settlement', label: '정산 관리',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>,
  },
];

const HamburgerIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export default function AlbaLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-black/30 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── LEFT OFFCANVAS SIDEBAR ── */}
      <aside className={`fixed top-0 left-0 z-30 flex h-full w-64 flex-col border-r border-g-outline bg-g-sidebar transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="flex h-14 items-center gap-3 px-4 border-b border-g-outline">
          <button onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-g-secondary hover:bg-g-surface-hover transition">
            <HamburgerIcon />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7c3aed]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-g-on-surface">알바·용역 수발주</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <p className="px-4 py-2 text-xs font-medium text-g-muted uppercase tracking-wider">메뉴</p>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : 'nav-pill-inactive'}`}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="my-3 border-t border-g-outline" />
          <p className="px-4 py-2 text-xs font-medium text-g-muted uppercase tracking-wider">허브</p>
          <Link to="/" className="nav-pill nav-pill-inactive">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            서비스 허브
          </Link>
        </nav>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>

        <header className="flex h-14 shrink-0 items-center justify-between border-b border-g-outline bg-white px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(p => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-g-secondary hover:bg-g-surface-hover transition">
              <HamburgerIcon />
            </button>
            <span className="hidden text-sm font-medium text-g-on-surface sm:block">알바·용역 수발주 콘솔</span>
          </div>

          <button onClick={() => setRightOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-bold text-white hover:bg-[#6d28d9] transition">
            {user?.full_name?.charAt(0).toUpperCase()}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-white px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      {/* ── RIGHT OFFCANVAS (user panel) ── */}
      <div className={`fixed inset-0 z-40 transition-all ${rightOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity ${rightOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setRightOpen(false)}
        />
        <aside className={`absolute right-0 top-0 flex h-full w-80 flex-col border-l border-g-outline bg-white shadow-2xl transition-transform duration-300 ease-in-out
          ${rightOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className="flex h-14 items-center justify-between border-b border-g-outline px-5">
            <span className="text-sm font-medium text-g-on-surface">계정 정보</span>
            <button onClick={() => setRightOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-g-secondary hover:bg-g-surface-hover transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-g-surface p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed] text-lg font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-g-on-surface">{user?.full_name}</p>
                <p className="text-sm text-g-secondary">{user?.company_name}</p>
                <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  {user?.role} · {user?.tier}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-g-outline p-4 space-y-2">
              <p className="text-xs font-medium text-g-muted uppercase tracking-wide">현재 서비스</p>
              <p className="font-medium text-g-on-surface">알바·용역 수발주</p>
              <p className="text-sm text-g-secondary">Part-time & Contract Orders</p>
            </div>

            <Link to="/" onClick={() => setRightOpen(false)}
              className="flex items-center gap-3 rounded-2xl border border-g-outline p-4 text-sm text-g-secondary hover:bg-g-surface transition">
              <svg className="h-5 w-5 text-g-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              서비스 허브로 이동
            </Link>
          </div>

          <div className="border-t border-g-outline p-5">
            <button onClick={() => { setRightOpen(false); logout(); }}
              className="flex w-full items-center gap-3 rounded-2xl border border-g-outline px-4 py-3 text-sm font-medium text-g-secondary hover:bg-g-surface transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
