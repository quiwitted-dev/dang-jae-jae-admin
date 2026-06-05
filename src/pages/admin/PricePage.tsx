import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adminApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ActionButton from '../../components/ActionButton';
import type {
  PriceGroupSummary,
  PriceGroupDetail,
  PriceCandidate,
  PriceCandidateStatus,
  PriceGroupListItemDTO,
  PriceGroupDetailDTO,
  PriceHistoryEntryDTO,
  PriceGroupStats,
  PriceGroupMetrics,
} from '../../types';
import useDebounce from '../../lib/useDebounce';

const formatCurrency = (price?: string | number | null) => {
  if (price === undefined || price === null) return '-';
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(numericPrice)) return '-';
  return `${numericPrice.toLocaleString()}억`;
};

const parseMetricNumber = (value?: string | number | null): number | null => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getLatestDate = (values: (string | null | undefined)[]): string | undefined => {
  const timestamps = values.filter((value): value is string => Boolean(value));
  if (!timestamps.length) return undefined;
  return timestamps.reduce((latest, current) => (current > latest ? current : latest));
};

const normalizeStats = (metrics?: PriceGroupMetrics): PriceGroupStats | undefined => {
  if (!metrics) return undefined;
  const stats: PriceGroupStats = {
    minPrice: parseMetricNumber(metrics.minPrice),
    maxPrice: parseMetricNumber(metrics.maxPrice),
    averagePrice: parseMetricNumber(metrics.avgPrice),
  };
  return stats.minPrice !== null || stats.maxPrice !== null || stats.averagePrice !== null
    ? stats
    : undefined;
};

const normalizeSummary = (
  dto: PriceGroupListItemDTO,
  options: { candidates?: PriceCandidate[]; history?: PriceHistoryEntryDTO[] | null } = {}
): PriceGroupSummary => {
  const candidates = options.candidates ?? [];
  const historyEntries = options.history ?? [];
  const metrics = dto.metrics;

  const candidateCount =
    metrics?.candidateCount ?? dto.candidateCount ?? candidates.length;
  const pendingCount =
    metrics?.pendingCount ?? dto.pendingCount ??
    candidates.filter((candidate) => candidate.status === 'PENDING').length;
  const lastSubmittedAt =
    metrics?.lastSubmittedAt ??
    dto.lastSubmittedAt ??
    getLatestDate(candidates.map((candidate) => candidate.createdAt));
  const lastDecidedAt =
    metrics?.lastDecidedAt ??
    dto.lastDecidedAt ??
    getLatestDate(historyEntries.map((entry) => entry.decidedAt));

  const displayedPrice =
    dto.currentDisplayedPrice ??
    candidates.find((candidate) => candidate.isDisplayed) ??
    null;

  return {
    groupId: dto.groupId,
    referenceId: dto.referenceId,
    referenceType: dto.dataType ?? 'PUBLIC_DATA',
    referenceName: dto.projectName ?? undefined,
    referenceAddress: dto.address ?? undefined,
    currentDisplayedPrice: displayedPrice ?? null,
    candidateCount,
    pendingCount,
    lastSubmittedAt: lastSubmittedAt ?? undefined,
    lastDecidedAt: lastDecidedAt ?? undefined,
    reviewerName: typeof dto.manager === 'object' && dto.manager !== null 
      ? dto.manager.nickname 
      : dto.manager ?? undefined,
    businessType: dto.businessType ?? undefined,
  };
};

const isDate = (value: unknown): value is Date => {
  return value instanceof Date;
};

