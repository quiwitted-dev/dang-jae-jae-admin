import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = [
    {
      title: '관제 대시보드',
      subItems: [
        { name: '관제 현황', path: '/admin/dashboard' },
      ],
    },
    {
      title: '신청 관리',
      subItems: [
        { name: '사업 예정지 신청', path: '/admin/submissions' },
      ],
    },
    {
      title: '가격 관리',
      subItems: [
        { name: '가격 승인', path: '/admin/price' },
      ],
    },
    {
      title: '계정 관리',
      subItems: [
        { name: '관리자 목록', path: '/admin/manage' },
        { name: '유저 목록', path: '/admin/users' },
      ],
    },
    {
      title: '공공데이터',
      subItems: [
        { name: '데이터 동기화', path: '/api-data/sync' },
      ],
    },
    {
      title: '홈페이지 관리',
      subItems: [
        { name: '홈페이지 문구 관리', path: '/admin/main-title' },
      ],
    },
  ];

  // 현재 경로에 따라 활성 메뉴 설정
  useEffect(() => {
    const currentPath = location.pathname;

    for (const menuItem of menuItems) {
      for (const subItem of menuItem.subItems) {
        if (currentPath === subItem.path) {
          setActiveMenu(menuItem.title);
          break;
        }
      }
    }
  }, [location.pathname]);

  // 메뉴 토글 함수
  const toggleMenu = (title: string) => {
    if (activeMenu === title) {
      setActiveMenu(null);
    } else {
      setActiveMenu(title);
    }
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* 사이드바 */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold">Dang Jae Jae Admin</Link>
          <button
            className="p-1 rounded-md text-gray-400 hover:text-white lg:hidden"
            onClick={toggleSidebar}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {admin?.nickname?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{admin?.nickname || '관리자'}</p>
                <p className="text-xs text-gray-400">{admin?.email || 'admin@example.com'}</p>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white"
              >
                로그아웃
              </button>
            </div>
          </div>

          <nav className="mt-4">
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                <button
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => toggleMenu(item.title)}
                >
                  <span>{item.title}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${activeMenu === item.title ? 'transform rotate-180' : ''
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-200 ${activeMenu === item.title ? 'max-h-96' : 'max-h-0 overflow-hidden'
                    }`}
                >
                  <ul className="bg-gray-900 py-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`flex items-center pl-10 pr-4 py-2 text-sm ${location.pathname === subItem.path
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                          onClick={toggleSidebar}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
