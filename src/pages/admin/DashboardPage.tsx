import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// ==========================================
// 1. 타입 정의
// ==========================================

interface ChartDataPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TableRowData {
  name: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface DashboardData {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  chartData: ChartDataPoint[];
  queries: TableRowData[];
  pages: TableRowData[];
  referrers: TableRowData[];
  countries: TableRowData[];
  devices: TableRowData[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.jaejaeinfo.com';

// ==========================================
// 2. 메인 Dashboard 컴포넌트
// ==========================================

const DashboardPage: React.FC = () => {
  // 상태 관리
  const [dateRange, setDateRange] = useState<string>('7d'); // 24h, 7d, 28d, 3m
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetchError, setFetchError] = useState<boolean>(false);

  // 차트 활성 라인 제어
  const [activeMetrics, setActiveMetrics] = useState({
    clicks: true,
    impressions: true,
    ctr: false,
    position: false,
  });

  // 하단 상세 탭 및 필터 제어
  const [activeTab, setActiveTab] = useState<'pages' | 'referrers' | 'countries' | 'devices' | 'dates'>('pages');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 차트 호버 툴팁 상태
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<SVGSVGElement | null>(null);

  // 실제 API에서 분석 데이터 조회
  const fetchData = async (range: string) => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(
        `${API_BASE}/api/analytics/dashboard?dateRange=${range}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('API 오류');
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      setData(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  // 날짜 리셋 필터 기능
  const handleResetFilters = () => {
    setDateRange('7d');
    setActiveMetrics({
      clicks: true,
      impressions: true,
      ctr: false,
      position: false,
    });
    setSearchTerm('');
    setSortField('clicks');
    setSortOrder('desc');
  };

  // 정렬 핸들러
  const handleSort = (field: 'clicks' | 'impressions' | 'ctr' | 'position') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 엑티브 지표 토글
  const toggleMetric = (metric: 'clicks' | 'impressions' | 'ctr' | 'position') => {
    setActiveMetrics((prev) => {
      const next = { ...prev, [metric]: !prev[metric] };
      // 최소 한 개의 지표는 활성화되어야 함
      if (!next.clicks && !next.impressions && !next.ctr && !next.position) {
        return prev;
      }
      return next;
    });
  };

  // 탭 별 데이터 가져오기
  const currentTableData = useMemo(() => {
    if (!data) return [];
    
    let baseList: TableRowData[] = [];
    if (activeTab === 'pages') baseList = data.pages;
    else if (activeTab === 'referrers') baseList = data.referrers;
    else if (activeTab === 'countries') baseList = data.countries;
    else if (activeTab === 'devices') baseList = data.devices;
    else if (activeTab === 'dates') {
      baseList = data.chartData.map((d) => ({
        name: d.date,
        clicks: d.clicks,
        impressions: d.impressions,
        ctr: d.ctr,
        position: d.position,
      }));
    }

    // 텍스트 검색 필터
    const filtered = baseList.filter((row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬 수행
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, activeTab, searchTerm, sortField, sortOrder]);

  // CSV 다운로드 시뮬레이션
  const handleExportCSV = () => {
    if (!currentTableData.length) return;
    
    const headers = ['대상', '방문수'];
    const csvRows = [headers.join(',')];

    currentTableData.forEach((row) => {
      const values = [`"${row.name}"`, row.clicks];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `재재인포컴_관제통계_${activeTab}_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG 차트 드로잉 계산 파트
  const chartDimensions = { width: 1000, height: 350, paddingLeft: 55, paddingRight: 55, paddingTop: 40, paddingBottom: 40 };
  const graphWidth = chartDimensions.width - chartDimensions.paddingLeft - chartDimensions.paddingRight;
  const graphHeight = chartDimensions.height - chartDimensions.paddingTop - chartDimensions.paddingBottom;

  const chartLines = useMemo(() => {
    if (!data || !data.chartData.length) return null;

    const points = data.chartData;
    const len = points.length;

    // 각 지표의 최댓값 탐색 (y축 스케일링용)
    const maxClicks = Math.max(...points.map((p) => p.clicks), 1);
    const maxImpressions = Math.max(...points.map((p) => p.impressions), 1);
    const maxCtr = Math.max(...points.map((p) => p.ctr), 1);
    const maxPosition = Math.max(...points.map((p) => p.position), 1);
    const minPosition = Math.min(...points.map((p) => p.position), 1);

    // 좌표 생성 함수
    const getX = (index: number) => {
      if (len <= 1) return chartDimensions.paddingLeft + graphWidth / 2;
      return chartDimensions.paddingLeft + (index / (len - 1)) * graphWidth;
    };

    const getClicksY = (val: number) => {
      return chartDimensions.paddingTop + graphHeight - (val / maxClicks) * graphHeight;
    };

    const getImpsY = (val: number) => {
      return chartDimensions.paddingTop + graphHeight - (val / maxImpressions) * graphHeight;
    };

    const getCtrY = (val: number) => {
      return chartDimensions.paddingTop + graphHeight - (val / maxCtr) * graphHeight;
    };

    const getPosY = (val: number) => {
      // 게재위치는 1위가 가장 위에 와야하므로 반대로 매핑 (GSC 방식 일치)
      const range = maxPosition - minPosition || 5;
      const normalized = (val - minPosition) / range;
      return chartDimensions.paddingTop + normalized * graphHeight;
    };

    // SVG path 문자열 작성
    let clicksPath = '';
    let impsPath = '';
    let ctrPath = '';
    let posPath = '';

    points.forEach((p, idx) => {
      const x = getX(idx);
      
      if (idx === 0) {
        clicksPath = `M ${x} ${getClicksY(p.clicks)}`;
        impsPath = `M ${x} ${getImpsY(p.impressions)}`;
        ctrPath = `M ${x} ${getCtrY(p.ctr)}`;
        posPath = `M ${x} ${getPosY(p.position)}`;
      } else {
        clicksPath += ` L ${x} ${getClicksY(p.clicks)}`;
        impsPath += ` L ${x} ${getImpsY(p.impressions)}`;
        ctrPath += ` L ${x} ${getCtrY(p.ctr)}`;
        posPath += ` L ${x} ${getPosY(p.position)}`;
      }
    });

    return {
      clicks: clicksPath,
      impressions: impsPath,
      ctr: ctrPath,
      position: posPath,
      getX,
      getClicksY,
      getImpsY,
      getCtrY,
      getPosY,
      maxClicks,
      maxImpressions,
      maxCtr,
      maxPosition,
      minPosition,
    };
  }, [data]);

  // 마우스 이동 시 호버 인덱스 캡처
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartContainerRef.current || !data || !data.chartData.length) return;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // 컴포넌트 내부 x 좌표
    const ratio = (x - (chartDimensions.paddingLeft * rect.width) / chartDimensions.width) / ((graphWidth * rect.width) / chartDimensions.width);
    
    let index = Math.round(ratio * (data.chartData.length - 1));
    index = Math.max(0, Math.min(data.chartData.length - 1, index));
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      
      {/* ==========================================
          A. 헤더 및 필터 영역
         ========================================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="w-2.5 h-6 bg-blue-600 rounded-sm mr-2.5 inline-block"></span>
              사이트 방문 분석 현황
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              자체 서버 로그 기반 방문자 집계 — 페이지뷰, 유입 경로, 기기 통계를 실시간으로 분석합니다.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* 리셋 버튼 */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              필터 초기화
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 my-3"></div>

        {/* 세부 필터 (GSC 스타일) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setDateRange('24h')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                dateRange === '24h' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              24시간
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                dateRange === '7d' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7일
            </button>
            <button
              onClick={() => setDateRange('28d')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                dateRange === '28d' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              28일
            </button>
            <button
              onClick={() => setDateRange('3m')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                dateRange === '3m' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              3개월
            </button>
          </div>

          <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold border border-blue-100">
              수집 방식: 자체 로그
            </span>
            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold border border-purple-100">
              대상 도메인: jaejaeinfo.com
            </span>
          </div>
        </div>
      </div>

      {/* 에러 상태 */}
      {!loading && fetchError && (
        <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4 text-center">
          <p className="text-sm font-semibold text-amber-700">백엔드 서버에서 데이터를 불러오지 못했습니다.</p>
          <p className="text-xs text-amber-600 mt-1">EC2 서버에 analytics API가 배포되지 않았거나 연결 오류가 발생했습니다.</p>
          <button
            onClick={() => fetchData(dateRange)}
            className="mt-3 px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="w-full h-80 flex items-center justify-center bg-white bg-opacity-70 rounded-lg shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold text-gray-500">관제 분석 데이터를 로딩 중입니다...</p>
          </div>
        </div>
      )}

      {/* ==========================================
          B. 메인 대시보드 뷰어 (차트 및 카드)
         ========================================== */}
      {!loading && data && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          
          {/* 1. 지표 카드 영역 (클릭 가능 토글 방식) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-gray-200">
            {/* 카드 A: 총 방문수 */}
            <div
              onClick={() => toggleMetric('clicks')}
              className={`p-4 cursor-pointer select-none transition-colors border-r border-b lg:border-b-0 border-gray-100 ${
                activeMetrics.clicks ? 'bg-blue-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${activeMetrics.clicks ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                  총 방문수
                </span>
                <input
                  type="checkbox"
                  checked={activeMetrics.clicks}
                  readOnly
                  className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                />
              </div>
              <div className="text-2xl font-extrabold text-blue-700">{data.summary.totalClicks.toLocaleString()}</div>
            </div>

            {/* 카드 B: 순 방문자수 */}
            <div
              onClick={() => toggleMetric('impressions')}
              className={`p-4 cursor-pointer select-none transition-colors border-r border-b lg:border-b-0 border-gray-100 ${
                activeMetrics.impressions ? 'bg-purple-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${activeMetrics.impressions ? 'bg-purple-600' : 'bg-gray-300'}`}></span>
                  순 방문자수
                </span>
                <input
                  type="checkbox"
                  checked={activeMetrics.impressions}
                  readOnly
                  className="rounded text-purple-600 focus:ring-purple-500 pointer-events-none"
                />
              </div>
              <div className="text-2xl font-extrabold text-purple-700">{data.summary.totalImpressions.toLocaleString()}</div>
            </div>

            {/* 카드 C: 인기 페이지 수 */}
            <div
              className="p-4 select-none border-r border-gray-100 bg-gray-50/50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-400"></span>
                  인기 페이지 수
                </span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-700">{data.pages.length}</div>
            </div>

            {/* 카드 D: 유입 채널 수 */}
            <div
              className="p-4 select-none bg-gray-50/50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-amber-400"></span>
                  유입 채널 수
                </span>
              </div>
              <div className="text-2xl font-extrabold text-amber-700">{data.referrers.length}</div>
            </div>
          </div>

          {/* 2. SVG 실시간 다이나믹 라인 차트 */}
          <div className="p-4 relative">
            <svg
              ref={chartContainerRef}
              viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
              className="w-full h-auto max-h-[350px] overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* 그라데이션 브러시정의 */}
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="impsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 가로 그리드 라인 */}
              <line x1={chartDimensions.paddingLeft} y1={chartDimensions.paddingTop} x2={chartDimensions.width - chartDimensions.paddingRight} y2={chartDimensions.paddingTop} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={chartDimensions.paddingLeft} y1={chartDimensions.paddingTop + graphHeight * 0.25} x2={chartDimensions.width - chartDimensions.paddingRight} y2={chartDimensions.paddingTop + graphHeight * 0.25} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={chartDimensions.paddingLeft} y1={chartDimensions.paddingTop + graphHeight * 0.50} x2={chartDimensions.width - chartDimensions.paddingRight} y2={chartDimensions.paddingTop + graphHeight * 0.50} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={chartDimensions.paddingLeft} y1={chartDimensions.paddingTop + graphHeight * 0.75} x2={chartDimensions.width - chartDimensions.paddingRight} y2={chartDimensions.paddingTop + graphHeight * 0.75} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={chartDimensions.paddingLeft} y1={chartDimensions.paddingTop + graphHeight} x2={chartDimensions.width - chartDimensions.paddingRight} y2={chartDimensions.paddingTop + graphHeight} stroke="#e5e7eb" strokeWidth="1.5" />

              {/* X축 날짜 라벨 출력 */}
              {data.chartData.map((d, idx) => {
                // 라벨 겹침 방지를 위해 드문드문 출력 제어
                const step = Math.ceil(data.chartData.length / 8);
                if (idx % step !== 0 && idx !== data.chartData.length - 1) return null;
                const x = chartLines?.getX(idx) || 0;
                return (
                  <g key={idx}>
                    <text
                      x={x}
                      y={chartDimensions.height - 15}
                      textAnchor="middle"
                      className="text-[10px] fill-gray-400 font-semibold"
                    >
                      {d.date}
                    </text>
                    <line x1={x} y1={chartDimensions.paddingTop + graphHeight} x2={x} y2={chartDimensions.paddingTop + graphHeight + 5} stroke="#e5e7eb" strokeWidth="1" />
                  </g>
                );
              })}

              {/* 지표 라인 패스 및 그라데이션 영역 렌더링 */}
              {chartLines && (
                <>
                  {/* 노출수 채우기 */}
                  {activeMetrics.impressions && (
                    <path
                      d={`${chartLines.impressions} L ${chartLines.getX(data.chartData.length - 1)} ${chartDimensions.paddingTop + graphHeight} L ${chartLines.getX(0)} ${chartDimensions.paddingTop + graphHeight} Z`}
                      fill="url(#impsGrad)"
                    />
                  )}
                  {/* 클릭수 채우기 */}
                  {activeMetrics.clicks && (
                    <path
                      d={`${chartLines.clicks} L ${chartLines.getX(data.chartData.length - 1)} ${chartDimensions.paddingTop + graphHeight} L ${chartLines.getX(0)} ${chartDimensions.paddingTop + graphHeight} Z`}
                      fill="url(#clicksGrad)"
                    />
                  )}

                  {/* 노출수 선 */}
                  {activeMetrics.impressions && (
                    <path d={chartLines.impressions} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* 클릭수 선 */}
                  {activeMetrics.clicks && (
                    <path d={chartLines.clicks} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* CTR 선 */}
                  {activeMetrics.ctr && (
                    <path d={chartLines.ctr} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* 게재위치 선 */}
                  {activeMetrics.position && (
                    <path d={chartLines.position} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </>
              )}

              {/* 호버 수직선 및 마커 */}
              {hoveredIndex !== null && chartLines && (
                <>
                  <line
                    x1={chartLines.getX(hoveredIndex)}
                    y1={chartDimensions.paddingTop}
                    x2={chartLines.getX(hoveredIndex)}
                    y2={chartDimensions.paddingTop + graphHeight}
                    stroke="#9ca3af"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  {/* 노출수 마커 */}
                  {activeMetrics.impressions && (
                    <circle cx={chartLines.getX(hoveredIndex)} cy={chartLines.getImpsY(data.chartData[hoveredIndex].impressions)} r="5" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                  {/* 클릭수 마커 */}
                  {activeMetrics.clicks && (
                    <circle cx={chartLines.getX(hoveredIndex)} cy={chartLines.getClicksY(data.chartData[hoveredIndex].clicks)} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                  {/* CTR 마커 */}
                  {activeMetrics.ctr && (
                    <circle cx={chartLines.getX(hoveredIndex)} cy={chartLines.getCtrY(data.chartData[hoveredIndex].ctr)} r="5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                  {/* 게재위치 마커 */}
                  {activeMetrics.position && (
                    <circle cx={chartLines.getX(hoveredIndex)} cy={chartLines.getPosY(data.chartData[hoveredIndex].position)} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                </>
              )}
            </svg>

            {/* 대화형 툴팁 박스 (차트 상에 absolute 레이아웃) */}
            {hoveredIndex !== null && chartLines && (
              <div
                className="absolute z-10 bg-white border border-gray-200 rounded shadow-md p-2.5 text-xs text-gray-700 pointer-events-none"
                style={{
                  left: `${(chartLines.getX(hoveredIndex) / chartDimensions.width) * 100}%`,
                  transform: hoveredIndex > data.chartData.length / 2 ? 'translateX(-105%)' : 'translateX(5%)',
                  top: '40px',
                }}
              >
                <div className="font-bold border-b border-gray-100 pb-1 mb-1 text-gray-900">
                  {data.chartData[hoveredIndex].date} {dateRange === '24h' ? '' : '실적'}
                </div>
                <div className="space-y-0.5">
                  {activeMetrics.clicks && (
                    <div className="flex justify-between gap-6 text-blue-700">
                      <span>방문수:</span>
                      <span className="font-bold">{data.chartData[hoveredIndex].clicks}회</span>
                    </div>
                  )}
                  {activeMetrics.impressions && (
                    <div className="flex justify-between gap-6 text-purple-700">
                      <span>순방문자:</span>
                      <span className="font-bold">{data.chartData[hoveredIndex].impressions}명</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          C. 세부 통계 목록 테이블 (검색어, 유입경로 등)
         ========================================== */}
      {!loading && data && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          {/* GSC 스타일의 상단 세부 탭 버튼 그룹 */}
          <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('pages'); setSearchTerm(''); }}
              className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'pages' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              인기 페이지 (PAGES)
            </button>
            <button
              onClick={() => { setActiveTab('referrers'); setSearchTerm(''); }}
              className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'referrers' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              유입 경로 (REFERRERS)
            </button>
            <button
              onClick={() => { setActiveTab('countries'); setSearchTerm(''); }}
              className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'countries' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              국가 (COUNTRIES)
            </button>
            <button
              onClick={() => { setActiveTab('devices'); setSearchTerm(''); }}
              className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'devices' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              기기 (DEVICES)
            </button>
            <button
              onClick={() => { setActiveTab('dates'); setSearchTerm(''); }}
              className={`px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'dates' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              날짜 (DATES)
            </button>
          </div>

          {/* 테이블 컨트롤러 바 (검색창, 내보내기) */}
          <div className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`${
                  activeTab === 'pages' ? '페이지 경로' :
                  activeTab === 'referrers' ? '접속 경로/채널' :
                  activeTab === 'countries' ? '국가명' :
                  activeTab === 'devices' ? '디바이스 기기' : '날짜'
                } 필터링...`}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              내보내기 (CSV)
            </button>
          </div>

          {/* 데이터 리스트 표 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {activeTab === 'pages' ? '페이지' :
                     activeTab === 'referrers' ? '접속 경로' :
                     activeTab === 'countries' ? '국가' :
                     activeTab === 'devices' ? '기기' : '날짜'}
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort('clicks')}
                    className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      방문수
                      {sortField === 'clicks' && (
                        <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-xs text-gray-700">
                {currentTableData.length > 0 ? (
                  currentTableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap font-medium text-gray-900 truncate max-w-md">
                        {row.name}
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap font-semibold">
                        {row.clicks.toLocaleString()}회
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-semibold">
                      필터 매칭 데이터가 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
