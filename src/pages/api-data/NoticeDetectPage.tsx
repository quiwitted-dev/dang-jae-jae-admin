import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { seoulNoticeCandidatesApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import useDebounce from '../../lib/useDebounce';
import type {
  NoticeCandidate,
  NoticeCandidateStatus,
  NoticeCandidateUpdateItem,
} from '../../types';

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

const UPDATE_COLLECTION_KEYS = [
  'updates',
  'changes',
  'proposedChanges',
  'parsedItems',
  'parsedProjects',
  'projects',
  'matches',
  'detections',
  'items',
  'targets',
  'results',
  'siteUpdates',
  'applyPreview',
  'parsedResult',
] as const;

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR');
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const pickString = (item: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return '';
};

const normalizeUpdateItem = (value: unknown): NoticeCandidateUpdateItem | null => {
  const record = asRecord(value);
  if (!record) return null;
  return record as NoticeCandidateUpdateItem;
};

const collectUpdateItems = (candidate: NoticeCandidate): NoticeCandidateUpdateItem[] => {
  const collected: NoticeCandidateUpdateItem[] = [];

  const pushValue = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        const item = normalizeUpdateItem(entry);
        if (item) collected.push(item);
      });
      return;
    }

    const record = asRecord(value);
    if (!record) return;

    // 중첩 배열 키도 한 번 더 탐색
    let nestedFound = false;
    for (const key of UPDATE_COLLECTION_KEYS) {
      if (Array.isArray(record[key])) {
        nestedFound = true;
        pushValue(record[key]);
      }
    }

    const looksLikeUpdate =
      pickString(record, [
        'projectName',
        'renovationZoneName',
        'name',
        'title',
        'businessNumber',
        'toStage',
        'newStage',
        'proposedStage',
        'targetStage',
        'currentStage',
      ]) !== '';

    if (!nestedFound && looksLikeUpdate) {
      collected.push(record as NoticeCandidateUpdateItem);
    }
  };

  UPDATE_COLLECTION_KEYS.forEach((key) => {
    pushValue(candidate[key]);
  });

  // 후보 자체에 사업/단계 정보가 직접 있는 경우도 1건으로 표시
  if (collected.length === 0) {
    const selfItem = normalizeUpdateItem(candidate);
    if (
      selfItem &&
      (pickString(selfItem, ['projectName', 'renovationZoneName', 'businessNumber']) ||
        pickString(selfItem, ['toStage', 'newStage', 'proposedStage', 'targetStage']))
    ) {
      collected.push(selfItem);
    }
  }

  return collected;
};

const getUpdateProjectLabel = (item: NoticeCandidateUpdateItem) =>
  pickString(item, ['projectName', 'renovationZoneName', 'name', 'title']) || '사업명 미상';

const getUpdateFromStage = (item: NoticeCandidateUpdateItem) =>
  pickString(item, ['fromStage', 'previousStage', 'oldStage', 'currentStage']) || '-';

const getUpdateToStage = (item: NoticeCandidateUpdateItem) =>
  pickString(item, ['toStage', 'newStage', 'proposedStage', 'targetStage']) || '-';