const normalizeDetail = (dto: PriceGroupDetailDTO): PriceGroupDetail => {
  const candidates = Array.isArray(dto.candidates) ? dto.candidates : [];
  const historyDtos = Array.isArray(dto.history) ? dto.history : [];

  // candidates 정규화: Date 객체를 문자열로 변환하고 attachments 구조 확인
  const normalizedCandidates = candidates.map((candidate) => ({
    ...candidate,
    displayedAt: candidate.displayedAt 
      ? (isDate(candidate.displayedAt)
          ? candidate.displayedAt.toISOString() 
          : String(candidate.displayedAt))
      : null,
    createdAt: isDate(candidate.createdAt)
      ? candidate.createdAt.toISOString() 
      : String(candidate.createdAt),
    updatedAt: isDate(candidate.updatedAt)
      ? candidate.updatedAt.toISOString() 
      : String(candidate.updatedAt),
    // attachments가 배열이지만 PriceAttachment 형태가 아닐 수 있으므로 정규화
    attachments: Array.isArray(candidate.attachments) 
      ? candidate.attachments.map((att: any) => ({
          id: att.id || att.url || String(Math.random()),
          url: att.url || att,
          filename: att.filename || att.name || undefined,
        }))
      : candidate.attachments,
  }));

  const summary = normalizeSummary(dto, { candidates: normalizedCandidates, history: historyDtos });
  const stats = normalizeStats(dto.metrics);
  const history = historyDtos.map((entry) => {
    const priceId = entry.priceId || entry.renovationPriceId || entry.id || '';
    const priceSnapshot = entry.priceSnapshot;
    const minPrice = priceSnapshot?.minPrice 
      ? priceSnapshot.minPrice 
      : entry.minPrice 
        ? (typeof entry.minPrice === 'number' ? entry.minPrice.toString() : entry.minPrice) 
        : undefined;
    const maxPrice = priceSnapshot?.maxPrice 
      ? priceSnapshot.maxPrice 
      : entry.maxPrice 
        ? (typeof entry.maxPrice === 'number' ? entry.maxPrice.toString() : entry.maxPrice) 
        : undefined;
    const price = entry.price ? (typeof entry.price === 'number' ? entry.price.toString() : entry.price) : undefined;
    return {
      priceId,
      minPrice,
      maxPrice,
      price,
      status: entry.status,
      decidedAt: isDate(entry.decidedAt)
        ? entry.decidedAt.toISOString() 
        : String(entry.decidedAt),
      decidedBy: entry.decidedBy ?? undefined,
    };
  });

  return {
    summary,
    candidates: normalizedCandidates,
    stats,
    history,
  };
};

const statusBadgeMap: Record<PriceCandidateStatus, string> = {
  DISPLAYED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
  ON_HOLD: 'bg-gray-200 text-gray-700',
};

const statusLabelMap: Record<PriceCandidateStatus, string> = {
  DISPLAYED: '노출 중',
  PENDING: '대기',
  REJECTED: '반려',
  ON_HOLD: '보류',
};

const pageSize = 10;

