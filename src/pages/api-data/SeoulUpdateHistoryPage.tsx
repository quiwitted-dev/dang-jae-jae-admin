import React, { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { seoulUpdatesApi } from '../../api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import type { SeoulUpdateBatch, SeoulUpdateBatchDetail } from '../../types';

const statusLabelMap: Record<string, string> = {
  COMPLETED: '완료',
  SUCCESS: '완료',
  FAILED: '실패',
  PROCESSING: '처리 중',
  IN_PROGRESS: '처리 중',
  PARTIAL: '부분 완료',
};

const statusBadgeMap: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
};

const actionLabelMap: Record<string, string> = {
  INSERT: '추가',
  UPDATE: '수정',
  DELETE: '삭제',
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR');
};

const getBatchDate = (batch: SeoulUpdateBatch) =>
  batch.completedAt || batch.startedAt || batch.createdAt;

const SeoulUpdateHistoryPage: React.FC = () => {
  const [batches, setBatches] = useState<SeoulUpdateBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchDetail, setBatchDetail] = useState<SeoulUpdateBatchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await seoulUpdatesApi.getBatches();
      const sorted = [...data].sort((a, b) => {
        const aTime = new Date(getBatchDate(a) || 0).getTime();
        const bTime = new Date(getBatchDate(b) || 0).getTime();
        return bTime - aTime;
      });
      setBatches(sorted);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('업데이트 히스토리 API가 아직 배포되지 않았습니다. EC2 백엔드 배포가 필요합니다.');
      } else {
        setError(err?.response?.data?.error || err?.message || '배치 목록을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const openBatchDetail = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setBatchDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const detail = await seoulUpdatesApi.getBatchById(batchId);
      setBatchDetail(detail);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setDetailError('배치 상세 API가 아직 배포되지 않았습니다. EC2 백엔드 배포가 필요합니다.');
      } else {
        setDetailError(err?.response?.data?.error || err?.message || '배치 상세를 불러오지 못했습니다.');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeBatchDetail = () => {
    setSelectedBatchId(null);
    setBatchDetail(null);
    setDetailError(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">업데이트 히스토리</h1>
          <p className="text-gray-600 mt-1">서울시 정비사업 엑셀 업로드 및 데이터 갱신 이력을 확인합니다.</p>
        </div>
        <button
          onClick={fetchBatches}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
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
              header: '파일명',
              accessor: (row) => row.fileName || '-',
            },
            {
              header: '처리',
              accessor: (row) => row.processedCount ?? 0,
              className: 'text-right',
            },
            {
              header: '삭제',
              accessor: (row) => row.deletedCount ?? 0,
              className: 'text-right',
            },
            {
              header: '무시',
              accessor: (row) => row.ignoredCount ?? 0,
              className: 'text-right',
            },
            {
              header: '실행자',
              accessor: (row) => row.triggeredBy || '-',
            },
            {
              header: '완료 시각',
              accessor: (row) => formatDateTime(getBatchDate(row)),
            },
          ]}
          data={batches}
          loading={loading}
          emptyMessage="업데이트 이력이 없습니다."
          onRowClick={(row) => openBatchDetail(row.id)}
        />
      </div>

      <Modal
        isOpen={!!selectedBatchId}
        onClose={closeBatchDetail}
        title="배치 상세"
        size="xl"
      >
        {detailLoading && (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
            상세 정보를 불러오는 중...
          </div>
        )}

        {detailError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p>{detailError}</p>
          </div>
        )}

        {!detailLoading && !detailError && batchDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">상태</p>
                <p className="font-medium mt-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      statusBadgeMap[batchDetail.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabelMap[batchDetail.status] || batchDetail.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-500">파일명</p>
                <p className="font-medium mt-1">{batchDetail.fileName || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">시작</p>
                <p className="font-medium mt-1">{formatDateTime(batchDetail.startedAt || batchDetail.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">완료</p>
                <p className="font-medium mt-1">{formatDateTime(batchDetail.completedAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">실행자</p>
                <p className="font-medium mt-1">{batchDetail.triggeredBy || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">출처</p>
                <p className="font-medium mt-1">{batchDetail.source || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{batchDetail.processedCount ?? 0}</div>
                <div className="text-xs text-blue-600 mt-1">처리</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">{batchDetail.deletedCount ?? 0}</div>
                <div className="text-xs text-red-600 mt-1">삭제</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-700">{batchDetail.ignoredCount ?? 0}</div>
                <div className="text-xs text-gray-600 mt-1">무시</div>
              </div>
            </div>

            {batchDetail.errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
                {batchDetail.errorMessage}
              </div>
            )}

            {batchDetail.errors && batchDetail.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">오류 목록</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {batchDetail.errors.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {batchDetail.changes && batchDetail.changes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">변경 내역</h4>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">작업</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">사업번호</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">사업명</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">메모</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {batchDetail.changes.map((change, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{actionLabelMap[change.action] || change.action}</td>
                          <td className="px-4 py-2">{change.businessNumber || '-'}</td>
                          <td className="px-4 py-2">{change.projectName || '-'}</td>
                          <td className="px-4 py-2">{change.message || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SeoulUpdateHistoryPage;