const getCandidateText = (candidate: NoticeCandidate) =>
  pickString(candidate, ['summary', 'content', 'body', 'rawContent', 'html']) || '';

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
  const [showRawJson, setShowRawJson] = useState(false);

  const selectedUpdates = useMemo(
    () => (selected ? collectUpdateItems(selected) : []),
    [selected]
  );
  const selectedText = useMemo(
    () => (selected ? getCandidateText(selected) : ''),
    [selected]
  );

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

  const handleStatusFilterChange = (value: string) => {
    setPage(1);
    setStatusFilter(value as NoticeCandidateStatus | '');
  };

  const handleSourceFilterChange = (value: string) => {
    setPage(1);
    setSourceFilter(value);
  };

  const openDetail = (candidate: NoticeCandidate) => {
    setSelected(candidate);
    setShowRawJson(false);
  };

  const closeDetail = () => {
    setSelected(null);
    setShowRawJson(false);
  };

  const handleUpdateStatus = async (id: string, status: NoticeCandidateStatus) => {
    const label = statusLabelMap[status];
    const confirmMessage =
      status === 'APPLIED'
        ? `이 탐지 건을 "${label}"로 표시할까요?\n\n※ 이 버튼은 탐지리스트의 처리 상태를 바꿉니다.\n사이트의 사업단계가 실제로 바뀌는지는 서버 반영 로직에 따릅니다.\n가능하면 '상세'에서 반영 예정 내용을 먼저 확인하세요.`
        : `이 항목을 "${label}"(으)로 변경하시겠습니까?`;

    if (!confirm(confirmMessage)) return;

    setUpdatingId(id);
    setError(null);
    try {
      const updated = await seoulNoticeCandidatesApi.updateStatus(id, status);
      await fetchCandidates();
      if (selected?.id === id) {
        setSelected(updated ? { ...selected, ...updated, status } : { ...selected, status });
      }
    } catch (err: any) {
      const httpStatus = err?.response?.status;
      if (httpStatus === 404) {
        setError('상태 변경 API가 아직 배포되지 않았습니다. EC2 백엔드 배포가 필요합니다.');
      } else {
        setError(err?.response?.data?.error || err?.message || '상태 변경에 실패했습니다.');
      }
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
            서울시 공고/고시에서 자동 탐지된 후보를 검토하고 반영 여부를 관리합니다.
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

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">확인 방법</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            <strong>상세</strong>에서 “내 사이트에 어떤 사업/단계가 바뀌는지”를 먼저 확인하세요.
          </li>
          <li>
            <strong>원문</strong>은 서울시 공고 페이지 링크입니다. 사이트 반영 내용 미리보기가 아닙니다.
          </li>
          <li>
            <strong>반영완료</strong>는 탐지 건을 처리 완료 상태로 표시합니다. 사업단계 자동 반영 여부는 서버 로직에 따릅니다.
          </li>
        </ul>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
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
          onChange={(e) => handleSourceFilterChange(e.target.value)}
          placeholder="출처 필터 (예: SEOUL)"
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
              header: '반영 예정',
              accessor: (row) => {
                const count = collectUpdateItems(row).length;
                return count > 0 ? `${count}건` : '상세 확인';
              },
            },
            {
              header: '출처',
              accessor: (row) => row.source || '-',
            },
            {
              header: '구역/구',
              accessor: (row) => row.district || row.gu || '-',
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
                    title="서울시 원문 공고 페이지"
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
                    {row.status !== 'REVIEWING' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleUpdateStatus(row.id, 'REVIEWING')}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                      >
                        검토중
                      </button>
                    )}
                    {row.status !== 'APPLIED' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleUpdateStatus(row.id, 'APPLIED')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        반영완료
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
          onRowClick={openDetail}
          pagination={{
            currentPage: page,
            pageSize: PAGE_SIZE,
            totalItems: total,
            onPageChange: setPage,
          }}
        />
      </div>

      <Modal
        isOpen={!!selected}
        onClose={closeDetail}
        title="탐지 상세 · 사이트 반영 예정"
        size="2xl"
        footer={
          selected ? (
            <div className="flex flex-wrap justify-end gap-2">
              {selected.url ? (
                <a
                  href={String(selected.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  원문 열기
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              ) : null}
              {selected.status !== 'REVIEWING' && (
                <button
                  type="button"
                  disabled={updatingId === selected.id}
                  onClick={() => handleUpdateStatus(selected.id, 'REVIEWING')}
                  className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  검토중
                </button>
              )}
              {selected.status !== 'APPLIED' && (
                <button
                  type="button"
                  disabled={updatingId === selected.id}
                  onClick={() => handleUpdateStatus(selected.id, 'APPLIED')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  반영완료
                </button>
              )}
              {selected.status !== 'SKIPPED' && (
                <button
                  type="button"
                  disabled={updatingId === selected.id}
                  onClick={() => handleUpdateStatus(selected.id, 'SKIPPED')}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  제외
                </button>
              )}
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">상태</p>
                <p className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      statusBadgeMap[selected.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabelMap[selected.status] || selected.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-500">출처</p>
                <p className="font-medium mt-1">{selected.source || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500">제목</p>
                <p className="font-medium mt-1 break-words">
                  {selected.title || selected.projectName || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">공고일</p>
                <p className="font-medium mt-1">
                  {formatDateTime(selected.noticeDate || selected.publishedAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">탐지 시각</p>
                <p className="font-medium mt-1">
                  {formatDateTime(selected.detectedAt || selected.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                사이트 반영 예정 내용
              </h4>
              {selectedUpdates.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">사업/구역</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">현재 단계</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">반영 예정 단계</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">비고</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedUpdates.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <div className="font-medium text-gray-900">{getUpdateProjectLabel(item)}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {pickString(item, ['businessNumber', 'originalId', 'district', 'gu']) ||
                                ''}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{getUpdateFromStage(item)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getUpdateToStage(item)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {pickString(item, ['message', 'note', 'summary', 'action']) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                  서버 응답에 사업별 반영 예정 목록이 없습니다. 아래 요약/원본 데이터를 확인하거나,
                  백엔드에서 파싱된 업데이트 항목을 내려주도록 보완이 필요할 수 있습니다.
                </div>
              )}
            </div>

            {selectedText ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">탐지 요약 / 본문</h4>
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-800 max-h-64 overflow-y-auto">
                  {selectedText}
                </pre>
              </div>
            ) : null}

            <div>
              <button
                type="button"
                onClick={() => setShowRawJson((prev) => !prev)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showRawJson ? '원본 데이터 숨기기' : '원본 데이터(JSON) 보기'}
              </button>
              {showRawJson && (
                <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-slate-900 text-slate-100 p-3 text-xs max-h-80 overflow-auto">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NoticeDetectPage;