const PricePage: React.FC = () => {
  const [groups, setGroups] = useState<PriceGroupSummary[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [totalGroups, setTotalGroups] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDetail, setGroupDetail] = useState<PriceGroupDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [dataTypeFilter, setDataTypeFilter] = useState<'ALL' | 'PUBLIC_DATA' | 'SUBMISSION'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_REVIEW' | 'DISPLAYED' | 'PENDING'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  const resetDetail = useCallback(() => {
    setGroupDetail(null);
    setSelectedCandidateId(null);
    setDetailError(null);
  }, []);

  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const response = await adminApi.getPriceGroups({
        page: currentPage,
        pageSize,
        dataType: dataTypeFilter === 'ALL' ? undefined : dataTypeFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        keyword: debouncedKeyword ? debouncedKeyword : undefined,
      });

      if (response.success && response.priceGroups) {
        const normalizedGroups = response.priceGroups.map((group) => normalizeSummary(group));
        setGroups(normalizedGroups);
        const totalCount = response.meta?.totalCount ?? normalizedGroups.length;
        setTotalGroups(totalCount);

        if (
          selectedGroupId &&
          !normalizedGroups.some((group) => group.groupId === selectedGroupId)
        ) {
          setSelectedGroupId(null);
          resetDetail();
        }
      } else {
        setGroups([]);
        setTotalGroups(0);
        setGroupsError(response.error || '가격 그룹을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setGroupsError('가격 그룹을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setGroupsLoading(false);
    }
  }, [currentPage, dataTypeFilter, statusFilter, debouncedKeyword, selectedGroupId, resetDetail]);

  const fetchGroupDetail = useCallback(
    async (groupId: string) => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const response = await adminApi.getPriceGroupDetail(groupId);
        if (response.success && response.priceGroup) {
          const normalizedDetail = normalizeDetail(response.priceGroup);
          setGroupDetail(normalizedDetail);
          setSelectedCandidateId((previousSelected) => {
            if (
              previousSelected &&
              normalizedDetail.candidates.some((candidate) => candidate.id === previousSelected)
            ) {
              return previousSelected;
            }
            return (
              normalizedDetail.summary.currentDisplayedPrice?.id ??
              normalizedDetail.candidates[0]?.id ??
              null
            );
          });
        } else {
          setGroupDetail(null);
          setDetailError(response.error || '가격 상세를 불러오는데 실패했습니다.');
          setSelectedCandidateId(null);
        }
      } catch (error) {
        setGroupDetail(null);
        setDetailError('가격 상세를 불러오는 중 오류가 발생했습니다.');
        setSelectedCandidateId(null);
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupDetail(selectedGroupId);
    } else {
      resetDetail();
    }
  }, [selectedGroupId, fetchGroupDetail]);

  const handleRefresh = () => {
    fetchGroups();
    if (selectedGroupId) {
      fetchGroupDetail(selectedGroupId);
    }
  };

  const handleSelectGroup = (group: PriceGroupSummary) => {
    if (group.groupId === selectedGroupId) {
      fetchGroupDetail(group.groupId);
      return;
    }
    setSelectedGroupId(group.groupId);
  };

  const handleDisplaySelected = async () => {
    if (!selectedGroupId || !selectedCandidateId) {
      alert('노출할 가격을 선택해주세요.');
      return;
    }

    if (!confirm('선택한 가격을 노출하시겠습니까? 기존 노출 가격은 이력으로 이동합니다.')) {
      return;
    }

    try {
      const response = await adminApi.setDisplayedPrice(selectedGroupId, selectedCandidateId);
      if (response.success) {
        alert('노출 가격이 업데이트되었습니다.');
        fetchGroupDetail(selectedGroupId);
        fetchGroups();
      } else {
        alert(response.error || '노출 가격 업데이트에 실패했습니다.');
      }
    } catch (error) {
      alert('노출 가격 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateStatus = async (status: Exclude<PriceCandidateStatus, 'DISPLAYED'>) => {
    if (!selectedCandidateId) {
      alert('처리할 가격을 선택해주세요.');
      return;
    }

    const memo = window.prompt('메모를 입력하세요 (선택 사항)');

    try {
      const response = await adminApi.updatePriceStatus(selectedCandidateId, {
        status,
        memo: memo || undefined,
      });

      if (response.success) {
        alert('가격 상태가 변경되었습니다.');
        if (selectedGroupId) {
          fetchGroupDetail(selectedGroupId);
        }
        fetchGroups();
      } else {
        alert(response.error || '가격 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      alert('가격 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const computedStats = useMemo(() => {
    if (!groupDetail) return null;

    if (groupDetail.stats) {
      return groupDetail.stats;
    }

    if (!groupDetail.candidates.length) {
      return null;
    }

    const prices = groupDetail.candidates
      .map((candidate) => {
        const minPrice = candidate.minPrice || candidate.price;
        const maxPrice = candidate.maxPrice || candidate.price;
        if (minPrice && maxPrice) {
          const min = parseFloat(minPrice);
          const max = parseFloat(maxPrice);
          return !Number.isNaN(min) && !Number.isNaN(max) ? (min + max) / 2 : null;
        }
        return null;
      })
      .filter((price): price is number => price !== null);

    if (!prices.length) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const averagePrice = Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length);

    return {
      minPrice,
      maxPrice,
      averagePrice,
    };
  }, [groupDetail]);

  const groupColumns = useMemo(
    () => [
      {
        header: '사업건',
        accessor: () => null as any,
        cell: (_value: any, group: PriceGroupSummary) => (
          <div>
            <p className="font-medium text-gray-900 truncate">{group.referenceName || group.referenceId}</p>
            {group.referenceAddress && (
              <p className="text-sm text-gray-500 truncate">{group.referenceAddress}</p>
            )}
          </div>
        ),
        className: 'max-w-xs'
      },
      {
        header: '현재 노출 가격',
        accessor: () => null as any,
        cell: (_value: any, row: PriceGroupSummary) => {
          const price = row.currentDisplayedPrice;
          if (!price) return <span className="text-gray-400">-</span>;
          const minPrice = price.minPrice || price.price;
          const maxPrice = price.maxPrice || price.price;
          return (
            <div>
              <p className="font-semibold text-gray-900">
                {minPrice === maxPrice 
                  ? formatCurrency(minPrice)
                  : `${formatCurrency(minPrice)} ~ ${formatCurrency(maxPrice)}`}
              </p>
              {price.user?.nickname && (
                <p className="text-xs text-gray-500">{price.user.nickname}</p>
              )}
            </div>
          );
        },
        className: 'w-40'
      },
      {
        header: '후보 수',
        accessor: (row: PriceGroupSummary) => row.candidateCount,
        className: 'w-20'
      },
      {
        header: '대기',
        accessor: (row: PriceGroupSummary) => row.pendingCount,
        cell: (value: number) => (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            {value}
          </span>
        ),
        className: 'w-20'
      },
      {
        header: '최근 업데이트',
        accessor: (row: PriceGroupSummary) => row.lastSubmittedAt || row.lastDecidedAt || '',
        cell: (value: string) => (value ? new Date(value).toLocaleString('ko-KR') : '-'),
        className: 'w-44'
      },
      {
        header: '담당자',
        accessor: (row: PriceGroupSummary) => row.reviewerName || '-',
        className: 'w-28 truncate'
      },
    ],
    []
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">가격 승인 관리</h1>
          <p className="text-gray-600 mt-1">사업건별 가격 후보를 검토하고 노출 대상을 지정합니다.</p>
        </div>
        <ActionButton action="refresh" label="새로고침" onClick={handleRefresh} />
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">데이터 타입</label>
              <select
                value={dataTypeFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setDataTypeFilter(event.target.value as 'ALL' | 'PUBLIC_DATA' | 'SUBMISSION');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">전체</option>
                <option value="PUBLIC_DATA">공공데이터</option>
                <option value="SUBMISSION">신청</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setStatusFilter(event.target.value as 'ALL' | 'NEEDS_REVIEW' | 'DISPLAYED' | 'PENDING');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">전체</option>
                <option value="NEEDS_REVIEW">추가 검토 필요</option>
                <option value="PENDING">대기</option>
                <option value="DISPLAYED">노출 중</option>
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">검색 (사업명, 주소)</label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSearchKeyword(event.target.value);
                }}
                placeholder="검색어를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {groupsError && (
          <div className="px-6 py-4 text-red-600 bg-red-50 border-b border-red-200">{groupsError}</div>
        )}

        <DataTable
          columns={groupColumns}
          data={groups}
          loading={groupsLoading}
          emptyMessage="가격 후보가 등록된 사업건이 없습니다."
          onRowClick={handleSelectGroup}
          pagination={{
            currentPage,
            pageSize,
            totalItems: totalGroups,
            onPageChange: (page) => {
              if (page < 1) return;
              if (page > Math.max(1, Math.ceil(totalGroups / pageSize))) return;
              setCurrentPage(page);
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {selectedGroupId ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {groupDetail?.summary.referenceName || groupDetail?.summary.referenceId || '선택된 사업건'}
                    </h2>
                    {groupDetail?.summary.referenceAddress && (
                      <p className="text-sm text-gray-600">{groupDetail.summary.referenceAddress}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {groupDetail?.summary.referenceType === 'PUBLIC_DATA' ? '공공데이터' : '신청'}
                    {groupDetail?.summary.businessType && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                        {groupDetail.summary.businessType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-gray-200">
                {detailLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                    데이터를 불러오는 중입니다.
                  </div>
                ) : detailError ? (
                  <div className="text-red-600">{detailError}</div>
                ) : groupDetail ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">현재 노출 가격</p>
                      {groupDetail.summary.currentDisplayedPrice ? (
                        <>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {(() => {
                              const price = groupDetail.summary.currentDisplayedPrice;
                              const minPrice = price.minPrice || price.price;
                              const maxPrice = price.maxPrice || price.price;
                              return minPrice === maxPrice
                                ? formatCurrency(minPrice)
                                : `${formatCurrency(minPrice)} ~ ${formatCurrency(maxPrice)}`;
                            })()}
                          </p>
                          {groupDetail.summary.currentDisplayedPrice.updatedAt && (
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(groupDetail.summary.currentDisplayedPrice.updatedAt).toLocaleString('ko-KR')}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400">노출된 가격이 없습니다.</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">후보 수</p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {groupDetail.candidates.length}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">대기 {groupDetail.candidates.filter((candidate) => candidate.status === 'PENDING').length}건</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">가격 범위</p>
                      {computedStats ? (
                        <div className="mt-2 text-sm text-gray-900 space-y-1">
                          <p>최소 {formatCurrency(computedStats.minPrice)}</p>
                          <p>최대 {formatCurrency(computedStats.maxPrice)}</p>
                          <p>평균 {formatCurrency(computedStats.averagePrice)}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">계산 가능한 가격 정보가 없습니다.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">사업건 상세를 선택하세요.</p>
                )}
              </div>

              <div className="px-6 py-4">
                {detailLoading ? (
                  <div className="flex justify-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
                    <span className="ml-2">후보 목록을 불러오는 중입니다.</span>
                  </div>
                ) : detailError ? (
                  <div className="text-red-600">{detailError}</div>
                ) : groupDetail && groupDetail.candidates.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선택</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록자</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메모</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">첨부</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {groupDetail.candidates.map((candidate: PriceCandidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <input
                                  type="radio"
                                  className="h-4 w-4 text-purple-600"
                                  name="candidate"
                                  checked={selectedCandidateId === candidate.id}
                                  onChange={() => setSelectedCandidateId(candidate.id)}
                                />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {(() => {
                                  const minPrice = candidate.minPrice || candidate.price;
                                  const maxPrice = candidate.maxPrice || candidate.price;
                                  return minPrice === maxPrice
                                    ? formatCurrency(minPrice)
                                    : `${formatCurrency(minPrice)} ~ ${formatCurrency(maxPrice)}`;
                                })()}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeMap[candidate.status]}`}
                                >
                                  {statusLabelMap[candidate.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {candidate.user?.nickname || candidate.submittedBy || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(candidate.createdAt).toLocaleString('ko-KR')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                                {candidate.memo ? (
                                  <span className="block truncate" title={candidate.memo}>
                                    {candidate.memo}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {Array.isArray(candidate.attachments) && candidate.attachments.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {candidate.attachments.map((attachment) => (
                                      <a
                                        key={attachment.id}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:underline truncate"
                                      >
                                        {attachment.filename || '첨부파일'}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-gray-50 py-4 px-6 rounded-lg">
                      <div className="flex flex-col gap-4 items-center">
                        <div className="text-sm text-gray-500">
                          {selectedCandidateId
                            ? (() => {
                                const candidate = groupDetail.candidates.find((c) => c.id === selectedCandidateId);
                                if (!candidate) return '노출 대상 가격을 선택하세요.';
                                const minPrice = candidate.minPrice || candidate.price;
                                const maxPrice = candidate.maxPrice || candidate.price;
                                const priceText = minPrice === maxPrice
                                  ? formatCurrency(minPrice)
                                  : `${formatCurrency(minPrice)} ~ ${formatCurrency(maxPrice)}`;
                                return `선택된 가격: ${priceText}`;
                              })()
                            : '노출 대상 가격을 선택하세요.'}
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center">
                          <button
                            onClick={handleDisplaySelected}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            선택 승인
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('REJECTED')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            선택 반려
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('ON_HOLD')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 border border-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                          >
                            보류 처리
                          </button>
                          <button
                            onClick={() => {
                              if (!groupDetail?.history || groupDetail.history.length === 0) {
                                alert('기록이 없습니다.');
                                return;
                              }
                              setIsHistoryModalOpen(true);
                            }}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                          >
                            기록 보기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-500">등록된 가격 후보가 없습니다.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white text-gray-500">
              사업건을 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">검토 가이드</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>등록 후 24시간 이내, 1억 이하 매물은 자동으로 유저 페이지에 노출됩니다.</li>
              <li>1. 사업건 리스트에서 후보 수와 대기 건수를 확인합니다.</li>
              <li>2. 상세 패널에서 가격 분포와 등록자 정보를 검토합니다.</li>
              <li>3. 노출할 가격을 선택한 뒤, 필요 시 반려 또는 보류로 처리합니다.</li>
              <li>4. 이전 결정 이력이 필요하면 기록 보기를 통해 확인합니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="가격 결정 이력"
        size="md"
      >
        <div className="space-y-4">
          {groupDetail?.history && groupDetail.history.length > 0 ? (
            groupDetail.history.map((history) => {
              const minPrice = history.minPrice || history.price;
              const maxPrice = history.maxPrice || history.price;
              const priceText = minPrice && maxPrice && minPrice === maxPrice
                ? formatCurrency(minPrice)
                : minPrice && maxPrice
                  ? `${formatCurrency(minPrice)} ~ ${formatCurrency(maxPrice)}`
                  : history.price
                    ? formatCurrency(history.price)
                    : '-';
              return (
                <div key={history.priceId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{priceText}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeMap[history.status]}`}
                    >
                      {statusLabelMap[history.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(history.decidedAt).toLocaleString('ko-KR')} · {history.decidedBy || '담당자 정보 없음'}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">표시할 이력이 없습니다.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PricePage;

