import React, { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { seoulNoticeCandidatesApi } from '../../api';
import DataTable from '../../components/DataTable';
import useDebounce from '../../lib/useDebounce';
import type {
  NoticeCandidate,
  NoticeCandidateApplyResult,
  NoticeCandidateStatus,
  NoticeCandidateUpdateItem,
} from '../../types';
import NoticeDetectDetailModal, {
  collectUpdateItems,
} from './NoticeDetectDetailModal';

const PAGE_SIZE = 20;

const statusLabelMap: Record<NoticeCandidateStatus, string> = {
  NEW: '신규',
  REVIEWING: '검토중',
  APPLIED: '반영완료',
  SKIPPED: '제외',
};

const statusBadgeMap: Record<NoticeCandidateStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  REVIEWING: 'bg-yellow-100 text-yellow-800',
  APPLIED: 'bg-green-100 text-green-800',
  SKIPPED: 'bg-gray-100 text-gray-800',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR');
};

const NoticeDetectPage: React.FC = () => {
  const [candidates, setCandidates] = useState<NoticeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<NoticeCandidateStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState('');
  const debouncedSourceFilter = useDebounce(sourceFilter, 400);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<NoticeCandidate | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<NoticeCandidateApplyResult | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await seoulNoticeCandidatesApi.getCandidates({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        source: debouncedSourceFilter.trim() || undefined,
      });
      setCandidates(result.candidates);
      setTotal(result.pagination.total);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('탐지리스트 API가 아직 배포되지 않았습니다. EC2 백엔드 배포가 필요합니다.');
      } else {
        setError(err?.response?.data?.error || err?.message || '탐지 목록을 불러오지 못했습니다.');
      }
      setCandidates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSourceFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const openDetail = async (candidate: NoticeCandidate) => {
    setSelected(candidate);
    setApplyResult(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const detail = await seoulNoticeCandidatesApi.getCandidateById(candidate.id);
      setSelected(detail);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status !== 404) {
        setDetailError(
          err?.response?.data?.error || err?.message || '상세 정보를 불러오지 못했습니다.'
        );
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setApplyResult(null);
    setDetailError(null);
  };

  const handleUpdateStatus = async (
    id: string,
    status: NoticeCandidateStatus,
    options: { content?: string; updates?: NoticeCandidateUpdateItem[] } = {}
  ) => {
    const confirmMessage =
      status === 'APPLIED'
        ? `화면에 확인한 사업·변경값을 사이트에 반영할까요?\n\n단계/세대수/층수/면적 등이 DB에 저장됩니다.`
        : `이 항목을 "${statusLabelMap[status]}"(으)로 변경하시겠습니까?`;

    if (!confirm(confirmMessage)) return;

    setUpdatingId(id);
    setError(null);
    try {
      const result = await seoulNoticeCandidatesApi.updateStatus(id, status, options);
      await fetchCandidates();

      if (selected?.id === id) {
        const nextCandidate = result.candidate
          ? { ...selected, ...result.candidate, status: result.candidate.status || status }
          : { ...selected, status };
        setSelected(nextCandidate);
      }

      if (status === 'APPLIED') {
        setApplyResult(
          result.applyResult || {
            message: result.message || '사이트 반영이 완료되었습니다.',
          }
        );
        alert(
          result.applyResult?.appliedCount != null
            ? `반영 완료: ${result.applyResult.appliedCount}개 사업 적용`
            : result.message || '사이트 반영이 완료되었습니다.'
        );
      }
    } catch (err: any) {
      const httpStatus = err?.response?.status;
      const isNetworkError =
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network Error' ||
        !err?.response;

      const message =
        httpStatus === 404
          ? '상태 변경 API가 아직 배포되지 않았습니다. EC2 백엔드 배포가 필요합니다.'
          : isNetworkError
            ? '네트워크 오류가 발생했습니다. 연결 상태와 서버 CORS(PATCH 허용)를 확인해 주세요.'
            : err?.response?.data?.error || err?.message || '상태 변경에 실패했습니다.';

      setError(message);
      setDetailError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">탐지리스트</h1>
          <p className="text-gray-600 mt-1">
            공고 자동 탐지 후, 원문 내용을 보완·확인한 다음 사이트에 반영합니다.
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-medium">사용 방법</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>자동 탐지된 공고의 <strong>상세</strong>를 엽니다.</li>
          <li>원문 텍스트 붙여넣기 또는 문서 업로드 후 <strong>원문 저장·파싱</strong>합니다.</li>
          <li>사업/단계/세대수·층수·면적 값을 확인·수정한 뒤 <strong>반영하기</strong>를 누릅니다.</li>
        </ol>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as NoticeCandidateStatus | '');
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 상태</option>
          <option value="NEW">신규</option>
          <option value="REVIEWING">검토중</option>
          <option value="APPLIED">반영완료</option>
          <option value="SKIPPED">제외</option>
        </select>
        <input
          type="text"
          value={sourceFilter}
          onChange={(e) => {
            setPage(1);
            setSourceFilter(e.target.value);
          }}
          placeholder="출처 필터 (예: IR_PRESS)"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
          <p className="font-semibold">오류</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <DataTable
          columns={[
            {
              header: '상태',
              accessor: (row) => (
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    statusBadgeMap[row.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabelMap[row.status] || row.status}
                </span>
              ),
            },
            {
              header: '제목',
              accessor: (row) => row.title || row.projectName || '-',
              className: 'max-w-xs',
            },
            {
              header: '반영 후보',
              accessor: (row) => {
                const count = collectUpdateItems(row).length;
                return count > 0 ? `${count}개 사업` : '상세에서 보완';
              },
            },
            {
              header: '출처',
              accessor: (row) => row.source || '-',
            },
            {
              header: '탐지 시각',
              accessor: (row) => formatDateTime(row.detectedAt || row.createdAt),
            },
            {
              header: '링크',
              accessor: (row) =>
                row.url ? (
                  <a
                    href={String(row.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    원문
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  '-'
                ),
            },
            {
              header: '작업',
              accessor: () => null,
              cell: (_value, row) => {
                const busy = updatingId === row.id;
                return (
                  <div className="flex space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openDetail(row)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      상세
                    </button>
                    {row.status !== 'APPLIED' && (
                      <button
                        type="button"
                        onClick={() => openDetail(row)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        반영하기
                      </button>
                    )}
                    {row.status !== 'SKIPPED' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleUpdateStatus(row.id, 'SKIPPED')}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        제외
                      </button>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={candidates}
          loading={loading}
          emptyMessage="탐지된 후보가 없습니다."
          onRowClick={(row) => openDetail(row)}
          pagination={{
            currentPage: page,
            pageSize: PAGE_SIZE,
            totalItems: total,
            onPageChange: setPage,
          }}
        />
      </div>

      <NoticeDetectDetailModal
        candidate={selected}
        loading={detailLoading}
        detailError={detailError}
        applyResult={applyResult}
        updating={!!selected && updatingId === selected.id}
        onClose={closeDetail}
        onCandidateChange={setSelected}
        onStatusChange={handleUpdateStatus}
      />
    </div>
  );
};

export default NoticeDetectPage;
