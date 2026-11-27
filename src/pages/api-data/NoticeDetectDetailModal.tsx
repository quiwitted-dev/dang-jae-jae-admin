import React, { useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { seoulNoticeCandidatesApi } from '../../api';
import Modal from '../../components/Modal';
import useDebounce from '../../lib/useDebounce';
import type {
  NoticeCandidate,
  NoticeCandidateApplyResult,
  NoticeCandidateStatus,
  NoticeCandidateUpdateItem,
  NoticeFieldDiff,
  NoticeSiteSearchItem,
} from '../../types';

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
  ownerCount: '소유자수',
};

const EDITABLE_FIELD_KEYS = Object.keys(FIELD_LABELS);

const STAGE_OPTIONS = [
  '통합심의통과',
  '조합설립인가',
  '사업시행인가',
  '관리처분인가',
  '착공',
  '정비구역지정',
  '추진위원회승인',
];

const UPDATE_COLLECTION_KEYS = [
  'updates',
  'unmatchedUpdates',
  'changes',
  'proposedChanges',
  'parsedItems',
  'parsedProjects',
  'projects',
  'matches',
  'items',
  'targets',
  'results',
  'siteUpdates',
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

const getCandidateText = (candidate: NoticeCandidate) =>
  pickString(candidate, ['content', 'summary', 'body', 'rawContent', 'html']) || '';

const normalizeFields = (
  fields?: NoticeCandidateUpdateItem['fields']
): Record<string, NoticeFieldDiff> => {
  const next: Record<string, NoticeFieldDiff> = {};
  if (!fields) return next;
  Object.entries(fields).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const diff = value as NoticeFieldDiff;
      next[key] = {
        before: diff.before ?? null,
        after: diff.after ?? null,
      };
    } else if (value !== undefined) {
      next[key] = { before: null, after: value as string | number | null };
    }
  });
  return next;
};

export const collectUpdateItems = (candidate: NoticeCandidate): NoticeCandidateUpdateItem[] => {
  const collected: NoticeCandidateUpdateItem[] = [];

  const pushValue = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        const record = asRecord(entry);
        if (record) collected.push(record as NoticeCandidateUpdateItem);
      });
      return;
    }
    const record = asRecord(value);
    if (!record) return;
    let nested = false;
    for (const key of UPDATE_COLLECTION_KEYS) {
      if (Array.isArray(record[key])) {
        nested = true;
        pushValue(record[key]);
      }
    }
    if (!nested) collected.push(record as NoticeCandidateUpdateItem);
  };

  UPDATE_COLLECTION_KEYS.forEach((key) => pushValue(candidate[key]));
  return collected;
};

const toEditableUpdates = (candidate: NoticeCandidate): NoticeCandidateUpdateItem[] =>
  collectUpdateItems(candidate).map((item) => ({
    ...item,
    fromStage:
      pickString(item, ['fromStage', 'previousStage', 'oldStage', 'currentStage']) ||
      item.fromStage ||
      '',
    toStage:
      pickString(item, ['toStage', 'newStage', 'proposedStage', 'targetStage']) ||
      item.toStage ||
      '통합심의통과',
    renovationZoneName:
      pickString(item, ['renovationZoneName', 'projectName', 'name', 'title']) ||
      item.renovationZoneName ||
      '',
    fields: normalizeFields(item.fields),
  }));

const siteToUpdateItem = (site: NoticeSiteSearchItem): NoticeCandidateUpdateItem => {
  const fields: Record<string, NoticeFieldDiff> = {};
  EDITABLE_FIELD_KEYS.forEach((key) => {
    const current = site[key];
    if (current !== undefined && current !== null && current !== '') {
      fields[key] = { before: current as string | number, after: current as string | number };
    } else {
      fields[key] = { before: null, after: null };
    }
  });

  return {
    publicRenovationDataId: site.id,
    renovationZoneName:
      site.renovationZoneName || site.projectName || site.address || '선택한 사업',
    projectName: site.projectName,
    district: site.district,
    originalId: site.originalId,
    businessNumber: site.businessNumber || site.originalId,
    fromStage: site.currentStage || '',
    toStage: '통합심의통과',
    fields,
  };
};

interface NoticeDetectDetailModalProps {
  candidate: NoticeCandidate | null;
  loading?: boolean;
  detailError?: string | null;
  applyResult?: NoticeCandidateApplyResult | null;
  updating?: boolean;
  onClose: () => void;
  onCandidateChange: (candidate: NoticeCandidate) => void;
  onStatusChange: (
    id: string,
    status: NoticeCandidateStatus,
    options?: { content?: string; updates?: NoticeCandidateUpdateItem[] }
  ) => Promise<void>;
}

