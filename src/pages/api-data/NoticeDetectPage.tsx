import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { seoulNoticeCandidatesApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import useDebounce from '../../lib/useDebounce';
import type {
  NoticeCandidate,
  NoticeCandidateApplyResult,
  NoticeCandidateStatus,
  NoticeCandidateUpdateItem,
  NoticeFieldDiff,
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

const FIELD_LABELS: Record<string, string> = {
  newConstructionUnits: '신축세대수',
  rentalUnits: '임대세대수',
  totalSaleUnits: '분양세대총수',
  generalSaleUnits: '일반분양 세대수',
  newConstructionFloors: '지상층수',
  undergroundFloors: '지하층수',
  projectAreaM2: '정비구역면적(㎡)',
  residentialLandAreaM2: '택지면적(㎡)',
  buildingFloorAreaM2: '건축연면적(㎡)',
  buildingCoverageRatio: '건폐율(%)',
  volumeRatio: '용적률(%)',
  buildingHeight: '건물높이(m)',
  unitsUnder60M2: '60㎡ 이하 세대수',
  units60To85M2: '60~85㎡ 세대수',
  unitsOver85M2: '85㎡ 초과 세대수',
  ownerCount: '소유자수',
  usageZone: '용도지역',
  mainUsage: '주용도',
  businessType: '사업구분',
  constructionPlanNotes: '건축계획 비고',
  noticeContent: '고시 요약',
  currentStage: '진행단계',
  parkAreaM2: '공원면적(㎡)',
  publicOpenSpaceAreaM2: '공공공지면적(㎡)',
  otherAreaM2: '기타면적(㎡)',
};

const UPDATE_COLLECTION_KEYS = [
  'updates',
  'unmatchedUpdates',
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

const formatDiffValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const isFieldDiff = (value: unknown): value is NoticeFieldDiff => {
  const record = asRecord(value);
  if (!record) return false;
  return 'before' in record || 'after' in record;
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
        'publicRenovationDataId',
        'toStage',
        'newStage',
        'proposedStage',
        'targetStage',
        'currentStage',
      ]) !== '' ||
      !!record.fields ||
      record.unmatched === true;

    if (!nestedFound && looksLikeUpdate) {
      collected.push(record as NoticeCandidateUpdateItem);
    }
  };

  UPDATE_COLLECTION_KEYS.forEach((key) => {
    pushValue(candidate[key]);
  });

  return collected;
};

const getUpdateProjectLabel = (item: NoticeCandidateUpdateItem) =>
  pickString(item, ['renovationZoneName', 'projectName', 'name', 'title']) || '사업명 미상';

const getUpdateFromStage = (item: NoticeCandidateUpdateItem) =>
  pickString(item, ['fromStage', 'previousStage', 'oldStage', 'currentStage']) || '-';

const getUpdateToStage = (item: NoticeCandidateUpdateItem) =>
  pickString(item, ['toStage', 'newStage', 'proposedStage', 'targetStage']) || '-';

const getCandidateText = (candidate: NoticeCandidate) =>
  pickString(candidate, ['summary', 'content', 'body', 'rawContent', 'html']) || '';

const getChangedFields = (item: NoticeCandidateUpdateItem) => {
  const fields = item.fields;
  if (!fields || typeof fields !== 'object') return [] as Array<{
    key: string;
    label: string;
    before: string;
    after: string;
  }>;

  return Object.entries(fields)
    .map(([key, value]) => {
      if (isFieldDiff(value)) {
        const before = formatDiffValue(value.before);
        const after = formatDiffValue(value.after);
        if (before === after) return null;
        return {
          key,
          label: FIELD_LABELS[key] || key,
          before,
          after,
        };
      }

      // 단순 값만 온 경우: after로 취급
      if (value === null || value === undefined || value === '') return null;
      return {
        key,
        label: FIELD_LABELS[key] || key,
        before: '-',
        after: formatDiffValue(value),
      };
    })
    .filter((row): row is { key: string; label: string; before: string; after: string } => !!row);
};

