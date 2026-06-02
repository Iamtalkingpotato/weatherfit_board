import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { LayoutDashboard, Users, ThermometerSun, ShoppingCart, Activity, Menu, X, Megaphone, Tag, UserX } from 'lucide-react';
import { useState } from 'react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation: NavItem[] = [
    { name: '대시보드',    href: '/',          icon: LayoutDashboard },
    { name: '고객 관리',   href: '/customers', icon: Users },
    { name: '캠페인',      href: '/campaign',  icon: Megaphone },
    { name: '쿠폰',        href: '/coupon',    icon: Tag },
    { name: '온도 피드백', href: '/feedback',  icon: ThermometerSun },
    { name: '구매 분석',   href: '/purchase',  icon: ShoppingCart },
    { name: '사용자 행동', href: '/behavior',  icon: Activity },
    { name: '비로그인 사용자', href: '/anonymous-users', icon: UserX },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed left-0 top-0 h-full flex flex-col bg-white border-r border-gray-200 transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* 헤더 — shrink-0 으로 높이 고정 */}
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          {sidebarOpen && <h1 className="text-xl font-semibold text-gray-900">WeatherFit Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 네비게이션 — 나머지 공간 전체 차지 */}
        <nav className="flex-1 flex flex-col overflow-hidden p-4">
          {/* 메인 메뉴 — 넘치면 스크롤 */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="flex-1">{item.name}</span>}
                </Link>
              );
            })}
          </div>

        </nav>
      </aside>
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8"><Outlet /></div>
      </main>
      <ScrollRestoration />
    </div>
  );
}