const NoticeDetectDetailModal: React.FC<NoticeDetectDetailModalProps> = ({
  candidate,
  loading = false,
  detailError = null,
  applyResult = null,
  updating = false,
  onClose,
  onCandidateChange,
  onStatusChange,
}) => {
  const [content, setContent] = useState('');
  const [updates, setUpdates] = useState<NoticeCandidateUpdateItem[]>([]);
  const [savingContent, setSavingContent] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [siteQuery, setSiteQuery] = useState('');
  const debouncedSiteQuery = useDebounce(siteQuery, 350);
  const [siteResults, setSiteResults] = useState<NoticeSiteSearchItem[]>([]);
  const [siteSearching, setSiteSearching] = useState(false);

  useEffect(() => {
    if (!candidate) return;
    setContent(getCandidateText(candidate));
    setUpdates(toEditableUpdates(candidate));
    setLocalError(null);
  }, [candidate?.id, candidate?.updatedAt, candidate?.status]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debouncedSiteQuery.trim()) {
        setSiteResults([]);
        return;
      }
      setSiteSearching(true);
      try {
        const results = await seoulNoticeCandidatesApi.searchSites(debouncedSiteQuery);
        if (!cancelled) setSiteResults(results);
      } catch (err: any) {
        if (!cancelled) {
          setSiteResults([]);
          setLocalError(err?.response?.data?.error || err?.message || '사업 검색에 실패했습니다.');
        }
      } finally {
        if (!cancelled) setSiteSearching(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedSiteQuery]);

  const statusLabel = useMemo(() => {
    if (!candidate) return '';
    const map: Record<string, string> = {
      NEW: '신규',
      REVIEWING: '검토중',
      APPLIED: '반영완료',
      SKIPPED: '제외',
    };
    return map[candidate.status] || candidate.status;
  }, [candidate]);

  if (!candidate) return null;

  const busy = updating || savingContent || savingDraft || uploading;

  const updateItemField = (index: number, patch: Partial<NoticeCandidateUpdateItem>) => {
    setUpdates((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const updateItemDiff = (
    index: number,
    fieldKey: string,
    side: 'before' | 'after',
    value: string
  ) => {
    setUpdates((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const fields = normalizeFields(item.fields);
        const current = fields[fieldKey] || { before: null, after: null };
        fields[fieldKey] = {
          ...current,
          [side]: value === '' ? null : value,
        };
        return { ...item, fields };
      })
    );
  };

  const removeUpdate = (index: number) => {
    setUpdates((prev) => prev.filter((_, i) => i !== index));
  };

  const addSite = (site: NoticeSiteSearchItem) => {
    setUpdates((prev) => {
      if (prev.some((item) => item.publicRenovationDataId === site.id)) return prev;
      return [...prev, siteToUpdateItem(site)];
    });
    setSiteQuery('');
    setSiteResults([]);
  };

  const handleSaveAndParse = async () => {
    setSavingContent(true);
    setLocalError(null);
    try {
      const updated = await seoulNoticeCandidatesApi.saveContent(candidate.id, content, {
        parse: true,
        status: 'REVIEWING',
      });
      if (updated) {
        onCandidateChange(updated);
        setUpdates(toEditableUpdates(updated));
        setContent(getCandidateText(updated) || content);
      }
    } catch (err: any) {
      setLocalError(err?.response?.data?.error || err?.message || '원문 저장/파싱에 실패했습니다.');
    } finally {
      setSavingContent(false);
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setLocalError(null);
    try {
      const updated = await seoulNoticeCandidatesApi.uploadContentFile(candidate.id, file, {
        parse: true,
      });
      if (updated) {
        onCandidateChange(updated);
        setUpdates(toEditableUpdates(updated));
        setContent(getCandidateText(updated) || content);
      }
    } catch (err: any) {
      // 서버 업로드 실패 시 텍스트 파일은 로컬로 읽어 붙여넣기란에 채움
      const status = err?.response?.status;
      if (file.type.startsWith('text/') || /\.(txt|csv|md)$/i.test(file.name)) {
        try {
          const text = await file.text();
          setContent(text);
          setLocalError(
            '파일 업로드 API 응답이 없어 텍스트만 불러왔습니다. [원문 저장·파싱]을 눌러 주세요.'
          );
        } catch {
          setLocalError(err?.response?.data?.error || err?.message || '파일 처리에 실패했습니다.');
        }
      } else if (status === 404) {
        setLocalError(
          '서버 파일 업로드 API가 아직 없거나 경로가 다릅니다. 원문 텍스트를 복사해 붙여넣기 후 [원문 저장·파싱]을 사용해 주세요.'
        );
      } else {
        setLocalError(err?.response?.data?.error || err?.message || '파일 업로드에 실패했습니다.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setLocalError(null);
    try {
      const updated = await seoulNoticeCandidatesApi.saveUpdatesDraft(
        candidate.id,
        updates,
        content
      );
      if (updated) onCandidateChange(updated);
      alert('검토중 초안이 저장되었습니다.');
    } catch (err: any) {
      setLocalError(err?.response?.data?.error || err?.message || '초안 저장에 실패했습니다.');
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <Modal
      isOpen={!!candidate}
      onClose={onClose}
      title="탐지 상세 · 확인 후 반영"
      size="2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          {candidate.url ? (
            <a
              href={String(candidate.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              원문 열기
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          ) : null}
          {candidate.status !== 'SKIPPED' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onStatusChange(candidate.id, 'SKIPPED')}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              제외
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {savingDraft ? '저장 중...' : '초안 저장'}
          </button>
          {candidate.status !== 'APPLIED' && (
            <button
              type="button"
              disabled={busy || updates.length === 0}
              onClick={() =>
                onStatusChange(candidate.id, 'APPLIED', {
                  content,
                  updates,
                })
              }
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? '반영 중...' : '반영하기'}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
            상세 정보를 불러오는 중...
          </div>
        )}

        {(detailError || localError) && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
            {localError || detailError}
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
            <p className="font-medium mt-1">{statusLabel}</p>
          </div>
          <div>
            <p className="text-gray-500">출처</p>
            <p className="font-medium mt-1">{candidate.source || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">제목</p>
            <p className="font-medium mt-1 break-words">
              {candidate.title || candidate.projectName || '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">공고일</p>
            <p className="font-medium mt-1">
              {formatDateTime(candidate.noticeDate || candidate.publishedAt)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">탐지 시각</p>
            <p className="font-medium mt-1">
              {formatDateTime(candidate.detectedAt || candidate.createdAt)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">1) 원문 내용 보완</h4>
          <p className="text-xs text-gray-500 mb-2">
            자동 파싱이 부족하면 원문 텍스트를 붙여넣거나 문서를 올린 뒤 저장·파싱하세요.
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            placeholder="원문 내용을 붙여넣으세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              파일 선택
              <input
                type="file"
                className="hidden"
                accept=".pdf,.hwp,.hwpx,.txt,.csv,.doc,.docx,image/*"
                onChange={(e) => handleUpload(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              disabled={busy || !content.trim()}
              onClick={handleSaveAndParse}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {savingContent || uploading ? '처리 중...' : '원문 저장·파싱'}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-gray-900">
              2) 반영할 사업·변경값 ({updates.length})
            </h4>
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={siteQuery}
              onChange={(e) => setSiteQuery(e.target.value)}
              placeholder="사업명/구역명으로 검색해 추가"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {siteSearching && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                검색 중...
              </p>
            )}
            {siteResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                {siteResults.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => addSite(site)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">
                      {site.renovationZoneName || site.projectName || site.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {[site.district, site.currentStage, site.address].filter(Boolean).join(' · ')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {updates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              아직 반영할 사업이 없습니다. 원문 파싱을 하거나, 위에서 사업을 검색해 추가하세요.
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((item, index) => (
                <div key={`${item.publicRenovationDataId || 'u'}-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={String(item.renovationZoneName || item.projectName || '')}
                        onChange={(e) =>
                          updateItemField(index, {
                            renovationZoneName: e.target.value,
                            projectName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
                        placeholder="사업/구역명"
                      />
                      <div className="text-xs text-gray-500">
                        {[
                          item.district,
                          item.businessNumber || item.originalId,
                          item.publicRenovationDataId
                            ? `ID ${item.publicRenovationDataId}`
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' · ') || '매칭 ID 없음'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUpdate(index)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="이 사업 제거"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">현재 단계</label>
                      <input
                        type="text"
                        value={String(item.fromStage || '')}
                        onChange={(e) => updateItemField(index, { fromStage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">반영 예정 단계</label>
                      <select
                        value={String(item.toStage || '')}
                        onChange={(e) => updateItemField(index, { toStage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">선택</option>
                        {STAGE_OPTIONS.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">항목</th>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">현재</th>
                          <th className="px-3 py-2 text-left text-gray-500 font-medium">반영값</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {EDITABLE_FIELD_KEYS.map((fieldKey) => {
                          const diff = normalizeFields(item.fields)[fieldKey] || {
                            before: null,
                            after: null,
                          };
                          return (
                            <tr key={fieldKey}>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                {FIELD_LABELS[fieldKey]}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={diff.before ?? ''}
                                  onChange={(e) =>
                                    updateItemDiff(index, fieldKey, 'before', e.target.value)
                                  }
                                  className="w-full min-w-[90px] px-2 py-1 border border-gray-200 rounded text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={diff.after ?? ''}
                                  onChange={(e) =>
                                    updateItemDiff(index, fieldKey, 'after', e.target.value)
                                  }
                                  className="w-full min-w-[90px] px-2 py-1 border border-gray-200 rounded text-sm"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setUpdates((prev) => [
                ...prev,
                {
                  renovationZoneName: '',
                  fromStage: '',
                  toStage: '통합심의통과',
                  fields: EDITABLE_FIELD_KEYS.reduce<Record<string, NoticeFieldDiff>>((acc, key) => {
                    acc[key] = { before: null, after: null };
                    return acc;
                  }, {}),
                },
              ])
            }
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusIcon className="h-4 w-4" />
            빈 사업 행 추가
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NoticeDetectDetailModal;