const countUpdatePreview = (candidate: NoticeCandidate) => {
  const updates = collectUpdateItems(candidate);
  if (updates.length === 0) return 0;
  return updates.reduce((sum, item) => {
    const fieldCount = item.changedFieldCount ?? getChangedFields(item).length;
    const stageChanged = getUpdateFromStage(item) !== getUpdateToStage(item) ? 1 : 0;
    return sum + Math.max(fieldCount, 0) + (fieldCount === 0 ? stageChanged : 0);
  }, 0);
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
  const [showRawJson, setShowRawJson] = useState(false);
  const [applyResult, setApplyResult] = useState<NoticeCandidateApplyResult | null>(null);

  const selectedUpdates = useMemo(
    () => (selected ? collectUpdateItems(selected) : []),
    [selected]
  );
  const selectedText = useMemo(
    () => (selected ? getCandidateText(selected) : ''),
    [selected]
  );
  const matchedUpdates = useMemo(
    () => selectedUpdates.filter((item) => !item.unmatched),
    [selectedUpdates]
  );
  const unmatchedUpdates = useMemo(
    () => selectedUpdates.filter((item) => !!item.unmatched),
    [selectedUpdates]
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

  const openDetail = async (candidate: NoticeCandidate) => {
    setSelected(candidate);
    setShowRawJson(false);
    setApplyResult(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const detail = await seoulNoticeCandidatesApi.getCandidateById(candidate.id);
      setSelected(detail);
    } catch (err: any) {
      // 상세 API가 없거나 실패하면 목록 데이터로 모달 유지
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
    setShowRawJson(false);
    setApplyResult(null);
    setDetailError(null);
  };

  const handleUpdateStatus = async (id: string, status: NoticeCandidateStatus) => {
    const label = statusLabelMap[status];
    const confirmMessage =
      status === 'APPLIED'
        ? `이 탐지 건을 "${label}"로 처리할까요?\n\n매칭된 사업의 단계·신축/임대세대·층수·면적 등 변경값이 사이트 DB에 실제로 반영됩니다.`
        : `이 항목을 "${label}"(으)로 변경하시겠습니까?`;

    if (!confirm(confirmMessage)) return;

    setUpdatingId(id);
    setError(null);
    try {
      const result = await seoulNoticeCandidatesApi.updateStatus(id, status);
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
            message: result.message || '반영완료 처리되었습니다.',
          }
        );
        if (result.applyResult?.appliedCount != null) {
          alert(
            `반영 완료: ${result.applyResult.appliedCount}개 사업 적용` +
              (result.applyResult.unmatchedCount
                ? `\n미매칭: ${result.applyResult.unmatchedCount}건`
                : '')
          );
        }
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

  const renderUpdateCard = (item: NoticeCandidateUpdateItem, index: number) => {
    const changedFields = getChangedFields(item);
    const fromStage = getUpdateFromStage(item);
    const toStage = getUpdateToStage(item);

    return (
      <div
        key={`${item.publicRenovationDataId || item.projectName || 'update'}-${index}`}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium text-gray-900">{getUpdateProjectLabel(item)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {[
                pickString(item, ['district', 'gu']),
                pickString(item, ['businessNumber', 'originalId']),
                item.publicRenovationDataId ? `ID ${item.publicRenovationDataId}` : '',
              ]
                .filter(Boolean)
                .join(' · ') || '매칭 정보 없음'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {item.unmatched ? (
              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                미매칭
              </span>
            ) : null}
            <span className="text-gray-500">{fromStage}</span>
            <span className="text-gray-400">→</span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {toStage}
            </span>
          </div>
        </div>

        {changedFields.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">항목</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">현재</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">반영 예정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changedFields.map((field) => (
                  <tr key={field.key}>
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{field.label}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{field.before}</td>
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                      {field.after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500">
            {fromStage !== toStage
              ? '단계 변경만 예정되어 있습니다.'
              : '세부 수치 변경 항목이 없습니다.'}
          </div>
        )}

        {pickString(item, ['message', 'note', 'summary', 'action']) ? (
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
            {pickString(item, ['message', 'note', 'summary', 'action'])}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">탐지리스트</h1>
          <p className="text-gray-600 mt-1">
            서울시 공고/고시에서 자동 탐지된 후보를 검토하고, 통합심의 변경값을 사이트에 반영합니다.
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
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            <strong>상세</strong>에서 사업별 단계·신축/임대세대·층수·면적 등 before → after를 확인하세요.
          </li>
          <li>
            <strong>원문</strong>은 서울시 공고 페이지입니다.
          </li>
          <li>
            <strong>반영완료</strong>를 누르면 매칭된 사업 데이터가 사이트 DB에 실제로 반영됩니다.
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
              header: '반영 예정',
              accessor: (row) => {
                const updateCount = collectUpdateItems(row).length;
                const fieldCount = countUpdatePreview(row);
                if (updateCount === 0) return '-';
                return `${updateCount}개 사업` + (fieldCount > 0 ? ` · ${fieldCount}항목` : '');
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
          onRowClick={(row) => openDetail(row)}
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
                  disabled={updatingId === selected.id || detailLoading}
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
            {detailLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                상세 정보를 불러오는 중...
              </div>
            )}

            {detailError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
                {detailError}
              </div>
            )}

            {applyResult && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-sm">
                <p className="font-medium">반영 결과</p>
                <p className="mt-1">
                  {applyResult.message ||
                    `적용 ${applyResult.appliedCount ?? 0}건` +
                      (applyResult.unmatchedCount != null
                        ? ` · 미매칭 ${applyResult.unmatchedCount}건`
                        : '')}
                </p>
              </div>
            )}

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
                {matchedUpdates.length > 0 ? ` (${matchedUpdates.length}개 사업)` : ''}
              </h4>
              {matchedUpdates.length > 0 ? (
                <div className="space-y-4">{matchedUpdates.map(renderUpdateCard)}</div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                  매칭된 사업별 반영 예정 목록이 없습니다. 서버가 `updates` 배열을 내려주는지 확인해 주세요.
                </div>
              )}
            </div>

            {unmatchedUpdates.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  미매칭 사업 ({unmatchedUpdates.length})
                </h4>
                <div className="space-y-4">{unmatchedUpdates.map(renderUpdateCard)}</div>
              </div>
            )}

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
